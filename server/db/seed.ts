import {
  AMR,
  WarehouseZone,
  WarehouseStation,
  WarehouseTask,
  RobotRouteConflict,
  EdgePerceptionDetection,
  WarehouseObstacle,
  OperationalAlert,
  FleetMetrics,
  UserAccount
} from '../types/serverTypes';

export const ASSETS = {
  adminAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  engineerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  safetyAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  supervisorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  amrFeed1: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop',
  amrFeed2: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop',
  amrFeed3: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop',
  obstacleFrame: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop'
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-OPS-DIR',
    name: 'Vikram Malhotra',
    email: 'v.malhotra@marg.ai',
    role: 'Warehouse Operations Director',
    department: 'Autonomous Fleet Control HQ',
    avatar: ASSETS.adminAvatar,
    phone: '+91 98110 88200'
  },
  {
    id: 'USR-FLEET-ENG',
    name: 'Dr. Ananya Roy',
    email: 'a.roy@marg.ai',
    role: 'Fleet Systems Engineer',
    department: 'Multi-Robot Coordination & Dynamics',
    avatar: ASSETS.engineerAvatar,
    phone: '+91 98220 33411'
  },
  {
    id: 'USR-EDGE-AI',
    name: 'Kabir Mehta',
    email: 'k.mehta@marg.ai',
    role: 'Safety & Edge AI Specialist',
    department: 'Embedded Vision & Perception',
    avatar: ASSETS.safetyAvatar,
    phone: '+91 98330 55622'
  },
  {
    id: 'USR-FLOOR-SUP',
    name: 'Rajesh Nair',
    email: 'r.nair@marg.ai',
    role: 'Warehouse Floor Supervisor',
    department: 'Floor Logistics & Dispatch',
    avatar: ASSETS.supervisorAvatar,
    phone: '+91 98440 77933'
  }
];

export const INITIAL_ZONES: WarehouseZone[] = [
  { id: 'zone-1', code: 'ZN-INBOUND', name: 'Inbound Receiving Dock', type: 'Loading', bounds: { x: 2, y: 2, width: 12, height: 10 }, status: 'CLEAR' },
  { id: 'zone-2', code: 'ZN-AISLE-A', name: 'Storage Aisle A (High-Bay)', type: 'Storage', bounds: { x: 16, y: 2, width: 10, height: 20 }, status: 'CLEAR' },
  { id: 'zone-3', code: 'ZN-AISLE-B', name: 'Storage Aisle B (Medium Loads)', type: 'Storage', bounds: { x: 28, y: 2, width: 10, height: 20 }, status: 'CONGESTED' },
  { id: 'zone-4', code: 'ZN-OUTBOUND', name: 'Outbound Packing & Dispatch', type: 'Unloading', bounds: { x: 40, y: 2, width: 12, height: 10 }, status: 'CLEAR' },
  { id: 'zone-5', code: 'ZN-CHARGING', name: 'Automated Charging Hub', type: 'Charging', bounds: { x: 2, y: 35, width: 14, height: 10 }, status: 'CLEAR' },
  { id: 'zone-6', code: 'ZN-COLD', name: 'Restricted Cold Storage', type: 'Restricted', bounds: { x: 36, y: 35, width: 16, height: 10 }, status: 'BLOCKED' }
];

export const INITIAL_STATIONS: WarehouseStation[] = [
  { id: 'st-p1', code: 'P-IN-01', name: 'Inbound Dock Station 1', type: 'Pickup', position: { x: 4, y: 6 } },
  { id: 'st-p2', code: 'P-IN-02', name: 'Inbound Dock Station 2', type: 'Pickup', position: { x: 8, y: 6 } },
  { id: 'st-d1', code: 'D-OUT-01', name: 'Packing Bay 1', type: 'Dropoff', position: { x: 42, y: 6 } },
  { id: 'st-d2', code: 'D-OUT-02', name: 'Packing Bay 2', type: 'Dropoff', position: { x: 46, y: 6 } },
  { id: 'st-c1', code: 'C-DOCK-01', name: 'Wireless Charging Dock 1', type: 'Charging', position: { x: 4, y: 38 } },
  { id: 'st-c2', code: 'C-DOCK-02', name: 'Wireless Charging Dock 2', type: 'Charging', position: { x: 8, y: 38 } },
  { id: 'st-c3', code: 'C-DOCK-03', name: 'Wireless Charging Dock 3', type: 'Charging', position: { x: 12, y: 38 } },
  { id: 'st-m1', code: 'M-BAY-01', name: 'Robotics Maintenance Station', type: 'Maintenance', position: { x: 20, y: 38 } }
];

