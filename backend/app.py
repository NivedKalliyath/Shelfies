from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64
import os
from dotenv import load_dotenv
from config import config
from models import db, Product, ScanHistory
from utils import get_category_from_class_id

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Initialize extensions
db.init_app(app)
CORS(app, origins=app.config['CORS_ORIGINS'])

# Load YOLO model
print(f"Loading YOLO model from: {app.config['MODEL_PATH']}")
model = YOLO(app.config['MODEL_PATH'], task='detect')
print(f"Model loaded with {len(model.names)} classes")


def preprocess_image(image_data):
    """Decode a base64 image and return a PIL Image in RGB."""
    try:
        # Handle data URL format (data:image/jpeg;base64,...)
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")


def get_prediction(image):
    """Run inference using YOLOv8 and return the best prediction."""
    results = model(image, conf=app.config['DETECTION_CONFIDENCE_THRESHOLD'])
    result = results[0]
    
    if len(result.boxes) == 0:
        return None
    
    # Get the detection with highest confidence
    import numpy as np
    confidences = result.boxes.conf.cpu().numpy()
    class_ids = result.boxes.cls.cpu().numpy().astype(int)
    max_conf_idx = np.argmax(confidences)
    
    return {
        'class_id': int(class_ids[max_conf_idx]),
        'confidence': float(confidences[max_conf_idx])
    }


@app.route('/api/detect', methods=['POST'])
def detect_product():
    """
    Detect product from image and update inventory
    
    Expected JSON: { "image": "base64_encoded_image_data" }
    Returns: Product details and updated count
    """
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400

        # Process image and get prediction
        image = preprocess_image(image_data)
        prediction = get_prediction(image)
        
        if not prediction:
            return jsonify({'error': 'No objects detected in image'}), 400

        class_id = prediction['class_id']
        confidence = prediction['confidence']
        
        # Get product name and category
        product_name = model.names[class_id]
        category = get_category_from_class_id(class_id)
        
        # Update or create product in database
        product = Product.query.filter_by(name=product_name).first()
        
        if product:
            # Product exists, increment count
            product.count += 1
        else:
            # New product, create entry
            product = Product(
                name=product_name,
                category=category,
                class_id=class_id,
                count=1
            )
            db.session.add(product)
        
        # Commit product changes to get the ID
        db.session.commit()
        
        # Record scan in history
        scan = ScanHistory(
            product_id=product.id,
            confidence=confidence
        )
        db.session.add(scan)
        db.session.commit()
        
        print(f"Detected: {product_name} (Confidence: {confidence:.2%}, Count: {product.count})")
        
        return jsonify({
            'success': True,
            'classId': class_id,
            'productName': product_name,
            'category': category,
            'confidence': round(confidence * 100, 2),  # Return as percentage
            'currentCount': product.count,
            'productId': product.id
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error in detection: {str(e)}")
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@app.route('/api/products', methods=['GET'])
def get_products():
    """
    Get all products from inventory
    
    Query params:
        - category: Filter by category (optional)
        - search: Search by product name (optional)
    """
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Product.query
        
        # Apply filters
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))
        
        # Order by last updated (most recent first)
        products = query.order_by(Product.last_updated.desc()).all()
        
        return jsonify({
            'success': True,
            'count': len(products),
            'products': [p.to_dict() for p in products]
        }), 200
        
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'error': 'Failed to fetch products'}), 500


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({
            'success': True,
            'product': product.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Product not found'}), 404


@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """
    Update product details
    
    Expected JSON: { "count": 10 } or { "name": "New Name" }
    """
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        
        # Update allowed fields
        if 'count' in data:
            product.count = max(0, int(data['count']))  # Ensure non-negative
        
        if 'name' in data:
            product.name = data['name']
        
        db.session.commit()
        
        print(f"Updated product: {product.name} (Count: {product.count})")
        
        return jsonify({
            'success': True,
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating product: {str(e)}")
        return jsonify({'error': 'Failed to update product'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Get inventory statistics
    
    Returns:
        - Total product count (sum of all counts)
        - Unique products
        - Number of categories
        - Low stock items
        - Scans today
    """
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Total products (sum of all counts)
        total_count = db.session.query(func.sum(Product.count)).scalar() or 0
        
        # Unique products
        unique_products = Product.query.count()
        
        # Categories
        categories = db.session.query(Product.category).distinct().count()
        
        # Low stock items (count <= 5)
        low_stock_threshold = 5
        low_stock = Product.query.filter(Product.count <= low_stock_threshold).count()
        
        # Scans today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        scans_today = ScanHistory.query.filter(ScanHistory.scanned_at >= today_start).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'totalProducts': int(total_count),
                'uniqueProducts': unique_products,
                'categories': categories,
                'lowStock': low_stock,
                'scannedToday': scans_today
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500


@app.route('/api/history', methods=['GET'])
def get_scan_history():
    """
    Get scan history with optional filters
    
    Query params:
        - limit: Number of records (default: 50)
        - product_id: Filter by product
    """
    try:
        limit = int(request.args.get('limit', 50))
        product_id = request.args.get('product_id')
        
        query = ScanHistory.query
        
        if product_id:
            query = query.filter_by(product_id=int(product_id))
        
        scans = query.order_by(ScanHistory.scanned_at.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'count': len(scans),
            'history': [s.to_dict() for s in scans]
        }), 200
        
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        return jsonify({'error': 'Failed to fetch scan history'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'model': 'loaded',
        'classes': len(model.names)
    }), 200


# Create database tables on first run
with app.app_context():
    db.create_all()
    print("Database tables ready")


if __name__ == '__main__':
    app.run(
        debug=app.config['DEBUG'],
        host='0.0.0.0',
        port=5000
    )