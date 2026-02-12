# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    """
    Product model - stores unique products and their inventory count
    """
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.Integer, nullable=False)
    count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to scan history
    scans = db.relationship('ScanHistory', backref='product', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert product to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'classId': self.class_id,
            'count': self.count,
            'createdAt': self.created_at.isoformat(),
            'lastUpdated': self.last_updated.isoformat()
        }
    
    def __repr__(self):
        return f'<Product {self.name} (Count: {self.count})>'


class ScanHistory(db.Model):
    """
    ScanHistory model - records every scan for analytics
    """
    __tablename__ = 'scan_history'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert scan to dictionary for JSON response"""
        return {
            'id': self.id,
            'productId': self.product_id,
            'productName': self.product.name,
            'confidence': round(self.confidence * 100, 2),  # Convert to percentage
            'scannedAt': self.scanned_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Scan {self.id}: {self.product.name} ({self.confidence:.2%})>'