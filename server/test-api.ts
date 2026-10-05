import { WebSocket } from 'ws';

const PORT = process.env.PORT || 5005;
const BASE_URL = `http://localhost:${PORT}`;
const WS_URL = `ws://localhost:${PORT}/ws`;

async function runEndToEndTests() {
  console.log(`\n========================================================================`);
  console.log(`🚀 RUNNING M.A.R.G. BACKEND END-TO-END VERIFICATION SUITE (${BASE_URL})`);
  console.log(`========================================================================\n`);

  // 1. Test WebSocket Connection & Real-Time Broadcasts
  console.log(`[Test 1/12] Testing WebSocket Telemetry Connection...`);
  const ws = new WebSocket(WS_URL);
  const wsEvents: string[] = [];

  const wsConnected = new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      console.log(`✔ WebSocket Connected to ${WS_URL}`);
      ws.send(JSON.stringify({ type: 'PING' }));
      resolve();
    });
    ws.on('error', (err) => reject(err));
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      wsEvents.push(parsed.type);
    } catch {}
  });

  await wsConnected;

  // 2. Test System Health Check
  console.log(`\n[Test 2/12] Testing /api/health Endpoint...`);
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  if (health.status !== 'healthy') throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  console.log(`✔ Health Check: ${health.status.toUpperCase()} | Version: ${health.version} | Uptime: ${health.uptimeSeconds}s | AMRs: ${health.warehouseState.amrsCount}`);

  // 3. Test AMR Fleet Listing
  console.log(`\n[Test 3/12] Testing /api/v1/amrs (AMR Fleet Listing)...`);
  const amrsRes = await fetch(`${BASE_URL}/api/v1/amrs`);
  const amrs = await amrsRes.json();
  if (!amrs.success || !Array.isArray(amrs.data)) throw new Error(`Failed to list AMRs: ${JSON.stringify(amrs)}`);
  console.log(`✔ AMR Fleet: Retrieved ${amrs.count} AMRs | Top: ${amrs.data[0].code} (${amrs.data[0].status}, Bat: ${amrs.data[0].batteryLevel}%)`);

  // 4. Test Single AMR Details & Manual Operator Command Override
  console.log(`\n[Test 4/12] Testing /api/v1/amrs/:id/command (Operator Overrides)...`);
  const targetAmrId = amrs.data[0].id;
  const commandRes = await fetch(`${BASE_URL}/api/v1/amrs/${targetAmrId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'resume' })
  });
  const cmd = await commandRes.json();
  if (!cmd.success) throw new Error(`Failed to send AMR command: ${JSON.stringify(cmd)}`);
  console.log(`✔ Operator Command 'resume' sent to ${cmd.data.code} | Status: ${cmd.data.status}`);

  // 5. Test Warehouse Spatial Map & Graph
  console.log(`\n[Test 5/12] Testing /api/v1/warehouse/map & /api/v1/map (Warehouse Spatial Layout)...`);
  const mapRes = await fetch(`${BASE_URL}/api/v1/warehouse/map`);
  const mapData = await mapRes.json();
  if (!mapData.success || !mapData.data.zones || !mapData.data.stations) {
    throw new Error(`Invalid map response: ${JSON.stringify(mapData)}`);
  }
  console.log(`✔ Warehouse Map: Grid ${mapData.data.gridSize.width}x${mapData.data.gridSize.height} | Zones: ${mapData.data.zones.length} | Stations: ${mapData.data.stations.length} | Active Obstacles: ${mapData.data.obstacles.length}`);

  // 6. Test Dynamic Obstacle Injection & Removal
  console.log(`\n[Test 6/12] Testing /api/v1/warehouse/obstacle (Obstacle Injection & Clearance)...`);
  const injectRes = await fetch(`${BASE_URL}/api/v1/warehouse/obstacle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 22, y: 16, type: 'Pallet Debris', amrId: targetAmrId })
  });
  const injected = await injectRes.json();
  if (!injected.success || !injected.data?.id) throw new Error(`Obstacle injection failed: ${JSON.stringify(injected)}`);
  console.log(`✔ Dynamic Obstacle Injected: ${injected.data.code} at (${injected.data.position.x}, ${injected.data.position.y})`);

  // Clear injected obstacle
  const clearRes = await fetch(`${BASE_URL}/api/v1/warehouse/obstacle/${injected.data.id}`, { method: 'DELETE' });
  const cleared = await clearRes.json();
  if (!cleared.success) throw new Error(`Obstacle removal failed: ${JSON.stringify(cleared)}`);
  console.log(`✔ Dynamic Obstacle Cleared: ${injected.data.code}`);

  // 7. Test Warehouse Task Queue & Task Creation
  console.log(`\n[Test 7/12] Testing /api/v1/tasks (Task Queue Management)...`);
  const tasksRes = await fetch(`${BASE_URL}/api/v1/tasks`);
  const tasks = await tasksRes.json();
  if (!tasks.success) throw new Error(`Failed to fetch tasks: ${JSON.stringify(tasks)}`);
  console.log(`✔ Tasks Queue: ${tasks.count} tasks retrieved`);

  const createTaskRes = await fetch(`${BASE_URL}/api/v1/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'High-Priority Circuit Board Pallet Transfer',
      pickupStationId: 'st-p1',
      dropoffStationId: 'st-d1',
      priority: 'CRITICAL',
      estimatedWeightKg: 180
    })
  });
  const createdTask = await createTaskRes.json();
  if (!createdTask.success) throw new Error(`Task creation failed: ${JSON.stringify(createdTask)}`);
  console.log(`✔ Task Created: ${createdTask.data.taskCode} | Priority: ${createdTask.data.priority} | From: ${createdTask.data.pickupStationName} -> To: ${createdTask.data.dropoffStationName}`);

  // 8. Test Multi-Criteria Task Allocation Scoring Engine
  console.log(`\n[Test 8/12] Testing /api/v1/tasks/allocate & /api/v1/coordination/assign (Task Allocation Scoring)...`);
  const allocRes = await fetch(`${BASE_URL}/api/v1/tasks/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId: createdTask.data.id })
  });
  const alloc = await allocRes.json();
  if (!alloc.success) throw new Error(`Task allocation failed: ${JSON.stringify(alloc)}`);
  console.log(`✔ Task Allocation Executed: Assigned: ${alloc.assignedCount} tasks | Score: ${alloc.allocationScore} | Assigned AMR: ${alloc.assignedAmr}`);

  // 9. Test Multi-Robot Coordination & Conflict Detection
  console.log(`\n[Test 9/12] Testing /api/v1/coordination/conflicts (Deadlock & Collision Avoidance)...`);
  const conflictRes = await fetch(`${BASE_URL}/api/v1/coordination/conflicts`);
  const conflicts = await conflictRes.json();
  if (!conflicts.success) throw new Error(`Failed to fetch conflicts: ${JSON.stringify(conflicts)}`);
  console.log(`✔ Coordination Conflicts: ${conflicts.count} tracked conflicts in warehouse grid`);

  // 10. Test Edge AI Perception Detections Feed
  console.log(`\n[Test 10/12] Testing /api/v1/edge-ai/perceptions (Edge YOLOv8 INT8 Perception Feed)...`);
  const perceptionRes = await fetch(`${BASE_URL}/api/v1/edge-ai/perceptions`);
  const perceptions = await perceptionRes.json();
  if (!perceptions.success) throw new Error(`Failed to fetch edge perceptions: ${JSON.stringify(perceptions)}`);
  console.log(`✔ Edge AI Feed: ${perceptions.count} detections logged | Latest: ${perceptions.data[0]?.objectClass || 'None'} (Confidence: ${perceptions.data[0]?.confidence || 'N/A'})`);

  // 11. Test SIH Simulation Scenarios Control
  console.log(`\n[Test 11/12] Testing /api/v1/simulation/scenario (SIH Judge Scenario Engine)...`);
  const simRes = await fetch(`${BASE_URL}/api/v1/simulation/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId: 'rush-hour' })
  });
  const sim = await simRes.json();
  if (!sim.success) throw new Error(`Simulation control failed: ${JSON.stringify(sim)}`);
  console.log(`✔ SIH Judge Scenario: ${sim.message}`);

  // 12. Test Analytics & Alerts
  console.log(`\n[Test 12/12] Testing /api/v1/analytics/overview & /api/v1/alerts...`);
  const [alertsRes, analyticsRes] = await Promise.all([
    fetch(`${BASE_URL}/api/v1/alerts`),
    fetch(`${BASE_URL}/api/v1/analytics/overview`)
  ]);
  const alerts = await alertsRes.json();
  const analytics = await analyticsRes.json();
  if (!alerts.success || !analytics.success) throw new Error('Analytics or Alerts request failed.');
  console.log(`✔ Operational Alerts: ${alerts.data.length} active alerts`);
  console.log(`✔ Analytics KPIs: Active AMRs: ${analytics.data.activeAmrs}/${analytics.data.totalAmrs} | Hourly Throughput: ${analytics.data.warehouseThroughputPalletsHr} pallets/hr | Completion Rate: ${analytics.data.taskCompletionRatePct}%`);

  // Allow time for remaining WebSocket broadcasts
  await new Promise((resolve) => setTimeout(resolve, 1000));
  ws.close();

  const uniqueEventTypes = [...new Set(wsEvents)];
  console.log(`\n========================================================================`);
  console.log(`🎉 ALL 12/12 BACKEND TESTS PASSED SUCCESSFULLY!`);
  console.log(`📡 WebSocket Captured Events: ${wsEvents.length} broadcasts (${uniqueEventTypes.join(', ')})`);
  console.log(`========================================================================\n`);

  process.exit(0);
}

runEndToEndTests().catch((err) => {
  console.error('\n❌ Backend test failed:', err);
  process.exit(1);
});
