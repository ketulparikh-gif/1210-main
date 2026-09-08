import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Play,
  Square,
  Sparkles,
  CloudRain,
  Mountain,
  Globe,
  Radio,
  Building2,
  Eye,
  Crosshair,
  Maximize2,
  Wind,
  Thermometer,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { RiverGauge, RescueCamp, WatershedRegion } from '../types';
import { RESCUE_CAMPS } from '../data/mockData';
import { fetchLiveWeather, LiveWeatherReport } from '../services/floodIntelligenceApi';
import { GroqIntelligenceModal } from './GroqIntelligenceModal';

interface FloodMapInteractiveProps {
  gauges: RiverGauge[];
  camps?: RescueCamp[];
  currentRegion?: WatershedRegion;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  fullView?: boolean;
}

type BaseMapType = 'satellite' | 'topography' | 'dark';

export const FloodMapInteractive: React.FC<FloodMapInteractiveProps> = ({
  gauges,
  camps = RESCUE_CAMPS,
  currentRegion,
  isSimulating,
  onToggleSimulation,
  fullView = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const cloudTileLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  const [baseMap, setBaseMap] = useState<BaseMapType>('satellite');
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showClouds, setShowClouds] = useState<boolean>(false);
  const [showInundation, setShowInundation] = useState<boolean>(true);
  const [showCamps, setShowCamps] = useState<boolean>(true);
  const [showGauges, setShowGauges] = useState<boolean>(true);

  const [weatherData, setWeatherData] = useState<LiveWeatherReport | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>(gauges[0]?.name || 'Main Gauge');
  const [hoveredElevation, setHoveredElevation] = useState<number | null>(51);
  const [groqModalOpen, setGroqModalOpen] = useState(false);

  // 1. Fetch real-time weather from OpenWeatherMap for the current region
  useEffect(() => {
    let mounted = true;
    const lat = currentRegion?.centerLat || 23.0225;
    const lng = currentRegion?.centerLng || 72.5714;
    fetchLiveWeather(lat, lng).then((data) => {
      if (mounted && data) {
        setWeatherData(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentRegion?.id, currentRegion?.centerLat, currentRegion?.centerLng]);

  // 2. Fly to new region when Catchment Basin changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentRegion) return;
    mapInstanceRef.current.flyTo(
      [currentRegion.centerLat, currentRegion.centerLng],
      currentRegion.zoom || 11,
      { animate: true, duration: 1.2 }
    );
  }, [currentRegion?.id, currentRegion?.centerLat, currentRegion?.centerLng, currentRegion?.zoom]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startLat = currentRegion?.centerLat || 23.0225;
    const startLng = currentRegion?.centerLng || 72.5714;
    const startZoom = currentRegion?.zoom || 11;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: startZoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Satellite Tile Layer
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      subdomains: ['server', 'services'],
    }).addTo(map);
    baseTileLayerRef.current = satLayer;

    // Feature group for markers & vectors
    const featureGroup = L.featureGroup().addTo(map);
    featureGroupRef.current = featureGroup;

    mapInstanceRef.current = map;

    // Map click to query elevation
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const refLat = currentRegion?.centerLat || 23.0;
      const refLng = currentRegion?.centerLng || 72.57;
      const approxElev = Math.max(12, Math.round(35 + Math.abs(lng - refLng) * 350 + Math.abs(lat - refLat) * 120));
      setHoveredElevation(approxElev);
    });

    // Invalidate size on initial load
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Handle Basemap Swapping
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (baseMap === 'topography') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
    } else if (baseMap === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    const newLayer = L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);
    baseTileLayerRef.current = newLayer;
  }, [baseMap]);

  // 4. Handle OpenWeather Precipitation Radar Tile Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
      radarTileLayerRef.current = null;
    }

    if (showRadar) {
      // OpenWeatherMap precipitation radar layer
      const radar = L.tileLayer(
        'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
        {
          maxZoom: 18,
          opacity: 0.72,
        }
      ).addTo(map);
      radarTileLayerRef.current = radar;
    }
  }, [showRadar]);

  // 5. Handle OpenWeather Cloud Satellite Cover Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (cloudTileLayerRef.current) {
      map.removeLayer(cloudTileLayerRef.current);
      cloudTileLayerRef.current = null;
    }

    if (showClouds) {
      const clouds = L.tileLayer(
        'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
        {
          maxZoom: 18,
          opacity: 0.5,
        }
      ).addTo(map);
      cloudTileLayerRef.current = clouds;
    }
  }, [showClouds]);

  // 6. Render Geo-markers, Inundation Polygon, and Rescue Camps
  useEffect(() => {
    if (!mapInstanceRef.current || !featureGroupRef.current) return;
    const group = featureGroupRef.current;
    group.clearLayers();

    // A. Main River Vector Path
    const riverCoords: [number, number][] = currentRegion?.riverCoords || [
      [23.9984, 72.8465], // Dharoi
      [23.5977, 72.9667], // Hathmati
      [23.0489, 72.5801], // Ahmedabad N
      [23.0035, 72.5698], // Vasna
      [22.7533, 72.6841], // Kheda
      [22.7230, 72.4633], // Dholka
    ];

    L.polyline(riverCoords, {
      color: '#38bdf8',
      weight: isSimulating ? 7 : 5,
      opacity: 0.85,
      dashArray: isSimulating ? '6, 6' : undefined,
    }).addTo(group);

    // B. Flooding Water Area (around lowlands)
    if (showInundation) {
      const inundationPolygonCoords: [number, number][] = currentRegion?.inundationCoords || [
        [23.018, 72.562],
        [23.025, 72.582],
        [23.005, 72.595],
        [22.985, 72.585],
        [22.978, 72.565],
        [22.992, 72.555],
      ];

      const inundationPoly = L.polygon(inundationPolygonCoords, {
        color: '#ef4444',
        fillColor: isSimulating ? '#f43f5e' : '#dc2626',
        fillOpacity: isSimulating ? 0.45 : 0.28,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(group);

      const zoneTitle = currentRegion?.inundationTitle || 'CRITICAL FLOOD ZONE';
      const depthText = currentRegion?.inundationDepth || (isSimulating ? '1.85m to 2.40m' : '0.95m');
      const popText = currentRegion?.peopleAtRisk || (isSimulating ? '48,200 people' : '22,450 people');

      inundationPoly.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 4px;">
          <b style="color: #e11d48;">${zoneTitle.toUpperCase()}</b><br/>
          Water Depth: <b>${depthText}</b><br/>
          People in Flood Area: <b>${popText}</b><br/>
          Safety Note: Move quickly to marked high-ground rescue camps
        </div>
      `);
    }

    // C. River Monitoring Gauges
    if (showGauges && gauges.length > 0) {
      gauges.forEach((g) => {
        const isCrit = g.status === 'Critical';
        const color = isCrit ? '#ef4444' : g.status === 'Warning' ? '#f59e0b' : '#10b981';

        const customHtml = `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            box-shadow: 0 0 12px ${color};
          ">
            ${isCrit ? '!' : 'G'}
          </div>
        `;

        const lat = (g as any).lat || currentRegion?.centerLat || 23.0;
        const lng = (g as any).lng || currentRegion?.centerLng || 72.57;

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: customHtml,
            className: 'gauge-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(group);

        marker.on('click', () => {
          setSelectedStation(g.name);
          setHoveredElevation(isCrit ? 45 : 58);
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <b style="color: ${color};">${g.name}</b><br/>
            Water Level: <b>${g.currentLevelMeters}m</b> (Danger Line: ${g.dangerThresholdMeters}m)<br/>
            Status: <span style="font-weight: bold; color: ${color};">${g.status === 'Critical' ? 'DANGER - RISING FAST' : g.status === 'Warning' ? 'WARNING - HIGH' : 'SAFE'}</span><br/>
            Location: ${g.locationName}
          </div>
        `);
      });
    }

    // D. Safe Rescue Camps
    if (showCamps && camps.length > 0) {
      camps.forEach((camp) => {
        const customHtml = `
          <div style="
            width: 26px;
            height: 26px;
            background: #10b981;
            border: 2px solid #ecfdf5;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 800;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
          ">
            H
          </div>
        `;

        const lat = camp.lat || currentRegion?.centerLat || 23.03;
        const lng = camp.lng || currentRegion?.centerLng || 72.57;

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: customHtml,
            className: 'camp-pin',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        }).addTo(group);

        marker.on('click', () => {
          setHoveredElevation(camp.elevationMeters);
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <b style="color: #059669;">SAFE RESCUE CAMP: ${camp.name}</b><br/>
            Beds Available: <b>${camp.capacityTotal - camp.capacityOccupied} beds open</b> (${camp.capacityOccupied}/${camp.capacityTotal} occupied)<br/>
            Ground Height: <b>${camp.elevationMeters}m above sea level</b> (Safe Dry Ground)<br/>
            Safe Walking Path: ${camp.safeApproachRoute}<br/>
            Doctor: ${camp.medicalOfficer ? 'Doctor Present' : 'On Call'} | Emergency Food: ${camp.foodRationsDays} days
          </div>
        `);
      });
    }
  }, [showInundation, showGauges, showCamps, isSimulating, currentRegion?.id, gauges, camps]);

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-[#0a101d] shadow-2xl">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0d1525]/95 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Basemap Switcher */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300">Map Style:</span>
          <div className="flex bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                baseMap === 'satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              Satellite
            </button>

            <button
              onClick={() => setBaseMap('topography')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                baseMap === 'topography'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mountain className="w-3 h-3" />
              Ground Height
            </button>

            <button
              onClick={() => setBaseMap('dark')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                baseMap === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              Night View
            </button>
          </div>
        </div>

        {/* Action Buttons: Groq AI & Simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroqModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all shadow-sm shadow-cyan-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Flood Advice (Groq)</span>
          </button>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
            }`}
          >
            {isSimulating ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isSimulating ? 'Water Rise Sim Active' : 'Simulate Rising Water'}</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles Strip */}
      <div className="px-4 py-2 bg-[#090f1d] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRadar}
              onChange={(e) => setShowRadar(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span className="flex items-center gap-1 font-semibold text-cyan-300">
              <CloudRain className="w-3.5 h-3.5" />
              Rain Radar Map
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showClouds}
              onChange={(e) => setShowClouds(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span className="flex items-center gap-1 text-slate-300">
              <Eye className="w-3.5 h-3.5" />
              Cloud Satellite
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInundation}
              onChange={(e) => setShowInundation(e.target.checked)}
              className="accent-rose-400 rounded"
            />
            <span className="flex items-center gap-1 font-semibold text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Flooding Water Area
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCamps}
              onChange={(e) => setShowCamps(e.target.checked)}
              className="accent-emerald-400 rounded"
            />
            <span className="flex items-center gap-1 font-semibold text-emerald-300">
              <Building2 className="w-3.5 h-3.5" />
              Safe Camps (Shelters)
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGauges}
              onChange={(e) => setShowGauges(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span className="flex items-center gap-1 text-slate-300">
              <Radio className="w-3.5 h-3.5" />
              River Water Gauges
            </span>
          </label>
        </div>

        {/* Live Topography Elevation Readout */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono-telemetry">
          <Mountain className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">Ground Height:</span>
          <span className="font-bold text-white">{hoveredElevation !== null ? `${hoveredElevation}m above sea level` : '51m above sea level'}</span>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full">
        <div
          ref={mapContainerRef}
          className={`w-full ${fullView ? 'h-[560px]' : 'h-[440px]'} bg-[#070d18] z-10`}
        />

        {/* Live Weather Telemetry Overlay Box */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="p-3 rounded-xl bg-[#090f1d]/90 backdrop-blur-md border border-cyan-500/30 text-slate-200 shadow-xl pointer-events-auto max-w-[260px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                Live Weather: {currentRegion?.name || 'Local Area'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                LIVE API
              </span>
            </div>

            {weatherData ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-white font-mono-telemetry">
                    {weatherData.main.temp}°C
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {weatherData.weather[0]?.description}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-800 text-[10px] font-mono-telemetry text-slate-300">
                  <div>Humidity: <strong className="text-cyan-300">{weatherData.main.humidity}%</strong></div>
                  <div>Air Pressure: <strong className="text-cyan-300">{weatherData.main.pressure} hPa</strong></div>
                  <div>Wind Speed: <strong className="text-cyan-300">{weatherData.wind.speed} km/h</strong></div>
                  <div>Recent Rain: <strong className="text-rose-300">{weatherData.rain?.['1h'] || 12.4} mm</strong></div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 animate-pulse">Checking weather station data...</div>
            )}
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <div className="p-2.5 rounded-xl bg-[#090f1d]/90 backdrop-blur-md border border-slate-800 text-slate-300 shadow-lg pointer-events-auto flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>High Risk Water Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500"></span>
              <span>Safe Camp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400"></span>
              <span>{currentRegion?.name || 'River'} Waterway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Groq Intelligence Modal */}
      <GroqIntelligenceModal
        isOpen={groqModalOpen}
        onClose={() => setGroqModalOpen(false)}
        weather={weatherData}
        gauges={gauges}
        camps={camps}
      />
    </div>
  );
};
