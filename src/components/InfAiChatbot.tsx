import React, { useState, useRef, useEffect } from 'react';
import { AMR, WarehouseTask, OperationalAlert, FleetMetrics, RobotRouteConflict, Language, ActiveView } from '../types';

interface InfAiChatbotProps {
  language: Language;
  amrs: AMR[];
  tasks: WarehouseTask[];
  alerts: OperationalAlert[];
  metrics: FleetMetrics;
  conflicts: RobotRouteConflict[];
  onNavigate?: (view: ActiveView) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  chipNav?: ActiveView;
}

export const InfAiChatbot: React.FC<InfAiChatbotProps> = ({
  language,
  amrs,
  tasks,
  alerts,
  metrics,
  conflicts,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: language === 'hi' 
        ? 'नमस्ते! मैं INF AI स्वायत्त फ्लीट सहायक हूँ। आप मुझसे फ्लीट स्थिति, अलर्ट, या SIH26123 विनिर्देशों के बारे में पूछ सकते हैं।' 
        : 'Hello! I am **INF AI Assistant** for M.A.R.G. - Multi-robot Autonomous Routing Grid. Ask me about live AMR telemetry, active hazards, task scoring, or support contact details.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateBotResponse = (query: string): { text: string; chipNav?: ActiveView } => {
    const q = query.toLowerCase();

    // 1. AMR / Fleet Telemetry query
    if (q.includes('amr') || q.includes('fleet') || q.includes('status') || q.includes('robot') || q.includes('how many')) {
      const active = amrs.filter((a) => a.status === 'Active').length;
      const charging = amrs.filter((a) => a.status === 'Charging').length;
      const blocked = amrs.filter((a) => a.status === 'Blocked' || a.status === 'Emergency').length;
      const avgBat = amrs.length ? Math.round(amrs.reduce((s, a) => s + a.batteryLevel, 0) / amrs.length) : 0;

      return {
        text: `🤖 **Fleet Telemetry Summary**:\n- **Total AMRs**: ${amrs.length}\n- **Active**: ${active} | **Charging**: ${charging} | **Blocked/E-Stop**: ${blocked}\n- **Average Fleet Battery**: ${avgBat}%\n\nYou can inspect individual AMRs on the **AMR Fleet** page.`,
        chipNav: 'fleet'
      };
    }

    // 2. Alerts & Hazards
    if (q.includes('alert') || q.includes('hazard') || q.includes('danger') || q.includes('warning') || q.includes('stop')) {
      const activeAlerts = alerts.filter((a) => !a.resolved);
      const crit = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
      if (activeAlerts.length === 0) {
        return {
          text: '✅ **All Systems Normal**: No active unresolved safety alerts. Edge perception sub-18ms interlocks are green.',
          chipNav: 'alerts'
        };
      }
      const topAlert = activeAlerts[0];
      return {
        text: `⚠️ **Active Safety Alerts (${activeAlerts.length} total, ${crit} critical)**:\nLatest: [${topAlert.alertType}] ${topAlert.message}\nRecommended: ${topAlert.recommendedAction || 'Dispatch floor supervisor.'}`,
        chipNav: 'alerts'
      };
    }

    // 3. Task Allocation / Scoring
    if (q.includes('task') || q.includes('score') || q.includes('allocate') || q.includes('assign') || q.includes('job')) {
      const pending = tasks.filter((t) => t.status === 'PENDING').length;
      const transit = tasks.filter((t) => t.status === 'IN_TRANSIT').length;
      return {
        text: `📋 **Task Allocation Engine**:\n- **Pending Jobs**: ${pending}\n- **In-Transit**: ${transit}\n- **Scoring Formula**: W_dist (35%) + W_bat (25%) + W_work (20%) + W_priority (10%) + W_congestion (10%).\n\nTrigger automatic scoring on the **Task Allocator** page.`,
        chipNav: 'tasks'
      };
    }

    // 4. Edge AI / Vision
    if (q.includes('vision') || q.includes('camera') || q.includes('edge') || q.includes('yolo') || q.includes('tensorrt')) {
      return {
        text: `👁️ **Sub-18ms Edge AI Perception**:\n- **Model**: YOLOv8-nano TensorRT INT8 Quantized\n- **Inference Time**: 14.2ms avg\n- **Hardware**: NVIDIA Jetson Orin NX (16GB LPDDR5)\n- Detects human workers, debris, forklifts, and pallets in real time.`,
        chipNav: 'edge-ai'
      };
    }

    // 5. Contact / Support
    if (q.includes('contact') || q.includes('help') || q.includes('phone') || q.includes('email') || q.includes('support') || q.includes('hq') || q.includes('bel')) {
      return {
        text: `📞 **BEL Operations HQ & Support Hotline**:\n- **24/7 Hotline**: +91 1800-MARG-GRID (+91 1800-63987-267)\n- **Email**: ops@marg.bel.gov.in\n- **Command Center**: BEL CRL R&D Complex, Bengaluru - 560013.`,
        chipNav: 'dashboard'
      };
    }

    // Default fallback
    return {
      text: `💡 **M.A.R.G. INF AI Assistant**: I am synchronized with live WebSocket telemetry. You can ask me about:\n- Fleet Status & Battery Levels\n- Live Hazards & E-Stop Interlocks\n- Multi-Robot A* Path Coordination\n- BEL Operations HQ Support`,
      chipNav: 'dashboard'
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = generateBotResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: resp.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        chipNav: resp.chipNav
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    { label: '🤖 Fleet Status', query: 'What is the status of the AMR fleet?' },
    { label: '⚠️ Active Hazards', query: 'Are there any active hazards or alerts?' },
    { label: '🎯 Task Scoring', query: 'How does task allocation scoring work?' },
    { label: '📞 Contact HQ', query: 'What is the emergency support contact number?' }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      
      {/* Trigger Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer border border-sky-400/40 transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px] animate-pulse">smart_toy</span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>INF AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-sky-200/80 font-mono">Live Telemetry Chat</div>
          </div>
        </button>
      )}

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-[#0c0c10]/95 border border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>INF AI Assistant</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono">SIH26123 Autonomous Fleet Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-base cursor-pointer transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs no-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-md'
                  }`}
                >
                  {m.text}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono text-neutral-500">{m.timestamp}</span>
                  {m.chipNav && onNavigate && (
                    <button
                      onClick={() => onNavigate(m.chipNav!)}
                      className="text-[9px] font-mono font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open {m.chipNav}</span>
                      <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-neutral-900/80 border border-neutral-800 rounded-xl w-fit text-neutral-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-200" />
                <span className="ml-1">INF AI thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="px-4 py-2 bg-neutral-950/80 border-t border-neutral-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.query)}
                className="shrink-0 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-full text-[10px] font-medium transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask INF AI about fleet status, telemetry..."
              className="flex-1 bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMsg.trim()}
              className="p-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
