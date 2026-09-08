import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Layers,
  MapPin,
  Menu,
  Moon,
  Play,
  RefreshCw,
  Search,
  Shield,
  Square,
  Sun,
  Waves,
  X,
  Radio,
  Palette,
  Eye,
  Clock,
  Calendar,
} from 'lucide-react';
import { PageId, WatershedRegion, ThemeConfig } from '../types';

interface NavbarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  regions: WatershedRegion[];
  currentRegion: WatershedRegion;
  onSelectRegion: (region: WatershedRegion) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  unreadAlertsCount: number;
  onOpenAlertsDrawer: () => void;
  lastSyncTime: string;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
  themeConfig: ThemeConfig;
  onOpenThemeModal: () => void;
  onQuickToggleTheme: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: string; badge?: string }[] = [
  { id: 'Dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'Flood Map', label: 'Live Map', icon: 'Map' },
  { id: 'Rescue Camps', label: 'Safe Camps', icon: 'Building2', badge: 'Safe Places' },
  { id: 'Flood Types', label: 'Flood Types', icon: 'ShieldAlert', badge: 'Safety' },
  { id: 'Alerts', label: 'Emergency Alerts', icon: 'Bell', badge: 'Alerts' },
  { id: 'Prediction', label: 'Water Forecast', icon: 'TrendingUp' },
  { id: 'River Gauges', label: 'River Levels', icon: 'Gauge' },
  { id: 'Sensors', label: 'Sensors', icon: 'Radio' },
  { id: 'Impact', label: 'Where Water Flows', icon: 'GitCommit' },
  { id: 'Explainability', label: 'Why Risk Rises', icon: 'Brain' },
  { id: 'History', label: 'Past Accuracy', icon: 'History' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onSelectPage,
  regions,
  currentRegion,
  onSelectRegion,
  isSimulating,
  onToggleSimulation,
  unreadAlertsCount,
  onOpenAlertsDrawer,
  lastSyncTime,
  onRefreshTelemetry,
  isRefreshing,
  themeConfig,
  onOpenThemeModal,
  onQuickToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [liveClock, setLiveClock] = useState(new Date());

  // Real-time ticking clock for control room operations
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const localTimeStr = liveClock.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const istTimeStr =
    liveClock.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';

  const dateFormatted = liveClock.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getThemeIcon = () => {
    switch (themeConfig.mode) {
      case 'oled-black':
        return Shield;
      case 'night-vision':
        return Eye;
      case 'daylight':
        return Sun;
      case 'deep-ops':
      default:
        return Moon;
    }
  };

  const ThemeIconComponent = getThemeIcon();

  return (
    <header className="desktop-rail sticky top-0 z-40 w-full bg-[#080d19]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
      {/* Top Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:mx-0 lg:h-auto lg:w-full lg:flex-col lg:items-stretch lg:gap-5 lg:px-4 lg:py-5">
        {/* Brand & Region Selector */}
        <div className="flex items-center gap-3 lg:flex-col lg:items-stretch lg:gap-4">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onSelectPage('Dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            id="brand-logo-btn"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:border-cyan-400/50 group-hover:scale-105 transition-all shadow-sm shadow-cyan-950/40">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-extrabold tracking-tight text-white font-mono-telemetry">
                  FLOOD<span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  CMD
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider hidden sm:block">
                Flood Warning & Safety Center
              </span>
            </div>
          </div>

          {/* Region Dropdown Selector */}
          <div className="relative hidden md:block ml-2 lg:ml-0">
            <button
              id="region-selector-btn"
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all shadow-inner"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentRegion.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  regionDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {regionDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#0e1626] border border-slate-700/90 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                id="region-dropdown-menu"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select River Area
                </div>
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => {
                      onSelectRegion(reg);
                      setRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/80 transition-colors ${
                      reg.id === currentRegion.id
                        ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                        : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{reg.name}</div>
                      <div className="text-[10px] text-slate-400">{reg.sensorsCount} active water sensors</div>
                    </div>
                    {reg.id === currentRegion.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Live Real-time Clock & Telemetry Status Pill */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner lg:order-3 lg:rounded-xl lg:flex-wrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{localTimeStr}</span>
            <span className="text-slate-500 font-normal hidden lg:inline">({istTimeStr})</span>
          </div>
          <span className="text-slate-700 hidden lg:inline">•</span>
          <span className="text-slate-300 text-[11px] font-medium hidden lg:inline">{dateFormatted}</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400 text-[10px]">
            {currentRegion.sensorsCount} Sensors Online • <span className="text-slate-400">Synced: </span>
            <span className="text-emerald-400 font-mono font-medium">{lastSyncTime}</span>
          </span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:order-2 lg:flex-wrap lg:justify-between">
          {/* Refresh Telemetry */}
          <button
            id="refresh-telemetry-btn"
            onClick={onRefreshTelemetry}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-800 transition-all disabled:opacity-50"
            title="Poll real-time sensor updates"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
            />
          </button>

          {/* Simulation Toggle Button */}
          <button
            id="toggle-simulation-btn"
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Sim Running</span>
                <span className="sm:hidden">Sim</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Simulate Rising Water</span>
                <span className="sm:hidden">Sim</span>
              </>
            )}
          </button>

          {/* Theme & Night Mode Controls Group */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
            {/* Quick Night Mode / Day Mode Toggle */}
            <button
              id="theme-quick-toggle-btn"
              onClick={onQuickToggleTheme}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title={`Current: ${themeConfig.mode}. Click to quickly toggle Day/Night Mode.`}
              aria-label="Toggle Night/Day Mode"
            >
              <ThemeIconComponent className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline text-[11px] font-medium capitalize">
                {themeConfig.mode === 'daylight' ? 'Day' : 'Night'}
              </span>
            </button>

            {/* Open Full Color & Night Mode Customizer Modal */}
            <button
              id="theme-palette-modal-btn"
              onClick={onOpenThemeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Display Profiles & Color Night Mode Studio"
              aria-label="Customize themes and night mode"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert Center Trigger */}
          <button
            id="open-alerts-drawer-btn"
            onClick={onOpenAlertsDrawer}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 transition-colors"
            title="Operational Alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[10px] ring-2 ring-[#080d19]">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Secondary Subnav (Desktop) */}
      <nav
        className="hidden lg:block border-t border-slate-800/60 bg-[#090f1d]/70 overflow-x-auto lg:border-t-0 lg:overflow-visible"
        id="desktop-subnav"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 py-1.5 lg:mx-0 lg:w-full lg:flex-col lg:items-stretch lg:gap-1.5 lg:px-4 lg:py-0">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 lg:w-full lg:justify-between ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'Alerts' && unreadAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-slate-800 bg-[#090f1d] px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150"
          id="mobile-nav-panel"
        >
          {/* Region Switcher on Mobile */}
          <div className="pb-2 mb-2 border-b border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">Watershed Region</div>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => onSelectRegion(reg)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    reg.id === currentRegion.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {reg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode Switcher on Mobile */}
          <div className="pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">
              <span>Display & Night Mode</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenThemeModal();
                }}
                className="text-cyan-400 normal-case font-medium hover:underline flex items-center gap-1"
              >
                <Palette className="w-3 h-3" /> Palette Studio
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'deep-ops', label: 'Deep Ops Night', icon: Moon },
                { id: 'oled-black', label: 'OLED Black', icon: Shield },
                { id: 'night-vision', label: 'Tactical Red', icon: Eye },
                { id: 'daylight', label: 'Daylight Ops', icon: Sun },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = themeConfig.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onQuickToggleTheme();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'Alerts' && unreadAlertsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-mono text-cyan-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{localTimeStr}</span>
            </span>
            <span>Synced {lastSyncTime}</span>
          </div>
        </div>
      )}
    </header>
  );
};
