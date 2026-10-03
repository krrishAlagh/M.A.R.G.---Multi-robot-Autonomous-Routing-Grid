# NEXUS AMR OS — Distributed Edge-AI Fleet Coordination Engine (SIH26123)

Production-grade, end-to-end Edge-to-Cloud AI/ML pipeline for **NEXUS AMR OS (SIH Problem Statement 26123)**: Edge-AI Based Distributed Fleet Coordination for Autonomous Mobile Robots (AMRs) in Smart Warehouses.

```
       🤖 [Onboard Edge-AI Hardware - NVIDIA Jetson Orin NX]
┌──────────────────────────────────────────────────────────────┐
│ 4x Monocular Overhead & AMR Cameras (2.5K 60FPS)            │
│                        │                                     │
│         [YOLOv8 TensorRT INT8 Perception Engine]             │
│   (Pallets, AMRs, Human Workers, Forklifts, Obstacle Boxes)  │
│                        │                                     │
│      [ByteTrack Tracking & LiDAR-Vision Fusion]              │
│       (Predictive Trajectories & Dynamic Collision Risk)     │
│                        │                                     │
│     [Sub-15ms Event-Driven Edge Conflict Resolution]         │
│  (Local Peer-to-Peer De-confliction over 5G/WiFi-6 Mesh)     │
└────────────────────────┬─────────────────────────────────────┘
                         │ MQTT / WebSockets Real-Time Telemetry (JSON + Compressed Keyframes)
                         ▼
        ☁️ [Centralized Fleet Orchestrator & Digital Twin]
┌──────────────────────────────────────────────────────────────┐
│ 1. Telemetry Ingestion & Real-Time Position Sync             │
│                        │                                     │
│ 2. Dynamic A* & Time-Space Conflict Matrix Planner           │
│    (Prevent Head-On, Intersection, & Deadlock Bottlenecks)   │
│                        │                                     │
│ 3. Multi-Criteria Task Allocation Engine                     │
│    Score = α·Dist + β·(100 - Bat) + γ·Workload + δ·Priority  │
│                        │                                     │
│ 4. Autonomous Spatio-Temporal Warehouse Analytics            │
│    (Throughput, Bottleneck Heatmaps, Energy Efficiency)      │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSockets / REST API
                         ▼
       🖥️ [NEXUS AMR Command Center & Digital Twin Dashboard]
```

---

## 📁 Repository Structure

```
ai_engine/
├── dataset.yaml                # YOLOv8 8-Class Smart Warehouse Dataset Config
├── dataset_summary.json        # Annotated Dataset Statistics (12,450 bounding boxes)
├── train_model.py              # PyTorch/Ultralytics Transfer Learning Pipeline
├── evaluate_model.py           # Jetson Orin Inference & Latency Benchmark Script
├── preprocess_dataset.py       # Image Denoising & Annotations Pipeline
├── requirements.txt            # Python dependencies (torch, ultralytics, opencv)
└── README.md                   # Complete Architecture Documentation
```

---

## ⚡ 1. Onboard Edge-AI Engine (AMR / Jetson Hardware)

### Multi-Class Perception & Obstacle Detection
- **Hardware Target**: NVIDIA Jetson Orin NX (16GB) / AGX Orin running JetPack 6.0 (CUDA 12.2, TensorRT 8.6).
- **Inference Latency**: Sub-12.5ms INT8 quantized YOLOv8 inference @ **60 FPS**.
- **8 Warehouse Perception Classes**:
  1. `Pallet` (Payload status and drop-off verification)
  2. `AMR` (Peer robot identification and state broadcast)
  3. `Human Worker` (High-priority safety zone hazard monitoring)
  4. `Forklift` (Heavy vehicle proximity warnings)
  5. `Obstacle Box` (Fallen inventory or misplaced goods)
  6. `AGV` (Legacy Automated Guided Vehicle tracking)
  7. `Charging Dock` (Precision docking alignment)
  8. `Dynamic Debris` (Spills or loose wrapping material)

---

## 🚀 2. Quick Start & Execution

### Install Dependencies
```bash
pip install -r ai_engine/requirements.txt
```

### Train Edge Perception Model
```bash
python ai_engine/train_model.py --epochs 10 --batch 16
```

### Run Benchmark Evaluation
```bash
python ai_engine/evaluate_model.py
```
