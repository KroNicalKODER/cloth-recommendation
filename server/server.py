from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS 
import json
import cv2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os
from werkzeug.utils import secure_filename
from PIL import Image
import time

app = Flask(__name__)
CORS(app)

# Load mean_std_stats from JSON file for size prediction
with open('data.json', 'r') as f:
    mean_std_stats = json.load(f)

# Load the trained skin tone model
skin_tone_model = load_model('models/SkinToneModel.h5')

# Class labels for skin tone
class_labels = ['Dark_deep', 'Fair_light', 'Medium_tone']

# Load models for gender and age detection
faceProto = 'models/AgeAndGender/opencv_face_detector.pbtxt'
faceModel = 'models/AgeAndGender/opencv_face_detector_uint8.pb'
ageProto = 'models/AgeAndGender/age_deploy.prototxt'
ageModel = 'models/AgeAndGender/age_net.caffemodel'
genderProto = 'models/AgeAndGender/gender_deploy.prototxt'
genderModel = 'models/AgeAndGender/gender_net.caffemodel'

genderList = ['Male', 'Female']
ageList = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']

faceNet = cv2.dnn.readNet(faceModel, faceProto)
ageNet = cv2.dnn.readNet(ageModel, ageProto)
genderNet = cv2.dnn.readNet(genderModel, genderProto)

def predict_size(age, height, weight):
    size_predictions = {}
    age = int(age)
    height = int(height)
    weight = int(weight)
    for size_type in mean_std_stats:
        mean = mean_std_stats[size_type]['mean']
        std = mean_std_stats[size_type]['std']

        # Standardize new data point for this size_type
        z_age = (age - mean['age']) / std['age']
        z_height = (height - mean['height']) / std['height']
        z_weight = (weight - mean['weight']) / std['weight']

        # Calculate z-score deviation from mean
        size_predictions[size_type] = np.sqrt(z_age**2 + z_height**2 + z_weight**2)
    
    # Determine the size type with the smallest z-score deviation
    predicted_size = min(size_predictions, key=size_predictions.get)
    return predicted_size

def classify_skin_tone(image_path, model):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array /= 255.0  # Rescale image
    predictions = model.predict(img_array)
    class_idx = np.argmax(predictions, axis=1)[0]
    return class_labels[class_idx]

def detectFace(net, frame, confidence_threshold=0.7):
    frameOpencvDNN = frame.copy()
    frameHeight = frameOpencvDNN.shape[0]
    frameWidth = frameOpencvDNN.shape[1]
    blob = cv2.dnn.blobFromImage(frameOpencvDNN, 1.0, (227, 227), [124.96, 115.97, 106.13], swapRB=True, crop=False)
    net.setInput(blob)
    detections = net.forward()
    faceBoxes = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            x1 = int(detections[0, 0, i, 3] * frameWidth)
            y1 = int(detections[0, 0, i, 4] * frameHeight)
            x2 = int(detections[0, 0, i, 5] * frameWidth)
            y2 = int(detections[0, 0, i, 6] * frameHeight)
            faceBoxes.append([x1, y1, x2, y2])
            cv2.rectangle(frameOpencvDNN, (x1, y1), (x2, y2), (0, 255, 0), int(round(frameHeight / 150)), 8)
    return frameOpencvDNN, faceBoxes

@app.route('/predict_size', methods=['POST'])
def predict_size_route():
    data = request.get_json()
    age = data.get('age')
    height = data.get('height')
    weight = data.get('weight')
    predicted_size = predict_size(age, height, weight)
    return jsonify({'predicted_size': predicted_size})

@app.route('/predict_skin_tone', methods=['POST'])
def predict_skin_tone_route():
    data = request.get_json()
    image_path = data.get('image_path')
    if image_path:
        predicted_skin_tone = classify_skin_tone(image_path, skin_tone_model)
        return jsonify({'predicted_skin_tone': predicted_skin_tone})
    else:
        return jsonify({'error': 'Image path not provided'}), 400

@app.route('/predict_gender_age', methods=['POST'])
def predict_gender_age_route():
    data = request.get_json()
    image_path = data.get('image_path')
    
    if not image_path:
        return jsonify({'error': 'Image path not provided'}), 400
    
    img = np.array(Image.open(image_path).convert('RGB'))
    
    resultImg, faceBoxes = detectFace(faceNet, img)
    
    if not faceBoxes:
        return jsonify({'error': 'No face detected'}), 404
    
    predictions = []
    padding = 20
    
    for faceBox in faceBoxes:
        face = img[max(0, faceBox[1] - padding):min(faceBox[3] + padding, img.shape[0] - 1),
                   max(0, faceBox[0] - padding):min(faceBox[2] + padding, img.shape[1] - 1)]
        blob = cv2.dnn.blobFromImage(face, 1.0, (227, 227), [124.96, 115.97, 106.13], swapRB=True, crop=False)
        
        # Gender prediction
        genderNet.setInput(blob)
        genderPreds = genderNet.forward()
        gender = genderList[genderPreds[0].argmax()]
        
        # Age prediction
        ageNet.setInput(blob)
        agePreds = ageNet.forward()
        age = ageList[agePreds[0].argmax()]
        
        predictions.append({'gender': gender, 'age': age})
    
    return jsonify(predictions)

# Set up the folder where uploaded images will be stored
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload_image', methods=['POST'])
def upload_image():
    unique_id = str(int(time.time() * 1000))
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({'url': file_path})

    return jsonify({'error': 'An unknown error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True)
