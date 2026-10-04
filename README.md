# M.A.R.G. - Multi-robot Autonomous Routing Grid v2.6.0 — Edge-AI Distributed Fleet Coordination Engine

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://smartindiahackathon.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26123-orange.svg)](#sih26123-problem-statement)
[![Architecture](https://img.shields.io/badge/Architecture-Edge--AI%20%2B%20Cloud-emerald.svg)](#system-architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)

Production-grade, end-to-end full-stack software platform built for **SIH Problem Statement 26123: Edge-AI Based Distributed Fleet Coordination for Autonomous Mobile Robots (AMRs) in Smart Warehouses**.

---

## 📋 SIH26123 Problem Statement

In modern smart warehouses, scaling fleets of Autonomous Mobile Robots (AMRs) creates major computational and spatial challenges:
1. **Central Bottlenecks**: Centralized fleet managers experience high Wi-Fi latency (>150ms) and single-point network failures.
2. **Deadlocks & Collisions**: Pathing conflicts at narrow aisle intersections lead to head-on deadlocks and severe physical collisions.
3. **Sub-optimal Task Allocations**: Greedy task assignment algorithms ignore real-time robot battery thermal degradation, distance metrics, and current workload.
4. **Perception Latency**: Offloading raw camera feeds to the cloud consumes excessive network bandwidth and introduces unacceptable delays for emergency stopping.

### The M.A.R.G. Solution
**M.A.R.G. - Multi-robot Autonomous Routing Grid** combines **onboard Edge-AI vision perception** (NVIDIA Jetson Orin INT8 YOLOv8) with a **sub-15ms peer-to-peer conflict resolution mesh** and a **multi-criteria task allocation scoring engine**, accessible via an interactive **2D Digital Twin Control Center**.

---

## 🏗️ System Architecture

```
        🤖 [Onboard Edge-AI Hardware - NVIDIA Jetson Orin NX]
┌────────────────────────────────────────────────────────────────────────┐
│ 4x Monocular Cameras + LiDAR (2.5K @ 60 FPS)                          │
│                                │                                       │
│          [YOLOv8 TensorRT INT8 Perception Engine]                      │
│   (Pallets, AMRs, Human Workers, Forklifts, Obstacle Boxes)            │
│                                │                                       │
│       [ByteTrack Trajectory Association & Local Mesh]                  │
│       (Predicts 5-second motion vectors & detects collision risks)     │
│                                │                                       │
│       [Sub-15ms Event-Driven Edge Conflict De-confliction]             │
│   (Local P2P collision avoidance over 5G/Wi-Fi 6 Mesh Network)         │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ WebSockets / MQTT Real-Time Telemetry
                                 ▼
        ☁️ [Centralized Fleet Manager & Real-Time Orchestrator]
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Telemetry Ingestion & Position Sync Engine                          │
│                                │                                       │
│ 2. Dynamic Time-Space A* Grid Path Planner                             │
│    (Calculates obstacle-free routes & resolves deadlock corridors)     │
│                                │                                       │
│ 3. Multi-Criteria Task Allocation Scoring Engine                       │
│    Score = α·Dist + β·(100 - Bat) + γ·Workload + δ·Priority            │
│                                │                                       │
│ 4. Spatio-Temporal Warehouse Analytics Engine                          │
│    (12h throughput, per-AMR uptime, zone congestion heatmaps)          │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ WebSockets / REST API
                                 ▼
        🖥️ [M.A.R.G. Command Center & Digital Twin Dashboard]
```

---

## ✨ Core System Modules

### 1. Operations Command Dashboard (`DashboardView.tsx`)
* **Apple-Inspired Hero Slideshow**: Dynamic photo slideshow showcasing real-time fleet operations, featuring per-slide accent themes (Emerald, Sky, Amber, Violet), split typography, and quick-action telemetry triggers.
* **Project Overview & BEL Band**: SIH Problem Statement 26123 summary, Bharat Electronics Limited (BEL) R&D badge, key platform highlights, and real-time operational status.
* **SVG Ring Gauges & KPI Widgets**: Animated circular arc gauges for Fleet Utilization (%), Task Completion Rate (%), Battery Efficiency (%), and Collision Avoidance Rate (%).
* **Live Activity Feed**: Real-time unified event stream merging active alerts, completed pick-and-place tasks, and docking events with timestamp tags and status badges.
* **Mini-Map & Fleet Cards**: Live grid preview with color-coded AMR nodes, route path traces, and battery status bars.

### 2. 2D Digital Twin Spatial Map (`WarehouseDigitalTwinView.tsx`)
* Interactive **50×50 spatial grid map** displaying real-time X/Y positions of all 6 AMRs.
* Visualizes storage aisle corridors, charging stations (C1, C2), drop-off zones, and pathing polylines.
* Supports **real-time obstacle injection** (Pallet Debris, Human Worker, Fallen Box) with instant A* path recalculation.

### 3. AMR Fleet Management (`AmrFleetView.tsx`, `AmrDetailSheet.tsx`)
* Fleet overview cards monitoring battery state of charge (%), linear velocity (m/s), motor temperature (°C), payload status, and Wi-Fi signal (dBm).
* **Progressive Disclosure Slide-over Sheet**: Deep telemetry view with battery discharge mini-sparkline and onboard YOLOv8 camera perception overlay.
* **Manual Operator Overrides**: One-click `E-STOP`, `DOCK C1`, and `RESUME` emergency commands.

### 4. Multi-Criteria Task Allocation Engine (`TaskAllocationView.tsx`)
Assigns incoming pick-and-place warehouse tasks to the optimal AMR using a normalized 4-factor scoring algorithm:

$$\text{Score}(A_i, T_j) = w_{\text{dist}} \cdot D(A_i, T_j) + w_{\text{bat}} \cdot (100 - B_i) + w_{\text{work}} \cdot W_i + w_{\text{prio}} \cdot P_j$$

* Configurable weight parameters ($W_{\text{dist}}=35\%$, $W_{\text{bat}}=25\%$, $W_{\text{work}}=20\%$, $W_{\text{prio}}=20\%$).
* Real-time task status tracking (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`).

### 5. Multi-Robot Pathing & Conflict Avoidance (`MultiRobotCoordinationView.tsx`)
* **Time-Space A* Grid Planner**: Generates collision-free trajectories across grid nodes.
* **Conflict Detection Engine**: Categorizes path risks into `CROSSING_INTERSECTION`, `HEAD_ON_DEADLOCK`, `STATION_CONGESTION`, and `OBSTACLE_BLOCKED`.
* Interactive conflict resolution trigger simulating sub-15ms speed throttling and dynamic re-routing.

### 6. Edge AI Perception Engine (`EdgeAiPerceptionView.tsx`, `ai_engine/`)
* **8 Warehouse Object Classes**: `Pallet`, `AMR`, `Human Worker`, `Forklift`, `Obstacle Box`, `AGV`, `Charging Dock`, `Dynamic Debris`.
* Demonstrates **Sub-15ms Edge Inference** vs **185ms Cloud HQ Latency** (>92% bandwidth savings).
* Complete PyTorch & TensorRT model training suite (`ai_engine/train_model.py`, `ai_engine/evaluate_model.py`).

### 7. Warehouse Analytics & KPIs (`WarehouseAnalyticsView.tsx`)
* 12-hour hourly throughput SVG bar chart (Target: 150 Pallets/hr).
* Per-AMR operational performance matrix (Tasks completed, battery efficiency, total distance traveled, uptime %, zero collisions).
* 6-Zone Congestion Heatmap & 8-Class YOLOv8 dataset distribution charts.

### 8. INF AI Assistant & Floating Bot (`InfAiChatbot.tsx`)
* Context-aware floating AI assistant synchronized with live WebSocket telemetry.
* Quick-action chips for instant fleet checks, hazard queries, and BEL Operations HQ support details.

### 9. SIH Judge Live Simulation Suite (`JudgeDemoSimulationView.tsx`)
* Built specifically for SIH hackathon judging evaluation.
* One-click trigger buttons for complex scenarios:
  1. `Scenario 1: Dynamic Obstacle Avoidance` (Injects fallen debris in Aisle 3)
  2. `Scenario 2: Peak Hour Zone Congestion` (Dispatches 4 AMRs to Zone B simultaneously)
  3. `Scenario 3: Emergency E-Stop & Safety Lock` (Triggers hardware safety buffer)
  4. `Scenario 4: Peer-to-Peer De-confliction` (Resolves head-on deadlock at Intersection 14)

---

## 🎨 Minimalist Design System & UX

* **Vercel / Linear Aesthetic**: Ultra-clean monochromatic palette (`#09090b` dark mode, `#fafafa` light mode) with crisp 1px neutral borders (`border-neutral-800` / `border-neutral-200`).
* **Light & Dark Theme Engine**: Instant theme switcher with `localStorage` persistence and root CSS variable injection.
* **Global Keyboard Shortcuts**:
  * `⌘1`: Digital Twin Spatial Map
  * `⌘2`: AMR Fleet Overview
  * `⌘3`: Task Allocation Engine
  * `⌘4`: Multi-Robot Pathing
  * `⌘5`: Edge AI Perception
  * `⌘6`: Fleet Throughput Analytics
  * `⌘7`: SIH Judge Demo Suite
  * `⌘8`: Safety Alerts
  * `⌘9`: OS Settings
* **Horizontal Sliding Menu Bar**: Smooth left/right scroll arrows (`chevron_left`, `chevron_right`) with zero screen-covering overlays or disruptive popups.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript 5.0, Vite 6.4 |
| **Styling & Icons** | TailwindCSS v4, Material Symbols, Lucide Icons |
| **Backend Server** | Node.js, Express, TypeScript |
| **Real-Time Communication** | WebSockets (`ws`), REST API |
| **AI / Machine Learning** | Python 3.10+, PyTorch, Ultralytics YOLOv8, OpenCV, TensorRT |
| **Database** | LowDB / JSON File Database with seed utilities |

---

## 🚀 Quick Start & Installation

### Prerequisites
* Node.js v18+ and `npm`
* Python 3.10+ (for AI Engine)

### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/krrishAlagh/NEXUSARM.git
cd NEXUSARM

# Install Node.js packages
npm install
```

### 2. Launch Development Servers
Runs both the Express backend API (`http://localhost:5005`) and the Vite React frontend (`http://localhost:3005`):
```bash
npm run dev:all
```

### 3. Run Backend Test Suite
```bash
npx tsx server/test-api.ts
```

### 4. Train Edge AI Perception Model (Optional)
```bash
# Install Python dependencies
pip install -r ai_engine/requirements.txt

# Run YOLOv8 8-class warehouse training script
python ai_engine/train_model.py --epochs 10 --batch 16
```

---

## 🛰️ API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/amrs` | List all 6 AMRs with position & battery |
| `POST` | `/api/v1/amrs/:id/command` | Send operator override (`emergency-stop`, `return-to-dock`, `resume`) |
| `GET` | `/api/v1/map` | Get warehouse zones, stations, and active obstacles |
| `POST` | `/api/v1/map/obstacles` | Inject dynamic obstacle into warehouse grid |
| `GET` | `/api/v1/tasks` | List all warehouse pick & drop tasks |
| `POST` | `/api/v1/tasks/allocate` | Execute multi-criteria task allocation scoring |
| `GET` | `/api/v1/coordination/conflicts` | Get active route conflicts & A* paths |
| `POST` | `/api/v1/simulation/scenario` | Trigger SIH judge demonstration scenario |

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH26123**.
All rights reserved © 2026 **M.A.R.G. Team**.
