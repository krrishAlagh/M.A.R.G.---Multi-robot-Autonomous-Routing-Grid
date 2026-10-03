import {
  AMR,
  WarehouseZone,
  WarehouseStation,
  WarehouseTask,
  RobotRouteConflict,
  EdgePerceptionDetection,
  WarehouseObstacle,
  OperationalAlert,
  FleetMetrics
} from '../types';

const API_BASE = '/api/v1';

export async function fetchAMRs(): Promise<AMR[]> {
  try {
    const res = await fetch(`${API_BASE}/amrs`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchAmrById(id: string): Promise<AMR | null> {
  try {
    const res = await fetch(`${API_BASE}/amrs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function sendAmrCommand(id: string, command: 'emergency-stop' | 'return-to-dock' | 'resume'): Promise<{ success: boolean; data?: AMR; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/amrs/${encodeURIComponent(id)}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Command failed');
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchWarehouseMap(): Promise<{
  gridSize: { width: number; height: number };
  zones: WarehouseZone[];
  stations: WarehouseStation[];
  obstacles: WarehouseObstacle[];
} | null> {
  try {
    const res = await fetch(`${API_BASE}/warehouse/map`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function injectObstacle(data: { x: number; y: number; type?: string; amrId?: string }): Promise<{ success: boolean; data?: WarehouseObstacle; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/warehouse/obstacle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to inject obstacle');
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearObstacle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/warehouse/obstacle/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to clear obstacle');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchTasks(filters?: { status?: string; priority?: string; amrId?: string }): Promise<WarehouseTask[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.amrId) params.append('amrId', filters.amrId);

    const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createWarehouseTask(data: {
  title?: string;
  pickupStationId: string;
  dropoffStationId: string;
  priority?: string;
  estimatedWeightKg?: number;
}): Promise<{ success: boolean; data?: WarehouseTask; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create task');
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function runTaskAllocation(): Promise<{ success: boolean; assignedCount: number; assignments: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/coordination/assign`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Task allocation failed');
    return { success: true, assignedCount: json.assignedCount, assignments: json.assignments };
  } catch (err: any) {
    return { success: false, assignedCount: 0, assignments: [], error: err.message };
  }
}

export async function fetchRouteConflicts(): Promise<RobotRouteConflict[]> {
  try {
    const res = await fetch(`${API_BASE}/coordination/conflicts`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchEdgePerceptions(amrId?: string): Promise<EdgePerceptionDetection[]> {
  try {
    const url = amrId ? `${API_BASE}/edge-ai/perceptions?amrId=${encodeURIComponent(amrId)}` : `${API_BASE}/edge-ai/perceptions`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function runSimulationControl(scenario: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Simulation command failed');
    return { success: true, message: json.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
