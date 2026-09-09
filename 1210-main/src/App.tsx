/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PageId, WatershedRegion, RiverGauge, AlertItem, ThemeConfig, ThemeMode, RescueCamp, FloodTypeWarning } from './types';
import {
  WATERSHED_REGIONS,
  INITIAL_GAUGES,
  SENSOR_CATEGORIES,
  INITIAL_ALERTS,
  RESCUE_CAMPS,
  FLOOD_TYPE_WARNINGS,
  getRegionDataset,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { AlertsDrawer } from './components/AlertsDrawer';
import { ThemeModal } from './components/ThemeModal';
import { DashboardView } from './components/DashboardView';
import { FloodMapView } from './components/FloodMapView';
import { PredictionView } from './components/PredictionView';
import { RiverGaugesView } from './components/RiverGaugesView';
import { SensorsView } from './components/SensorsView';
import { ImpactView } from './components/ImpactView';
import { ExplainabilityView } from './components/ExplainabilityView';
import { HistoryView } from './components/HistoryView';
import { AlertsView } from './components/AlertsView';
import { RescueCampsView } from './components/RescueCampsView';
import { FloodTypesView } from './components/FloodTypesView';
import { Activity, Check, Info, ShieldCheck, Waves } from 'lucide-react';
import { TeamAlertSyncView } from './components/TeamAlertSyncView';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('Dashboard');
  const [currentRegion, setCurrentRegion] = useState<WatershedRegion>(WATERSHED_REGIONS[0]);
  const [gauges, setGauges] = useState<RiverGauge[]>(INITIAL_GAUGES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [rescueCamps, setRescueCamps] = useState<RescueCamp[]>(RESCUE_CAMPS);
  const [floodWarnings, setFloodWarnings] = useState<FloodTypeWarning[]>(FLOOD_TYPE_WARNINGS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentDataset = useMemo(() => getRegionDataset(currentRegion.id), [currentRegion.id]);

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('floodai_theme_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback if localStorage is inaccessible
    }
    return {
      mode: 'deep-ops',
      accent: 'amber',
      highContrast: false,
    };
  });

  // Sync theme changes to body DOM classes and localStorage
  useEffect(() => {
    const root = document.body;
    root.classList.remove('theme-deep-ops', 'theme-oled-black', 'theme-night-vision', 'theme-daylight');
    root.classList.add(`theme-${themeConfig.mode}`);

    root.classList.remove('accent-cyan', 'accent-emerald', 'accent-amber', 'accent-blue');
    root.classList.add(`accent-${themeConfig.accent}`);

    if (themeConfig.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    try {
      localStorage.setItem('floodai_theme_config', JSON.stringify(themeConfig));
    } catch (e) {
      // Ignore storage error in sandbox
    }
  }, [themeConfig]);

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged && a.severity === 'critical').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleQuickToggleTheme = () => {
    setThemeConfig((prev) => {
      const nextMode: ThemeMode = prev.mode === 'daylight' ? 'deep-ops' : 'daylight';
      showToast(
        `Switched display profile to ${
          nextMode === 'daylight' ? 'Daylight Field Ops' : 'Night Mode (Deep Ops)'
        }.`
      );
      return { ...prev, mode: nextMode };
    });
  };

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSyncTime(timeStr);

      // Apply subtle realistic jitter to live gauges
      setGauges((prev) =>
        prev.map((g) => {
          const delta = (Math.random() - 0.45) * 0.04;
          const newLevel = Number((g.currentLevel + delta).toFixed(2));
          return {
            ...g,
            currentLevel: newLevel,
            lastUpdated: 'Just now',
          };
        })
      );

      setIsRefreshing(false);
      showToast('Live telemetry refreshed from 127 basin gauging nodes.');
    }, 600);
  };

  const handleToggleSimulation = () => {
    const next = !isSimulating;
    setIsSimulating(next);
    showToast(
      next
        ? 'Hydrodynamic flood surge simulation activated. Inundation mesh recalculating.'
        : 'Inundation simulation stopped. Reverted to live physical observations.'
    );
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    showToast('Alert acknowledged and logged in incident record.');
  };

  const handleDispatchAlert = (alertId: string) => {
    showToast('Emergency SMS & Municipal sirens broadcasted to affected zone.');
  };

  const handleAddNewAlert = (newAlert: AlertItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`Govt Emergency Broadcast Transmitted: "${newAlert.title}"`);
  };

  const handleBroadcastEvacuation = (camp: RescueCamp) => {
    setActivePage('Alerts');
    showToast(`Evacuation directive for ${camp.name} loaded into Govt Broadcast Console.`);
  };

  const handleTriggerFloodWarning = (warning: FloodTypeWarning) => {
    setActivePage('Alerts');
    showToast(`Threat advisory for ${warning.name} loaded into Govt Broadcast Console.`);
  };

  return (
    <div className="app-shell min-h-screen text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-100">
      <div className="ambient-field" aria-hidden="true">
        <span className="ambient-glow ambient-glow-one" />
        <span className="ambient-glow ambient-glow-two" />
        <span className="aurora-orb aurora-orb-one" />
        <span className="aurora-orb aurora-orb-two" />
        <span className="mesh-ribbon mesh-ribbon-one" />
        <span className="mesh-ribbon mesh-ribbon-two" />
        <span className="ambient-grid" />
      </div>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-region fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200" role="status" aria-live="polite">
          <div className="glass-panel px-4 py-3 rounded-2xl text-slate-100 shadow-2xl flex items-center gap-2.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Responsive Modernized Top Navbar */}
      <Navbar
        activePage={activePage}
        onSelectPage={setActivePage}
        regions={WATERSHED_REGIONS}
        currentRegion={currentRegion}
        onSelectRegion={(reg) => {
          const ds = getRegionDataset(reg.id);
          setCurrentRegion(reg);
          setGauges(ds.gauges);
          setAlerts(ds.alerts);
          setRescueCamps(ds.camps);
          showToast(`Switched monitoring view to ${reg.name}.`);
        }}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlertsDrawer={() => setAlertsDrawerOpen(true)}
        lastSyncTime={lastSyncTime}
        onRefreshTelemetry={handleRefreshTelemetry}
        isRefreshing={isRefreshing}
        themeConfig={themeConfig}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onQuickToggleTheme={handleQuickToggleTheme}
      />

      {/* Slide-over Alerts Drawer */}
      <AlertsDrawer
        isOpen={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onViewAllAlerts={() => setActivePage('Alerts')}
      />

      {/* Display & Night Mode Customizer Modal */}
      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        config={themeConfig}
        onChangeConfig={(newConf) => {
          setThemeConfig(newConf);
          showToast(`Applied ${newConf.mode} display profile.`);
        }}
      />

      {/* Main Container Content */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:mx-0 lg:ml-64 lg:w-[calc(100%-16rem)] lg:max-w-none">
        <div className="page-context mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Activity className="h-3.5 w-3.5 text-indigo-300" />
            <span>Regional command surface</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="text-slate-500">{currentRegion.riverName || currentRegion.name} basin</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-200">
            <span className="status-pulse h-1.5 w-1.5 rounded-full bg-olive-300" />
            Perimeter telemetry online
          </div>
        </div>
        <div key={activePage} className="page-transition">
        {activePage === 'Dashboard' && (
          <DashboardView
            gauges={gauges}
            camps={rescueCamps}
            currentRegion={currentRegion}
            riskFactors={currentDataset.riskFactors}
            forecastData={currentDataset.forecastData}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'Flood Map' && (
          <FloodMapView
            gauges={gauges}
            camps={rescueCamps}
            currentRegion={currentRegion}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
          />
        )}

        {activePage === 'Rescue Camps' && (
          <RescueCampsView
            camps={rescueCamps}
            onBroadcastEvacuation={handleBroadcastEvacuation}
          />
        )}

        {activePage === 'Flood Types' && (
          <FloodTypesView
            warnings={floodWarnings}
            camps={rescueCamps}
            onTriggerAlert={handleTriggerFloodWarning}
          />
        )}

        {activePage === 'Prediction' && (
          <PredictionView forecastData={currentDataset.forecastData} />
        )}

        {activePage === 'River Gauges' && (
          <RiverGaugesView gauges={gauges} />
        )}

        {activePage === 'Sensors' && (
          <SensorsView sensors={SENSOR_CATEGORIES} />
        )}

        {activePage === 'Impact' && (
          <ImpactView impactNodes={currentDataset.impactNodes} />
        )}

        {activePage === 'Explainability' && (
          <ExplainabilityView riskFactors={currentDataset.riskFactors} />
        )}

        {activePage === 'History' && <HistoryView />}

        {activePage === 'Alerts' && (
          <AlertsView
            alerts={alerts}
            camps={rescueCamps}
            currentRegion={currentRegion}
            onAcknowledge={handleAcknowledgeAlert}
            onDispatchAlert={handleDispatchAlert}
            onAddNewAlert={handleAddNewAlert}
          />
        )}

        {activePage === 'Team Sync' && <TeamAlertSyncView />}
        </div>
      </main>

      {/* Operational Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/15 py-5 text-xs text-slate-400 lg:ml-64 lg:w-[calc(100%-16rem)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono-telemetry font-bold text-slate-300">
              FloodAI Command Center
            </span>
            <span className="text-slate-600">/</span>
            <span>Early Flood Warning & Safety System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              All Systems Operational
            </span>
            <span>Live Ground Height Mesh</span>
            <span>Government Meteorological Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

