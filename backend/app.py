from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the YOLOv8 model
model = YOLO('backend\best.pt', task='detect')

def preprocess_image(image_data):
    """Decode a base64 image and return a PIL Image in RGB."""
    image_bytes = base64.b64decode(image_data.split(',')[1])
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != 'RGB':
        image = image.convert('RGB')
    return image

def get_prediction(image):
    """Run inference using YOLOv8 and return the best prediction."""
    results = model(image, conf=0.1)
    result = results[0]
    if len(result.boxes) == 0:
        return None
    confidences = result.boxes.conf.cpu().numpy()
    class_ids = result.boxes.cls.cpu().numpy().astype(int)
    max_conf_idx = np.argmax(confidences)
    return {
        'class_id': int(class_ids[max_conf_idx]),
        'confidence': float(confidences[max_conf_idx])
    }

@app.route('/api/detect', methods=['POST'])
def detect_product():
    data = request.json
    image_data = data.get('image')
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400

    image = preprocess_image(image_data)
    prediction = get_prediction(image)
    if not prediction:
        return jsonify({'error': 'No objects detected'}), 400

    class_id = prediction['class_id']
    confidence = prediction['confidence']

    # Get product name from model's names dictionary
    product_name = model.names[class_id]

    return jsonify({
        'classId': class_id,
        'productName': product_name,
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)