import cv2
import numpy as np
from pathlib import Path
from typing import Optional
from transformers import pipeline
from ultralytics import YOLO
from sentence_transformers import SentenceTransformer

# Global models (lazy load)
yolo_model = None
bert_classifier = None
severity_model = None

BASE_DIR = Path(__file__).resolve().parents[1]
YOLO_MODEL_PATH = BASE_DIR / "yolov8n.pt"


def load_models():
    global yolo_model, bert_classifier, severity_model
    try:
        if not YOLO_MODEL_PATH.exists():
            raise FileNotFoundError(f"YOLO model not found at {YOLO_MODEL_PATH}")

        # YOLOv8 for issue detection
        yolo_model = YOLO(str(YOLO_MODEL_PATH))

        # BERT zero-shot classification for severity
        bert_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

        # SentenceTransformer for text embedding
        severity_model = SentenceTransformer('all-MiniLM-L6-v2')

        print("AI models loaded successfully.")
    except Exception as e:
        print(f"Model load error: {e}")
        yolo_model = None
        bert_classifier = None
        severity_model = None


def ensure_models_loaded():
    if yolo_model is None or bert_classifier is None or severity_model is None:
        load_models()


def preprocess_image(image_path: str) -> Optional[np.ndarray]:
    """OpenCV preprocess: resize, enhance contrast"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        img = cv2.resize(img, (640, 640))
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced = cv2.merge((cl, a, b))
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        return enhanced
    except Exception:
        return None


def detect_issue_from_image(image_path: str) -> str:
    ensure_models_loaded()

    if yolo_model is None:
        return "UNKNOWN"

    processed_img = preprocess_image(image_path)
    if processed_img is None:
        return "UNKNOWN"

    results = yolo_model(processed_img, verbose=False)
    if not results or len(results[0].boxes) == 0:
        return "GENERAL"

    class_mapping = {
        'person': 'GENERAL',
        'car': 'ROAD_ISSUE',
        'truck': 'ROAD_ISSUE',
        'bottle': 'GARBAGE',
        'cup': 'GARBAGE',
        'fork': 'GARBAGE',
        'dog': 'GENERAL',
        'cat': 'GENERAL',
    }

    class_ids = results[0].boxes.cls.cpu().numpy()
    classes = [yolo_model.names[int(cls)] for cls in class_ids]
    for cls in classes:
        if cls in class_mapping:
            return class_mapping[cls]

    return "GENERAL"


def detect_issue_from_description(description: str) -> str:
    desc = description.lower()
    if any(keyword in desc for keyword in ["road", "pothole", "street", "car", "truck", "traffic", "sign", "roadside"]):
        return "ROAD_ISSUE"
    if any(keyword in desc for keyword in ["garbage", "trash", "litter", "dump", "waste"]):
        return "GARBAGE"
    if any(keyword in desc for keyword in ["water", "leak", "pipe", "sewer", "drain"]):
        return "WATER_LEAK"
    if any(keyword in desc for keyword in ["power", "electric", "light", "transformer", "cable"]):
        return "ELECTRICITY"
    if any(keyword in desc for keyword in ["park", "garden", "tree", "playground", "bench"]):
        return "PARKS"
    return "GENERAL"


def classify_severity_from_text(description: str) -> str:
    ensure_models_loaded()
    desc = description.lower()
    if bert_classifier is None:
        if "urgent" in desc or "danger" in desc or "emergency" in desc:
            return "HIGH"
        if "minor" in desc or "small" in desc or "low" in desc:
            return "LOW"
        return "MEDIUM"

    candidate_labels = ["HIGH severity", "MEDIUM severity", "LOW severity"]
    result = bert_classifier(description, candidate_labels)
    if result and 'labels' in result and len(result['labels']) > 0:
        label = result['labels'][0].lower()
        if 'high' in label:
            return 'HIGH'
        if 'low' in label:
            return 'LOW'
    return 'MEDIUM'


if __name__ == "__main__":
    print("AI Service ready.")
    load_models()
