export type ActiveView = 
  | 'dashboard'
  | 'overview'
  | 'fleet'
  | 'warehouse'
  | 'tasks'
  | 'coordination'
  | 'edge-ai'
  | 'alerts'
  | 'analytics'
  | 'simulation'
  | 'settings'
  | 'contact'
  | 'login';

export type Language = 'en' | 'hi';
export type Theme = 'light' | 'dark';
export type FontSizeScale = 'sm' | 'md' | 'lg';

export type UserRole = 
  | 'Warehouse Operations Director'
  | 'Fleet Systems Engineer'
  | 'Safety & Edge AI Specialist'
  | 'Warehouse Floor Supervisor';

export type AmrStatus = 
  | 'Active' 
  | 'Idle' 
  | 'Charging' 
  | 'Blocked' 
  | 'Maintenance' 
  | 'Emergency';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED' | 'FAILED';

export interface GridPosition {
  x: number;
  y: number;
  zoneId?: string;
  aisle?: string;
}

export interface AMRHealth {
  motorTempC: number;
  wifiSignalDbm: number;
  sensorOk: boolean;
  lidarStatus: 'OK' | 'DEGRADED' | 'OFFLINE';
  batteryCycles: number;
}

export interface AMR {
  id: string;
  code: string;
  name: string;
  model: string;
  status: AmrStatus;
  batteryLevel: number;
  currentPosition: GridPosition;
  speed: number;
  heading: number;
  payloadKg: number;
  maxPayloadKg: number;
  currentTaskId?: string;
  currentRoute: GridPosition[];
  health: AMRHealth;
  cameraFeedUrl: string;
  isSimulated?: boolean;
}

export interface WarehouseZone {
  id: string;
  code: string;
  name: string;
  type: 'Storage' | 'Aisle' | 'Loading' | 'Unloading' | 'Charging' | 'Restricted';
  bounds: { x: number; y: number; width: number; height: number };
  status: 'CLEAR' | 'CONGESTED' | 'BLOCKED';
}

export interface WarehouseStation {
  id: string;
  code: string;
  name: string;
  type: 'Pickup' | 'Dropoff' | 'Charging' | 'Maintenance';
  position: GridPosition;
}

export interface TaskScoreBreakdown {
  distanceScore: number;
  batteryScore: number;
  workloadScore: number;
  priorityScore: number;
  congestionScore: number;
  totalScore: number;
}

export interface WarehouseTask {
  id: string;
  taskCode: string;
  title: string;
  pickupStationId: string;
  pickupStationName: string;
  dropoffStationId: string;
  dropoffStationName: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAmrId?: string;
  assignedAmrCode?: string;
  estimatedWeightKg: number;
  scoreBreakdown?: TaskScoreBreakdown;
  createdTime: string;
  estimatedDurationSec: number;
  completedTime?: string;
}

export interface RobotRouteConflict {
  id: string;
  amrId1: string;
  amrCode1: string;
  amrId2: string;
  amrCode2: string;
  location: GridPosition;
  conflictType: 'SAME_CELL' | 'CROSSING' | 'OBSTACLE_BLOCK';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  recommendedAction: string;
  resolved: boolean;
  timestamp: string;
}

export interface EdgePerceptionDetection {
  id: string;
  amrId: string;
  amrCode: string;
  objectClass: 'Person' | 'Pallet' | 'Debris' | 'Forklift' | 'Obstacle' | 'AMR';
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  location: GridPosition;
  timestamp: string;
  snapshotUrl: string;
  isSimulated: boolean;
}

export interface WarehouseObstacle {
  id: string;
  code: string;
  position: GridPosition;
  type: 'Pallet Debris' | 'Maintenance Rig' | 'Human Operator' | 'Temporary Box';
  detectedByAmrId: string;
  timestamp: string;
}

export interface OperationalAlert {
  id: string;
  alertType: 'COLLISION_WARNING' | 'LOW_BATTERY' | 'ROBOT_BLOCKED' | 'TASK_TIMEOUT' | 'HARDWARE_FAULT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  amrId?: string;
  amrCode?: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  recommendedAction?: string;
}

export interface FleetMetrics {
  totalAmrs: number;
  activeAmrs: number;
  idleAmrs: number;
  chargingAmrs: number;
  blockedAmrs: number;
  taskCompletionRatePct: number;
  avgTaskTimeSec: number;
  warehouseThroughputPalletsHr: number;
  collisionWarningsAvoidedCount: number;
  activeConflictsCount: number;
  avgWifiLatencyMs: number;
  lastSyncTimestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  phone: string;
}
