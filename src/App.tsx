import { useState, useEffect } from 'react';
import { ActiveView, Language, UserRole, Theme } from './types';
import { NavBar } from './components/NavBar';
import { DashboardView } from './components/DashboardView';
import { WarehouseDigitalTwinView } from './components/WarehouseDigitalTwinView';
import { AmrFleetView } from './components/AmrFleetView';
import { TaskAllocationView } from './components/TaskAllocationView';
import { MultiRobotCoordinationView } from './components/MultiRobotCoordinationView';
import { EdgeAiPerceptionView } from './components/EdgeAiPerceptionView';
import { WarehouseAnalyticsView } from './components/WarehouseAnalyticsView';
import { JudgeDemoSimulationView } from './components/JudgeDemoSimulationView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';

import { BelFooter } from './components/BelFooter';
import { InfAiChatbot } from './components/InfAiChatbot';
import { LoginView } from './components/LoginView';
import { AmrDetailSheet } from './components/AmrDetailSheet';
import { useRealtimeData } from './services/realtime';
import { isViewAllowedForRole, getDefaultViewForRole } from './config/permissions';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('nagar_user_role') as UserRole;
    const validRoles: UserRole[] = [
      'Warehouse Operations Director',
      'Fleet Systems Engineer',
      'Safety & Edge AI Specialist',
      'Warehouse Floor Supervisor'
    ];
    if (savedRole && validRoles.includes(savedRole)) return savedRole;
    return 'Warehouse Operations Director';
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const savedRole = (localStorage.getItem('nagar_user_role') as UserRole) || 'Warehouse Operations Director';
    const saved = localStorage.getItem('nagar_active_view') as ActiveView;
    if (saved && isViewAllowedForRole(saved, savedRole)) return saved;
    return getDefaultViewForRole(savedRole);
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nagar_language');
    if (saved === 'hi' || saved === 'en') return saved;
    return 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nagar_theme') as Theme;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [audioMuted, setAudioMuted] = useState(false);

  // Realtime Live Data Hook
  const { state: realtimeState, refreshData, selectAmr } = useRealtimeData();

  useEffect(() => { localStorage.setItem('nagar_active_view', activeView); }, [activeView]);
  useEffect(() => { localStorage.setItem('nagar_user_role', userRole); }, [userRole]);
  useEffect(() => {
    if (!isViewAllowedForRole(activeView, userRole)) {
      setActiveView(getDefaultViewForRole(userRole));
    }
  }, [userRole, activeView]);
  useEffect(() => { localStorage.setItem('nagar_language', language); }, [language]);
  useEffect(() => {
    localStorage.setItem('nagar_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setActiveView(getDefaultViewForRole(role));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (!isViewAllowedForRole(activeView, newRole)) {
      setActiveView(getDefaultViewForRole(newRole));
    }
  };

  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return (
      <LoginView
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogin={handleLogin}
      />
    );
  }

  const selectedAmr = realtimeState.amrs.find((a) => a.id === realtimeState.selectedAmrId) || null;
  const unreadAlerts = realtimeState.alerts.filter((a) => !a.resolved).length;

  return (
    <div className={`min-h-screen w-full font-sans antialiased transition-colors ${
      theme === 'dark' ? 'bg-[#09090b] text-[#f4f4f5] dark' : 'bg-[#fafafa] text-[#09090b]'
    }`}>

      {/* ── Minimalist Top Navigation Header ── */}
      <NavBar
        activeView={activeView}
        setActiveView={setActiveView}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        isConnected={realtimeState.isConnected}
        unreadAlertsCount={unreadAlerts}
        audioMuted={audioMuted}
        onToggleAudioMute={() => setAudioMuted(!audioMuted)}
        latestEvent={realtimeState.latestEvent}
      />

      {/* ── Main scrollable content ── */}
      <main className="pt-[96px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* 0. Dashboard */}
          {activeView === 'dashboard' && (
            <DashboardView
              language={language}
              amrs={realtimeState.amrs}
              tasks={realtimeState.tasks}
              conflicts={realtimeState.conflicts}
              alerts={realtimeState.alerts}
              metrics={realtimeState.metrics}
              isConnected={realtimeState.isConnected}
              onNavigate={(view) => setActiveView(view)}
              onSelectAmr={(id) => selectAmr(id)}
            />
          )}

          {/* 1. Digital Twin / Warehouse Grid */}
          {(activeView === 'overview' || activeView === 'warehouse') && (
            <WarehouseDigitalTwinView
              language={language}
              amrs={realtimeState.amrs}
              zones={realtimeState.zones}
              stations={realtimeState.stations}
              obstacles={realtimeState.obstacles}
              onSelectAmr={(id) => selectAmr(id)}
              onRefresh={refreshData}
            />
          )}

          {/* 2. AMR Fleet */}
          {activeView === 'fleet' && (
            <AmrFleetView
              language={language}
              amrs={realtimeState.amrs}
              onSelectAmr={(id) => selectAmr(id)}
              onRefresh={refreshData}
            />
          )}

          {/* 3. Task Allocation */}
          {activeView === 'tasks' && (
            <TaskAllocationView
              language={language}
              tasks={realtimeState.tasks}
              stations={realtimeState.stations}
              onRefresh={refreshData}
            />
          )}

          {/* 4. Multi-Robot Coordination */}
          {activeView === 'coordination' && (
            <MultiRobotCoordinationView
              language={language}
              conflicts={realtimeState.conflicts}
              onRefresh={refreshData}
            />
          )}

          {/* 5. Edge AI Perception */}
          {activeView === 'edge-ai' && (
            <EdgeAiPerceptionView
              language={language}
              perceptions={realtimeState.perceptions}
            />
          )}

          {/* 6. Operational Alerts */}
          {activeView === 'alerts' && (
            <NotificationsView
              language={language}
              alerts={realtimeState.alerts}
              onRefresh={refreshData}
            />
          )}

          {/* 7. Warehouse Analytics */}
          {activeView === 'analytics' && (
            <WarehouseAnalyticsView
              language={language}
              metrics={realtimeState.metrics}
            />
          )}

          {/* 8. SIH Judge Demo Simulation */}
          {activeView === 'simulation' && (
            <JudgeDemoSimulationView
              language={language}
              onRefresh={refreshData}
            />
          )}

          {/* 10. Settings */}
          {activeView === 'settings' && (
            <SettingsView
              language={language}
              onToggleLanguage={toggleLanguage}
              userRole={userRole}
            />
          )}



        </div>
        
        {/* ── Sovereign BEL Footer ── */}
        <BelFooter
          language={language}
          onNavigate={(view) => setActiveView(view)}
        />
      </main>

      {/* ── INF AI Floating Chatbot Widget (Every Page) ── */}
      <InfAiChatbot
        language={language}
        amrs={realtimeState.amrs}
        tasks={realtimeState.tasks}
        alerts={realtimeState.alerts}
        metrics={realtimeState.metrics}
        conflicts={realtimeState.conflicts}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* ── AMR Detail Progressive Disclosure Sheet ── */}
      <AmrDetailSheet
        amr={selectedAmr}
        tasks={realtimeState.tasks}
        language={language}
        onClose={() => selectAmr(null)}
        onRefresh={refreshData}
      />
    </div>
  );
}
