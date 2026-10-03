import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface ApiExplorerViewProps {
  language: Language;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  summaryHi: string;
  category: string;
  tag: string;
  description: string;
  params?: { name: string; in: string; description: string; example: string }[];
  bodySample?: any;
  responseSample?: any;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'get-amrs',
    method: 'GET',
    path: '/api/v1/amrs',
    tag: 'AMR Fleet',
    category: 'AMR Fleet',
    summary: 'List all AMR telemetry',
    summaryHi: 'सभी AMR की टेलीमेट्री सूची',
    description: 'Fetch real-time telemetry, battery discharge levels, drive temperatures, and mission states for all 6 active AMRs in the fleet.',
    responseSample: {
      success: true, data: [
        { id: 'amr-01', code: 'AMR-01', status: 'Active', batteryLevel: 74, speed: 1.25, payloadKg: 40, currentPosition: { x: 15, y: 22 } },
        { id: 'amr-02', code: 'AMR-02', status: 'Charging', batteryLevel: 32, speed: 0, payloadKg: 0, currentPosition: { x: 8, y: 44 } }
      ]
    }
  },
  {
    id: 'post-amr-command',
    method: 'POST',
    path: '/api/v1/amrs/{amrId}/command',
    tag: 'AMR Fleet',
    category: 'AMR Fleet',
    summary: 'Issue operator override command',
    summaryHi: 'ऑपरेटर ओवरराइड कमांड भेजें',
    description: 'Send a real-time control override to a specific AMR. Supports emergency-stop (immediate halt), return-to-dock (navigate to nearest charge station), and resume operations.',
    params: [{ name: 'amrId', in: 'path', description: 'Target AMR unique identifier', example: 'amr-01' }],
    bodySample: { command: 'emergency-stop' },
    responseSample: { success: true, message: 'Emergency stop issued to AMR-01. Telemetry update in 800ms.' }
  },
  {
    id: 'get-map',
    method: 'GET',
    path: '/api/v1/warehouse/map',
    tag: 'Digital Twin',
    category: 'Digital Twin Map',
    summary: 'Get 50×50 spatial warehouse map',
    summaryHi: '50×50 वेयरहाउस नक्शा प्राप्त करें',
    description: 'Retrieves the full 50×50 warehouse grid including zone definitions, pickup/dropoff stations, charging docks, and all currently active obstacle hazard markers.',
    responseSample: {
      success: true, data: {
        gridSize: { width: 50, height: 50 },
        zones: [{ id: 'zone-a', type: 'Loading', bounds: { x: 1, y: 1, width: 10, height: 20 } }],
        stations: 8, obstacles: 2
      }
    }
  },
  {
    id: 'post-obstacle',
    method: 'POST',
    path: '/api/v1/warehouse/obstacle',
    tag: 'Digital Twin',
    category: 'Digital Twin Map',
    summary: 'Inject dynamic hazard obstacle',
    summaryHi: 'गतिशील बाधा इंजेक्ट करें',
    description: 'Injects a hazard obstacle at specified grid coordinates. Immediately triggers A* re-routing for all AMRs whose current path intersects the obstacle zone.',
    bodySample: { x: 24, y: 14, type: 'Pallet Debris' },
    responseSample: { success: true, message: 'Obstacle injected at (24,14). 2 AMRs re-routed via A* STA.', reroutedAmrs: ['amr-02', 'amr-04'] }
  },
  {
    id: 'get-tasks',
    method: 'GET',
    path: '/api/v1/tasks',
    tag: 'Task Engine',
    category: 'Task Engine',
    summary: 'List warehouse task queue',
    summaryHi: 'वेयरहाउस टास्क क्यू सूची',
    description: 'Fetch the full warehouse pick-and-place task queue with multi-criteria allocation scores (urgency, distance, battery, payload). Returns PENDING, IN_PROGRESS, and COMPLETED tasks.',
    params: [{ name: 'status', in: 'query', description: 'Filter by task status', example: 'PENDING' }],
    responseSample: { success: true, totalTasks: 12, tasks: [{ id: 'tsk-109', priority: 'HIGH', status: 'PENDING', score: 0.94, from: 'P1', to: 'D3' }] }
  },
  {
    id: 'post-allocate',
    method: 'POST',
    path: '/api/v1/tasks/allocate',
    tag: 'Task Engine',
    category: 'Task Engine',
    summary: 'Execute task allocation algorithm',
    summaryHi: 'टास्क आवंटन एल्गोरिदम चलाएं',
    description: 'Executes the multi-criteria dynamic task allocation algorithm. Scores each (task, AMR) pair using weighted urgency, proximity, battery level, and payload capacity. Assigns optimal AMR.',
    bodySample: { taskId: 'TSK-109' },
    responseSample: { success: true, taskId: 'TSK-109', assignedAmr: 'amr-03', allocationScore: 0.91, estimatedETA: '42s' }
  },
  {
    id: 'get-conflicts',
    method: 'GET',
    path: '/api/v1/coordination/conflicts',
    tag: 'Coordination',
    category: 'Multi-Robot Pathing',
    summary: 'List active route conflicts',
    summaryHi: 'सक्रिय मार्ग संघर्ष सूची',
    description: 'Returns all currently detected space-time reservation conflicts between AMRs in the coordination graph. Includes conflict type, involved AMRs, and A* resolution status.',
    responseSample: { success: true, conflictCount: 1, conflicts: [{ id: 'cfl-001', type: 'HeadOn', amrs: ['amr-02', 'amr-05'], resolved: false }] }
  },
  {
    id: 'get-perceptions',
    method: 'GET',
    path: '/api/v1/edge-ai/perceptions',
    tag: 'Edge AI',
    category: 'Edge AI',
    summary: 'Get edge AI perception feed',
    summaryHi: 'एज AI पर्सेप्शन डेटा प्राप्त करें',
    description: 'Fetch the latest YOLOv8 INT8 inference detections from onboard NVIDIA Jetson Orin NX vision systems. Returns bounding box coordinates, object class, confidence, and AMR node.',
    responseSample: { success: true, detections: [{ id: 'det-001', objectClass: 'Pallet', confidence: 0.984, amrCode: 'AMR-01', location: { x: 24.2, y: 14.8 } }] }
  },
  {
    id: 'post-scenario',
    method: 'POST',
    path: '/api/v1/simulation/scenario',
    tag: 'Simulation',
    category: 'Simulation & Demo',
    summary: 'Trigger judge demo scenario',
    summaryHi: 'जज डेमो परिदृश्य ट्रिगर करें',
    description: 'Triggers a deterministic SIH hackathon judge demonstration scenario. Scenarios: rush-hour (high task load), obstacle-injected (dynamic re-routing), robot-failure (fault tolerance), low-battery-dock (auto charging).',
    bodySample: { scenarioId: 'rush-hour' },
    responseSample: { success: true, message: "Scenario 'rush-hour' triggered. 5 high-priority tasks dispatched to fleet.", scenarioId: 'rush-hour' }
  }
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POST: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DELETE: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};
const METHOD_BADGE: Record<string, string> = {
  GET: 'bg-emerald-500 text-black',
  POST: 'bg-sky-500 text-black',
  PUT: 'bg-amber-500 text-black',
  DELETE: 'bg-rose-500 text-white',
};