export const INITIAL_AMRS: AMR[] = [
  {
    id: 'amr-01',
    code: 'AMR-01',
    name: 'Titan Payload Carrier 1',
    model: 'MARG AMR-1000 Pro',
    status: 'Active',
    batteryLevel: 88,
    currentPosition: { x: 6, y: 8, zoneId: 'zone-1', aisle: 'Inbound' },
    speed: 1.4,
    heading: 90,
    payloadKg: 350,
    maxPayloadKg: 1000,
    currentTaskId: 'task-101',
    currentRoute: [
      { x: 6, y: 8 },
      { x: 12, y: 8 },
      { x: 18, y: 8 },
      { x: 24, y: 8 },
      { x: 30, y: 8 },
      { x: 42, y: 6 }
    ],
    health: { motorTempC: 38.5, wifiSignalDbm: -54, sensorOk: true, lidarStatus: 'OK', batteryCycles: 142 },
    cameraFeedUrl: ASSETS.amrFeed1
  },
  {
    id: 'amr-02',
    code: 'AMR-02',
    name: 'Swift Mover 2',
    model: 'MARG AMR-500 Light',
    status: 'Active',
    batteryLevel: 72,
    currentPosition: { x: 18, y: 12, zoneId: 'zone-2', aisle: 'Aisle A2' },
    speed: 1.6,
    heading: 180,
    payloadKg: 180,
    maxPayloadKg: 500,
    currentTaskId: 'task-102',
    currentRoute: [
      { x: 18, y: 12 },
      { x: 18, y: 18 },
      { x: 28, y: 18 },
      { x: 46, y: 6 }
    ],
    health: { motorTempC: 41.0, wifiSignalDbm: -58, sensorOk: true, lidarStatus: 'OK', batteryCycles: 210 },
    cameraFeedUrl: ASSETS.amrFeed2
  },
  {
    id: 'amr-03',
    code: 'AMR-03',
    name: 'Heavy Tugger 3',
    model: 'MARG AMR-1500 Heavy',
    status: 'Idle',
    batteryLevel: 94,
    currentPosition: { x: 22, y: 4, zoneId: 'zone-2', aisle: 'Aisle A1' },
    speed: 0.0,
    heading: 0,
    payloadKg: 0,
    maxPayloadKg: 1500,
    currentRoute: [],
    health: { motorTempC: 32.0, wifiSignalDbm: -48, sensorOk: true, lidarStatus: 'OK', batteryCycles: 85 },
    cameraFeedUrl: ASSETS.amrFeed3
  },
  {
    id: 'amr-04',
    code: 'AMR-04',
    name: 'Echo Navigator 4',
    model: 'MARG AMR-500 Light',
    status: 'Charging',
    batteryLevel: 24,
    currentPosition: { x: 4, y: 38, zoneId: 'zone-5', aisle: 'Dock C1' },
    speed: 0.0,
    heading: 270,
    payloadKg: 0,
    maxPayloadKg: 500,
    currentRoute: [],
    health: { motorTempC: 36.2, wifiSignalDbm: -50, sensorOk: true, lidarStatus: 'OK', batteryCycles: 340 },
    cameraFeedUrl: ASSETS.amrFeed1
  },
  {
    id: 'amr-05',
    code: 'AMR-05',
    name: 'Pallet Cruiser 5',
    model: 'MARG AMR-1000 Pro',
    status: 'Blocked',
    batteryLevel: 61,
    currentPosition: { x: 30, y: 14, zoneId: 'zone-3', aisle: 'Aisle B3' },
    speed: 0.0,
    heading: 90,
    payloadKg: 420,
    maxPayloadKg: 1000,
    currentTaskId: 'task-103',
    currentRoute: [
      { x: 30, y: 14 },
      { x: 34, y: 14 },
      { x: 40, y: 14 }
    ],
    health: { motorTempC: 44.8, wifiSignalDbm: -62, sensorOk: false, lidarStatus: 'DEGRADED', batteryCycles: 180 },
    cameraFeedUrl: ASSETS.amrFeed2
  },
  {
    id: 'amr-06',
    code: 'AMR-06',
    name: 'Vanguard Transporter 6',
    model: 'MARG AMR-1000 Pro',
    status: 'Active',
    batteryLevel: 81,
    currentPosition: { x: 10, y: 20, zoneId: 'zone-1', aisle: 'Buffer 1' },
    speed: 1.2,
    heading: 0,
    payloadKg: 280,
    maxPayloadKg: 1000,
    currentTaskId: 'task-104',
    currentRoute: [
      { x: 10, y: 20 },
      { x: 10, y: 14 },
      { x: 16, y: 14 }
    ],
    health: { motorTempC: 37.1, wifiSignalDbm: -52, sensorOk: true, lidarStatus: 'OK', batteryCycles: 125 },
    cameraFeedUrl: ASSETS.amrFeed3
  }
];

