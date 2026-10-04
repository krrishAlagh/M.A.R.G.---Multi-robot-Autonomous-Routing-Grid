# M.A.R.G. — Research Papers, References & Citations
### Multi-robot Autonomous Routing Grid (SIH Problem Statement 26123)

---

## 1. Multi-Agent Pathfinding (MAPF) & Grid Coordination

### Conflict-Based Search (CBS) for Optimal Multi-Agent Pathfinding
- **Authors**: Guni Sharon, Roni Stern, Ariel Felner, Nathan R. Sturtevant
- **Journal**: *Artificial Intelligence (Elsevier)*
- **Paper Link**: https://www.sciencedirect.com/science/article/pii/S000437021500047X
- **arXiv Link**: https://arxiv.org/abs/1205.3374
- **Application**: Resolving multi-robot spatial-temporal conflicts (head-on collisions, intersection deadlocks, same-cell hazards) in warehouse grids.

### Cooperative Pathfinding (Time-Space A* Search)
- **Author**: David Silver
- **Conference**: *AIIDE (Artificial Intelligence and Interactive Digital Entertainment)*
- **Paper Link**: https://cdn.aaai.org/AIIDE/2005/AIIDE05-020.pdf
- **Application**: Time-space grid reservations and decoupled trajectory planning for AMRs.

---

## 2. Edge-AI Computer Vision & Real-Time Tracking

### ByteTrack: Multi-Object Tracking by Associating Every Detection Box
- **Authors**: Yifu Zhang, Peize Sun, Yi Jiang, Dongdong Yu, Fucheng Weng, Zehuan Yuan, Ping Luo, Wenyu Liu, Xinggang Wang
- **Paper Link (arXiv)**: https://arxiv.org/abs/2110.06864
- **Official GitHub**: https://github.com/ifzhang/ByteTrack
- **Application**: Tracking warehouse entities (AMRs, humans, forklifts, pallets) across occlusions using low-score detection association on NVIDIA Jetson.

### Ultralytics YOLOv8 (Real-Time Object Detection & Instance Segmentation)
- **Publisher**: Ultralytics Inc.
- **Documentation**: https://docs.ultralytics.com/
- **GitHub Repository**: https://github.com/ultralytics/ultralytics
- **Application**: Real-time 8-class obstacle and hazard detection at 60 FPS onboard mobile robots.

### NVIDIA Jetson Orin Platform & TensorRT Quantization
- **Hardware Reference**: https://developer.nvidia.com/embedded/jetson-orin-nano-developer-kit
- **TensorRT Documentation**: https://developer.nvidia.com/tensorrt
- **Application**: INT8 post-training quantization and sub-12.5ms inference execution on ARM64 embedded SoCs.

---

## 3. Spatial Deduplication & Telemetry

### DBSCAN: Density-Based Spatial Clustering of Applications with Noise
- **Authors**: Martin Ester, Hans-Peter Kriegel, Jörg Sander, Xiaowei Xu
- **Conference**: *KDD (Knowledge Discovery and Data Mining)*
- **Paper Link**: https://www.aaai.org/Papers/KDD/1996/KDD96-037.pdf
- **Scikit-Learn Implementation**: https://scikit-learn.org/stable/modules/clustering.html#dbscan
- **Application**: Spatial deduplication of repeated robot camera detections using Haversine distance clustering.

### MQTT (Message Queuing Telemetry Transport) Protocol
- **Standard Organization**: OASIS / ISO/IEC 20922
- **Official Portal**: https://mqtt.org/
- **Application**: Low-bandwidth publish/subscribe telemetry transmission between robot edge nodes and cloud orchestrator.

### WebSocket Protocol (RFC 6455)
- **Standard**: IETF RFC 6455
- **Reference**: https://datatracker.ietf.org/doc/html/rfc6455
- **Application**: Full-duplex real-time fleet state synchronization with 500ms heartbeat to the digital twin dashboard.

---

## 4. LLM Decision Support & Governance

### Google Gemini Structured Outputs & Function Calling
- **Provider**: Google DeepMind
- **Documentation**: https://ai.google.dev/gemini-api/docs/function-calling
- **API Reference**: https://ai.google.dev/api/generate-content
- **Application**: LLM-driven task dispatch, incident triage, and automated maintenance order generation.

### OpenStreetMap (OSM) & Geospatial Tools
- **Portal**: https://www.openstreetmap.org/
- **Application**: Coordinate projections and spatial mapping reference for indoor/outdoor multi-agent routing.

---

## 5. Hackathon & Government References

### Smart India Hackathon (SIH 2026)
- **Official Portal**: https://smartindiahackathon.gov.in
- **Problem Statement ID**: SIH26123
- **Title**: Edge-AI Based Distributed Fleet Coordination for Autonomous Mobile Robots (AMRs) in Smart Warehouses
- **Organization**: Bharat Electronics Limited (BEL) / Ministry of Defence, Govt. of India

### Open Government Data (OGD) Platform India
- **Portal**: https://data.gov.in/
- **Application**: Reference open civic, transport, and infrastructure standards.

---

## 6. Repository Architecture Documents

- **AI Perception Engine**: `ai_engine/README.md`
- **Dataset Configuration & Classes**: `ai_engine/dataset.yaml`
- **Cleaned Dataset Summary (12,450 labels)**: `ai_engine/dataset_summary.json`
- **Main Deployment & Architecture Guide**: `README.md`
- **Research & Reference Brief HTML**: `reference-research-brief.html`
