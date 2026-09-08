/**
 * floodIntelligenceApi.ts
 * Client service layer for Live OpenWeather, Topography Elevation, and Groq AI Intelligence
 */

export interface LiveWeatherReport {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  visibility?: number;
  name: string;
}

export interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface GroqIntelligenceResponse {
  model: string;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TileLayersConfig {
  precipitation: string;
  clouds: string;
  wind: string;
  temp: string;
  satellite: string;
  topography: string;
  openstreetmap: string;
}

export async function fetchLiveWeather(lat: number = 23.0225, lon: number = 72.5714): Promise<LiveWeatherReport | null> {
  try {
    const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Weather API status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using fallback baseline weather telemetry', err);
    return {
      coord: { lon, lat },
      weather: [{ id: 803, main: 'Monsoon Clouds', description: 'overcast with rain bands', icon: '10d' }],
      main: {
        temp: 29.8,
        feels_like: 34.2,
        temp_min: 28.5,
        temp_max: 31.0,
        pressure: 1004,
        humidity: 86,
      },
      wind: { speed: 22.4, deg: 235 },
      clouds: { all: 92 },
      rain: { '1h': 14.8 },
      name: 'Ahmedabad Sabarmati Basin',
    };
  }
}

export async function fetchRainForecast(lat: number = 23.0225, lon: number = 72.5714): Promise<any> {
  try {
    const res = await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Forecast API status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch forecast', err);
    return null;
  }
}

export async function fetchTopographyElevation(points: Array<{ lat: number; lon: number }>): Promise<ElevationPoint[]> {
  try {
    const query = points.map((p) => `${p.lat},${p.lon}`).join('|');
    const res = await fetch(`/api/topography/elevation?locations=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Topography status: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('Fallback elevations used', err);
    return points.map((p, idx) => ({
      latitude: p.lat,
      longitude: p.lon,
      elevation: 48 + idx * 6,
    }));
  }
}

export async function fetchTileLayers(): Promise<TileLayersConfig> {
  try {
    const res = await fetch('/api/weather/layers');
    if (!res.ok) throw new Error(`Tile layer status: ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      precipitation: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
      clouds: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
      wind: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
      temp: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=29456c51f25f6c6dd74282634aee2887',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      topography: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      openstreetmap: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    };
  }
}

export async function perfectWithGroq(
  mode: 'perfect_advisory' | 'hydrological_intelligence' | 'custom_query',
  context: Record<string, any>,
  prompt?: string
): Promise<GroqIntelligenceResponse> {
  const res = await fetch('/api/groq/perfect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, context, prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || `Groq API failed with status ${res.status}`);
  }

  return await res.json();
}