export const INITIAL_TASKS: WarehouseTask[] = [
  {
    id: 'task-101',
    taskCode: 'TASK-PK-4081',
    title: 'Transport Pallet Lot A-42 from Inbound Dock to Packing Bay 1',
    pickupStationId: 'st-p1',
    pickupStationName: 'Inbound Dock Station 1',
    dropoffStationId: 'st-d1',
    dropoffStationName: 'Packing Bay 1',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    assignedAmrId: 'amr-01',
    assignedAmrCode: 'AMR-01',
    estimatedWeightKg: 350,
    scoreBreakdown: {
      distanceScore: 92,
      batteryScore: 88,
      workloadScore: 100,
      priorityScore: 95,
      congestionScore: 84,
      totalScore: 91.8
    },
    createdTime: new Date(Date.now() - 900000).toISOString(),
    estimatedDurationSec: 240
  },
  {
    id: 'task-102',
    taskCode: 'TASK-PK-4082',
    title: 'High-Priority Circuit Component Transfer to Packing Bay 2',
    pickupStationId: 'st-p2',
    pickupStationName: 'Inbound Dock Station 2',
    dropoffStationId: 'st-d2',
    dropoffStationName: 'Packing Bay 2',
    priority: 'HIGH',
    status: 'IN_TRANSIT',
    assignedAmrId: 'amr-02',
    assignedAmrCode: 'AMR-02',
    estimatedWeightKg: 180,
    scoreBreakdown: {
      distanceScore: 85,
      batteryScore: 72,
      workloadScore: 90,
      priorityScore: 88,
      congestionScore: 78,
      totalScore: 82.6
    },
    createdTime: new Date(Date.now() - 600000).toISOString(),
    estimatedDurationSec: 180
  },
  {
    id: 'task-103',
    taskCode: 'TASK-PK-4083',
    title: 'Heavy Crate Relocation to Outbound Staging',
    pickupStationId: 'st-p1',
    pickupStationName: 'Inbound Dock Station 1',
    dropoffStationId: 'st-d1',
    dropoffStationName: 'Packing Bay 1',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    assignedAmrId: 'amr-05',
    assignedAmrCode: 'AMR-05',
    estimatedWeightKg: 420,
    scoreBreakdown: {
      distanceScore: 78,
      batteryScore: 61,
      workloadScore: 85,
      priorityScore: 70,
      congestionScore: 60,
      totalScore: 70.8
    },
    createdTime: new Date(Date.now() - 300000).toISOString(),
    estimatedDurationSec: 300
  },
  {
    id: 'task-104',
    taskCode: 'TASK-PK-4084',
    title: 'Automated Stock Replenishment to Aisle A',
    pickupStationId: 'st-p2',
    pickupStationName: 'Inbound Dock Station 2',
    dropoffStationId: 'st-d2',
    dropoffStationName: 'Packing Bay 2',
    priority: 'LOW',
    status: 'PENDING',
    estimatedWeightKg: 220,
    createdTime: new Date(Date.now() - 120000).toISOString(),
    estimatedDurationSec: 210
  }
];

