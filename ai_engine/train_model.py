"""
NEXUS AMR OS - Edge AI Vision Model Training & Fine-Tuning Engine (SIH26123)
Trains YOLOv8 8-Class Warehouse Perception model for Autonomous Mobile Robots (AMRs)
Supports Jetson Orin NX CUDA, Apple Silicon MPS, and CPU execution.
"""

import os
import sys
import argparse
import shutil
import torch
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent
YAML_PATH = BASE_DIR / "ai_engine" / "dataset.yaml"
MODELS_DIR = BASE_DIR / "ai_engine" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def parse_args():
    parser = argparse.ArgumentParser(description="Train NEXUS AMR Edge AI Perception Model")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs (default: 10)")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (default: 16)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution (default: 640)")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model architecture (default: yolov8n.pt)")
    parser.add_argument("--workers", type=int, default=4, help="Data loader workers (default: 4)")
    return parser.parse_args()

def select_optimal_device():
    if torch.cuda.is_available():
        device = "0"
        print(f"🚀 Utilizing NVIDIA CUDA GPU: {torch.cuda.get_device_name(0)}")
    elif torch.backends.mps.is_available():
        device = "mps"
        print("⚡ Utilizing Apple Silicon GPU (Metal Performance Shaders - MPS)")
    else:
        device = "cpu"
        print("⚙️ Utilizing Multi-Core CPU for training")
    return device

def train_nexus_amr_ai():
    args = parse_args()
    
    print("=" * 70)
    print("🤖 NEXUS AMR OS: EDGE-AI WAREHOUSE PERCEPTION MODEL TRAINING")
    print("=" * 70)
    print(f"Configuration:")
    print(f"  • Base Model Architecture : {args.model}")
    print(f"  • Dataset Configuration   : {YAML_PATH}")
    print(f"  • Training Epochs         : {args.epochs}")
    print(f"  • Batch Size              : {args.batch}")
    print(f"  • Image Resolution        : {args.imgsz}x{args.imgsz}")
    
    device = select_optimal_device()
    
    # 1. Load Pretrained Backbone
    print(f"\n[1/4] Loading YOLO backbone: {args.model}...")
    model = YOLO(args.model)
    
    # 2. Execute Training with augmentations for indoor warehouse lighting & motion blur
    print("\n[2/4] Initializing training loop with transfer learning & augmentations...")
    results = model.train(
        data=str(YAML_PATH),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=device,
        workers=args.workers,
        project=str(BASE_DIR / "ai_engine" / "runs"),
        name="nexus_amr_edge_ai",
        exist_ok=True,
        pretrained=True,
        optimizer="AdamW",
        lr0=0.002,
        lrf=0.01,
        mosaic=0.8,
        mixup=0.1,
        hsv_h=0.015,
        hsv_s=0.5,
        hsv_v=0.4,
        degrees=5.0,
        translate=0.1,
        scale=0.3,
        fliplr=0.5,
        save=True,
        plots=True,
        verbose=True
    )
    
    # 3. Validate Model
    print("\n[3/4] Running comprehensive validation on holdout test split...")
    metrics = model.val(data=str(YAML_PATH), split='val')
    
    print("\n" + "=" * 70)
    print("📈 VALIDATION PERFORMANCE METRICS")
    print("=" * 70)
    print(f"  • mAP @ 50     : {metrics.box.map50:.4f}")
    print(f"  • mAP @ 50-95  : {metrics.box.map:.4f}")
    print(f"  • Precision    : {metrics.box.mp:.4f}")
    print(f"  • Recall       : {metrics.box.mr:.4f}")
    
    # 4. Export & Package Model Weights
    best_weight_source = BASE_DIR / "ai_engine" / "runs" / "nexus_amr_edge_ai" / "weights" / "best.pt"
    dest_weight = MODELS_DIR / "nexus_amr_edge_best.pt"
    
    if best_weight_source.exists():
        shutil.copy(str(best_weight_source), str(dest_weight))
        print(f"\n[4/4] ✅ Successfully saved trained weights to: {dest_weight}")
    else:
        fallback_weight = BASE_DIR / "ai_engine" / "runs" / "nexus_amr_edge_ai" / "weights" / "last.pt"
        if fallback_weight.exists():
            shutil.copy(str(fallback_weight), str(dest_weight))
            print(f"\n[4/4] ✅ Successfully saved weights to: {dest_weight}")
            
    print("\n" + "=" * 70)
    print("🎉 NEXUS AMR OS EDGE-AI MODEL TRAINING & VALIDATION COMPLETED")
    print("=" * 70)
    return metrics

if __name__ == "__main__":
    train_nexus_amr_ai()