const TAGS = ['All', 'AMR Fleet', 'Digital Twin', 'Task Engine', 'Coordination', 'Edge AI', 'Simulation'];

function syntaxHighlight(json: string): string {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-emerald-300'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = 'text-sky-300'; // key
        else cls = 'text-amber-200'; // string value
      } else if (/true|false/.test(match)) cls = 'text-purple-400';
      else if (/null/.test(match)) cls = 'text-neutral-500';
      return `<span class="${cls}">${match}</span>`;
    });
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ language }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [requestBodyStr, setRequestBodyStr] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResponseJson(null);
    setStatusCode(null);
    setResponseTime(null);
    setRequestBodyStr(selectedEndpoint.bodySample ? JSON.stringify(selectedEndpoint.bodySample, null, 2) : '');
  }, [selectedEndpoint]);

  const handleTestEndpoint = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      };
      if ((selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && requestBodyStr) {
        try { options.body = requestBodyStr; } catch {}
      }
      const realPath = selectedEndpoint.path.replace(/\{[^}]+\}/g, 'amr-01');
      const res = await fetch(realPath, options);
      const elapsed = Date.now() - start;
      const data = await res.json();
      setStatusCode(res.status);
      setResponseTime(elapsed);
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatusCode(0);
      setResponseTime(Date.now() - start);
      setResponseJson(JSON.stringify({ error: 'Connection error', message: err.message, hint: 'Make sure dev server is running on :5005' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const getCurlSnippet = (ep: EndpointDef) => {
    const path = ep.path.replace(/\{[^}]+\}/g, 'amr-01');
    if (ep.method === 'GET') {
      return `curl -X GET 'http://localhost:5005${path}' \\\n  -H 'Accept: application/json'`;
    }
    return `curl -X ${ep.method} 'http://localhost:5005${path}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${JSON.stringify(ep.bodySample)}'`;
  };

  const filteredEndpoints = activeTag === 'All' ? ENDPOINTS : ENDPOINTS.filter(ep => ep.tag === activeTag);

  return (
    <div className="space-y-5 select-none font-sans">

      {/* ── Top Banner ── */}
      <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 border border-violet-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-400 text-[20px]">api</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {language === 'hi' ? 'NEXUS AMR OS — REST API एक्सप्लोरर' : 'NEXUS AMR OS — REST API Explorer & Playground'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">OpenAPI 3.0</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Server :5005 LIVE
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">JSON · REST · WebSocket</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl">
              <div className="text-neutral-500 text-[10px]">ENDPOINTS</div>
              <div className="text-white font-bold text-sm">{ENDPOINTS.length}</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl">
              <div className="text-neutral-500 text-[10px]">BASE URL</div>
              <div className="text-sky-400 font-bold">localhost:5005</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl">
              <div className="text-neutral-500 text-[10px]">VERSION</div>
              <div className="text-emerald-400 font-bold">v1.0.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Left: Endpoint List */}
        <div className="xl:col-span-4 bg-[#0f0f12] border border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">

          {/* Tag Filter */}
          <div className="p-3 border-b border-neutral-800 flex flex-wrap gap-1.5">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  activeTag === tag
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Endpoint entries */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ scrollbarWidth: 'none' }}>
            {filteredEndpoints.map((ep) => {
              const isCur = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isCur
                      ? 'bg-[#13131a] border-violet-500/30 shadow-md shadow-violet-500/5'
                      : 'bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${METHOD_COLORS[ep.method]}`}>
                      {ep.method}
                    </span>
                    <span className={`text-xs font-mono font-bold truncate ${isCur ? 'text-white' : 'text-neutral-300'}`}>
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate font-sans">{ep.summary}</p>
                  <div className="mt-1.5">
                    <span className="text-[9px] font-mono text-neutral-700 bg-neutral-800/60 px-1.5 py-0.5 rounded">{ep.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Endpoint Inspector */}
        <div className="xl:col-span-8 flex flex-col gap-4">

          {/* Endpoint Header Card */}
          <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-5 shadow-xl">

            {/* Method + Path + Send */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <span className={`px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${METHOD_BADGE[selectedEndpoint.method]}`}>
                {selectedEndpoint.method}
              </span>
              <div className="flex-1 bg-[#09090b] border border-neutral-800 rounded-xl px-3 py-2 text-sm font-mono text-neutral-200 flex items-center gap-2">
                <span className="text-neutral-600">http://localhost:5005</span>
                <span className="text-white font-bold">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={handleTestEndpoint}
                disabled={isLoading}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Send Request
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">{selectedEndpoint.description}</p>

            {/* Tabs: Body / cURL / Params */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Request Body (POST/PUT) */}
              {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Request Body · JSON</span>
                    <button onClick={() => handleCopy(requestBodyStr, 'body')} className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer">
                      {copied === 'body' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <textarea
                    value={requestBodyStr}
                    onChange={(e) => setRequestBodyStr(e.target.value)}
                    className="w-full h-24 bg-[#09090b] border border-neutral-800 rounded-xl p-3 text-xs text-sky-300 font-mono resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* cURL Snippet */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">cURL Command</span>
                  <button onClick={() => handleCopy(getCurlSnippet(selectedEndpoint), 'curl')} className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer">
                    {copied === 'curl' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="w-full bg-[#09090b] border border-neutral-800 rounded-xl p-3 text-[10px] text-neutral-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {getCurlSnippet(selectedEndpoint)}
                </pre>
              </div>
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-[#09090b] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">

            {/* Response Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-[#0c0c10]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-base">code</span>
                <span className="text-xs font-mono font-bold text-neutral-300 uppercase">Response</span>
                {statusCode !== null && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${statusCode >= 200 && statusCode < 300 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                    {statusCode >= 200 && statusCode < 300 ? '✓' : '✗'} {statusCode} {statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : 'Error'}
                  </span>
                )}
                {responseTime !== null && (
                  <span className="text-[10px] font-mono text-neutral-500">{responseTime}ms</span>
                )}
              </div>
              {responseJson && (
                <button onClick={() => handleCopy(responseJson, 'response')} className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer">
                  {copied === 'response' ? '✓ Copied' : 'Copy JSON'}
                </button>
              )}
            </div>

            <div ref={responseRef} className="relative min-h-[220px] max-h-[360px] overflow-auto p-5">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-neutral-500">
                    <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs font-mono">Awaiting response from localhost:5005...</span>
                  </div>
                </div>
              ) : responseJson ? (
                <pre
                  className="text-xs font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: syntaxHighlight(responseJson) }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  {/* Sample response preview */}
                  <div className="w-full max-w-md opacity-30">
                    <pre className="text-[10px] font-mono text-neutral-400 leading-relaxed overflow-hidden max-h-32">
                      {JSON.stringify(selectedEndpoint.responseSample, null, 2)}
                    </pre>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-neutral-600 text-xs font-sans">
                    <span className="material-symbols-outlined text-3xl">terminal</span>
                    <span>Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-300">Send Request</kbd> to execute</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WebSocket Info Card */}
          <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">cable</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-100">WebSocket Telemetry Stream</span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">WS</span>
                  <span className="text-[9px] font-mono text-emerald-400">● LIVE</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                  Real-time AMR telemetry pushed over WebSocket at 800ms intervals. Connect to receive live position, battery, speed, and status updates.
                </p>
                <div className="bg-[#09090b] border border-neutral-800 rounded-xl p-3 text-[10px] font-mono">
                  <div className="text-neutral-500 mb-1">Connection URL</div>
                  <div className="text-amber-300">ws://localhost:5005/ws</div>
                  <div className="text-neutral-600 mt-2 mb-1">Event: AMR_TELEMETRY</div>
                  <div className="text-neutral-400">
                    {'{ "event": "AMR_TELEMETRY", "data": { "amrs": [...], "conflicts": [...] } }'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