export const INITIAL_CONFLICTS: RobotRouteConflict[] = [
  {
    id: 'cnf-901',
    amrId1: 'amr-01',
    amrCode1: 'AMR-01',
    amrId2: 'amr-05',
    amrCode2: 'AMR-05',
    location: { x: 28, y: 14, zoneId: 'zone-3', aisle: 'Aisle B2' },
    conflictType: 'CROSSING',
    severity: 'HIGH',
    recommendedAction: 'AMR-05 wait 3.8s at intersection (X: 28, Y: 14) for AMR-01 right-of-way',
    resolved: false,
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_OBSTACLES: WarehouseObstacle[] = [
  {
    id: 'obs-301',
    code: 'OBS-PALLET-01',
    position: { x: 32, y: 14 },
    type: 'Pallet Debris',
    detectedByAmrId: 'amr-05',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_EDGE_PERCEPTIONS: EdgePerceptionDetection[] = [
  {
    id: 'edg-1001',
    amrId: 'amr-05',
    amrCode: 'AMR-05',
    objectClass: 'Debris',
    confidence: 0.964,
    bbox: { x: 120, y: 80, w: 180, h: 140 },
    location: { x: 32, y: 14, zoneId: 'zone-3' },
    timestamp: new Date().toISOString(),
    snapshotUrl: ASSETS.obstacleFrame,
    isSimulated: true
  },
  {
    id: 'edg-1002',
    amrId: 'amr-01',
    amrCode: 'AMR-01',
    objectClass: 'Pallet',
    confidence: 0.982,
    bbox: { x: 90, y: 60, w: 220, h: 160 },
    location: { x: 6, y: 8, zoneId: 'zone-1' },
    timestamp: new Date().toISOString(),
    snapshotUrl: ASSETS.amrFeed1,
    isSimulated: true
  },
  {
    id: 'edg-1003',
    amrId: 'amr-02',
    amrCode: 'AMR-02',
    objectClass: 'Person',
    confidence: 0.951,
    bbox: { x: 200, y: 40, w: 100, h: 220 },
    location: { x: 18, y: 12, zoneId: 'zone-2' },
    timestamp: new Date().toISOString(),
    snapshotUrl: ASSETS.amrFeed2,
    isSimulated: true
  }
];

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alt-501',
    alertType: 'ROBOT_BLOCKED',
    severity: 'WARNING',
    amrId: 'amr-05',
    amrCode: 'AMR-05',
    message: 'AMR-05 path blocked by unexpected pallet debris in Aisle B3. Re-routing calculation triggered.',
    timestamp: new Date().toISOString(),
    resolved: false
  },
  {
    id: 'alt-502',
    alertType: 'LOW_BATTERY',
    severity: 'INFO',
    amrId: 'amr-04',
    amrCode: 'AMR-04',
    message: 'AMR-04 reached 24% battery threshold. Autonomous docking to Wireless Dock C1 initiated.',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    resolved: true
  }
];

export const INITIAL_METRICS: FleetMetrics = {
  totalAmrs: 6,
  activeAmrs: 3,
  idleAmrs: 1,
  chargingAmrs: 1,
  blockedAmrs: 1,
  taskCompletionRatePct: 98.4,
  avgTaskTimeSec: 215,
  warehouseThroughputPalletsHr: 142,
  collisionWarningsAvoidedCount: 18,
  activeConflictsCount: 1,
  avgWifiLatencyMs: 14.2,
  lastSyncTimestamp: new Date().toISOString()
};
