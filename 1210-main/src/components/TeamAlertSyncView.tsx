import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Compass,
  Copy,
  Pencil,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Tv,
  UserRound,
  Users,
  Volume2,
  Waves,
} from 'lucide-react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ESCALATION_MINUTES = { critical: 2, warning: 6 };

const SEVERITIES = [
  { id: 'critical', label: 'Critical', dot: '#fb7185', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.35)', text: '#fda4af' },
  { id: 'warning', label: 'Warning', dot: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
  { id: 'advisory', label: 'Advisory', dot: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)', text: '#67e8f9' },
];

const FLOOD_TYPES = [
  { id: 'flash-flood', label: 'Flash Flood (Cloudburst)' },
  { id: 'dam-spillway', label: 'Dam Spillway Release' },
  { id: 'monsoon-riverine', label: 'Monsoon Riverine Rise' },
  { id: 'urban-drainage', label: 'Urban Drainage Waterlogging' },
  { id: 'cyclonic-surge', label: 'Coastal Cyclonic Surge' },
  { id: 'normal', label: 'Normal / All Clear' },
];

const CAMPS = [
  { id: 'camp-1', name: 'Sardar Patel Indoor Sports Complex', elevation: 54, route: 'Via 132ft Outer Ring Road', bedsTotal: 420 },
  { id: 'camp-2', name: 'Gujarat Vidyapith Relief Hall', elevation: 49, route: 'Via University Flyover Corridor', bedsTotal: 105 },
  { id: 'camp-3', name: 'Police Training Academy Grounds', elevation: 58, route: 'Direct Airport Road Expressway', bedsTotal: 1080 },
  { id: 'camp-4', name: 'Govt Model Higher Secondary School', elevation: 56, route: 'Drive-In Road Corridor', bedsTotal: 270 },
  { id: 'camp-5', name: 'Dholka Rural Community Hall', elevation: 38, route: 'State Highway 17 Bypass', bedsTotal: 5 },
];

const CHANNEL_DEFS = [
  { id: 'sms', label: 'Cell SMS', icon: Smartphone, on: '#22d3ee' },
  { id: 'siren', label: 'Siren', icon: Volume2, on: '#fb7185' },
  { id: 'media', label: 'TV / Radio', icon: Tv, on: '#fbbf24' },
  { id: 'ndrf', label: 'NDRF Radio', icon: Radio, on: '#34d399' },
];

const QUICK_TEMPLATES = [
  {
    id: 'flash', emoji: '⚡', label: 'Flash Flood',
    severity: 'critical', floodType: 'flash-flood',
    title: 'Upstream flash surge approaching within 60 minutes',
    description: 'Sudden cloudburst runoff detected upstream. Water expected to reach urban front rapidly.',
    actionRequired: 'Evacuate low-lying riverfront zones immediately.',
    channels: { sms: true, siren: true, media: false, ndrf: true },
  },
  {
    id: 'dam', emoji: '🌊', label: 'Dam Surge',
    severity: 'warning', floodType: 'dam-spillway',
    title: 'Dam spillway releasing controlled volume',
    description: 'Reservoir nearing capacity, gates opening on a 4-hour release schedule.',
    actionRequired: 'Move away from riverbanks and low bridges within 4 hours.',
    channels: { sms: true, siren: false, media: true, ndrf: true },
  },
  {
    id: 'shelter', emoji: '🏥', label: 'Shelter Open',
    severity: 'advisory', floodType: 'monsoon-riverine',
    title: 'Relief camp now accepting evacuees',
    description: 'Additional beds, food, and medical staff now available for affected wards.',
    actionRequired: 'Direct affected residents to the nearest shelter.',
    channels: { sms: true, siren: false, media: false, ndrf: false },
  },
  {
    id: 'safe', emoji: '🟢', label: 'All Clear',
    severity: 'advisory', floodType: 'normal',
    title: 'River levels back within safe limits',
    description: 'Water levels have receded below the warning mark across the basin.',
    actionRequired: 'Resume normal activity. Continue routine monitoring.',
    channels: { sms: true, siren: false, media: true, ndrf: false },
  },
];

const ROLES = [
  { id: 'command', label: 'Command Center', desc: 'Send, edit & retract alerts', icon: ShieldCheck, on: '#22d3ee' },
  { id: 'field', label: 'Field / Community', desc: 'View, acknowledge & track shelters', icon: UserRound, on: '#34d399' },
];

function generateTeamCode() {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function buildMessages(severity: 'critical' | 'warning' | 'advisory', floodLabel: string, camp: { name: string }) {
  const isUrgent = severity === 'critical' || severity === 'warning';
  if (isUrgent) {
    return {
      en: `URGENT: ${floodLabel}. Residents in low-lying wards must evacuate immediately. Shelter: ${camp.name}. Helpline: 1077.`,
      hi: `तत्काल: ${floodLabel}. निम्न क्षेत्र के लोग तुरंत सुरक्षित स्थान पर जाएं। शिविर: ${camp.name}. हेल्पलाइन: 1077।`,
      gu: `તાત્કાલિક: ${floodLabel}. નીચલા વિસ્તારના લોકો તુરંત સુરક્ષિત સ્થળે 이동 કરો. આશ્રયસ્થાન: ${camp.name}. હેલ્પલાઇન: 1077.`,
    };
  }
  return {
    en: `NOTICE: ${floodLabel}. Conditions remain manageable. Nearest shelter on standby: ${camp.name}. Helpline: 1077.`,
    hi: `सूचना: ${floodLabel}. स्थिति नियंत्रण में है। निकटतम राहत शिविर: "${camp.name}"। हेल्पलाइन: 1077।`,
    gu: `જાહેરાત: ${floodLabel}. પરિસ્થિતિ નિયંત્રણમાં છે. નજીકનું રાહત કેન્દ્ર: "${camp.name}". હેલ્પલાઇન: 1077.`,
  };
}

function useSiren() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback((seconds = 5) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 900;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      let t = 0;
      const modulate = () => {
        const frequency = 900 + Math.sin(t / 200) * 200;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        t += 1;
      };
      intervalRef.current = window.setInterval(modulate, 110);
      setPlaying(true);
      window.setTimeout(() => {
        stop();
      }, seconds * 1000);
      oscRef.current = oscillator;
      gainRef.current = gain;
      audioCtxRef.current = ctx;
    } catch (error) {
      console.warn('Siren unavailable in this browser context.', error);
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);
  return { play, stop, playing };
}

function ChannelBadges({ channels }: { channels?: Record<string, boolean> }) {
  const active = CHANNEL_DEFS.filter((c) => channels && channels[c.id]);
  if (!active.length) return null;

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {active.map((c) => {
        const Icon = c.icon;
        return (
          <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 999, padding: '4px 7px', color: '#cbd5e1', fontSize: 10, fontWeight: 700 }}>
            <Icon size={11} color={c.on} />
            {c.label}
          </span>
        );
      })}
    </div>
  );
}

function initials(name: string) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

function formatTimeLeft(ms: number) {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function AlertCard({
  alert,
  onAck,
  onRetract,
  onEditStart,
  canManage,
  userName,
  editing,
  editDraft,
  onEditChange,
  onEditSave,
  onEditCancel,
  nowTick,
}: any) {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const meta = SEVERITIES.find((s) => s.id === alert.severity) || SEVERITIES[1];
  const floodLabel = (FLOOD_TYPES.find((f) => f.id === alert.floodType) || {}).label || alert.floodType;
  const ackedBy = alert.ackedBy || [];
  const youAcked = userName && ackedBy.includes(userName);

  const isRetracted = alert.status === 'retracted';
  const escalationMin = ESCALATION_MINUTES[alert.severity as 'critical' | 'warning'];
  const canEscalate = !isRetracted && escalationMin && ackedBy.length === 0;
  const msLeft = canEscalate ? alert.expiresAt - nowTick : null;
  const isEscalated = canEscalate && msLeft <= 0;
  const timeLeftLabel = canEscalate && !isEscalated ? formatTimeLeft(msLeft) : null;

  const cardBg = isRetracted ? '#0d1017' : isEscalated ? 'rgba(244,63,94,0.16)' : ackedBy.length > 0 ? '#0d1017' : meta.bg;
  const cardBorder = isRetracted ? '#1e2230' : isEscalated ? 'rgba(244,63,94,0.55)' : ackedBy.length > 0 ? '#1e2230' : meta.border;
  const stripeColor = isRetracted ? 'transparent' : isEscalated ? '#fb7185' : meta.dot;

  if (editing) {
    return (
      <div style={{ padding: 14, borderRadius: 14, border: '1px solid #1e2230', background: '#0d1017' }}>
        <div style={{ marginBottom: 10, color: '#e2e8f0', fontWeight: 700 }}>Edit alert</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <input value={editDraft.title} onChange={(e) => onEditChange('title', e.target.value)} style={{ background: '#111827', border: '1px solid #374151', color: '#f8fafc', borderRadius: 10, padding: '10px 12px' }} />
          <textarea value={editDraft.description} onChange={(e) => onEditChange('description', e.target.value)} rows={3} style={{ background: '#111827', border: '1px solid #374151', color: '#f8fafc', borderRadius: 10, padding: '10px 12px', resize: 'vertical' }} />
          <textarea value={editDraft.actionRequired} onChange={(e) => onEditChange('actionRequired', e.target.value)} rows={2} style={{ background: '#111827', border: '1px solid #374151', color: '#f8fafc', borderRadius: 10, padding: '10px 12px', resize: 'vertical' }} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onEditCancel} style={{ padding: '8px 10px', borderRadius: 8, background: '#111827', color: '#dbeafe', border: '1px solid #334155' }}>Cancel</button>
          <button onClick={onEditSave} style={{ padding: '8px 10px', borderRadius: 8, background: '#22d3ee', color: '#04121a', fontWeight: 800 }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 14px 14px 12px', borderRadius: 14, background: cardBg, border: `1px solid ${cardBorder}`, borderLeft: `3px solid ${stripeColor}`, opacity: isRetracted ? 0.55 : 1 }}>
      {isEscalated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9, padding: '5px 9px', borderRadius: 8, background: 'rgba(244,63,94,0.22)', border: '1px solid rgba(244,63,94,0.5)', fontSize: 10.5, fontWeight: 800, color: '#fda4af', letterSpacing: '0.03em' }}>
          <AlertTriangle size={12} /> ESCALATED — no acknowledgment received
        </div>
      )}
      {isRetracted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9, fontSize: 10.5, fontWeight: 700, color: '#7e8597' }}>
          <Trash2 size={12} /> Retracted
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: meta.dot, marginTop: 5, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: meta.text, padding: '2px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.25)' }}>{meta.label}</span>
              {floodLabel && <span style={{ fontSize: 9.5, color: '#7e8597', padding: '2px 7px', borderRadius: 999, border: '1px solid #1e2230' }}>{floodLabel}</span>}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#f1f5f9', wordBreak: 'break-word' }}>{alert.title}{alert.edited && <span style={{ fontSize: 9.5, color: '#5c6478', fontWeight: 500, marginLeft: 6 }}>(edited)</span>}</div>
            {alert.description && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3, lineHeight: 1.5 }}>{alert.description}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {!isRetracted && (
            youAcked ? (
              <span style={{ fontSize: 10.5, color: '#34d399' }}>You acknowledged</span>
            ) : (
              <button onClick={() => onAck(alert.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, background: '#181c28', border: '1px solid #1e2230', color: '#cbd5e1', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                <CheckCircle2 size={12} color="#34d399" /> Ack
              </button>
            )
          )}
          {canManage && !isRetracted && (
            <div style={{ display: 'flex', gap: 5 }}>
              <button onClick={() => onEditStart(alert)} title="Edit" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 7px', borderRadius: 7, background: 'transparent', border: '1px solid #1e2230', color: '#7e8597', fontSize: 10, cursor: 'pointer' }}>
                <Pencil size={11} />
              </button>
              <button onClick={() => onRetract(alert.id)} title="Retract" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 7px', borderRadius: 7, background: 'transparent', border: '1px solid #1e2230', color: '#7e8597', fontSize: 10, cursor: 'pointer' }}>
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {alert.actionRequired && (
        <div style={{ marginTop: 9, padding: '7px 10px', borderRadius: 9, background: '#0d1017', border: '1px solid #1e2230', fontSize: 11, color: '#cbd5e1' }}>
          <span style={{ color: '#7e8597' }}>Action: </span>{alert.actionRequired}
        </div>
      )}

      {alert.campName && (
        <div style={{ marginTop: 8, padding: '7px 10px', borderRadius: 9, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 11, color: '#a5f3fc', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Compass size={12} />
          <span><b>{alert.campName}</b> · {alert.campElevation}m MSL · {alert.campRoute}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
        <ChannelBadges channels={alert.channels} />
        <span style={{ fontSize: 10, color: '#5c6478' }}>{alert.senderName ? `${alert.senderName} · ` : ''}{alert.timestamp}</span>
      </div>

      {!isRetracted && timeLeftLabel && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#7e8597' }}>
          <Clock3 size={11} /> Escalates in {timeLeftLabel} if unacknowledged
        </div>
      )}

      {ackedBy.length > 0 && (
        <div style={{ marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(148,163,184,0.08)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex' }}>
            {ackedBy.slice(0, 5).map((n: string, i: number) => (
              <div key={n + i} title={n} style={{ width: 18, height: 18, borderRadius: 999, background: '#181c28', border: '1px solid #1e2230', marginLeft: i === 0 ? 0 : -6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#94a3b8' }}>
                {initials(n)}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 10, color: '#5c6478' }}>{ackedBy.length} acknowledged{ackedBy.length > 5 ? ` (+${ackedBy.length - 5} more)` : ''}</span>
        </div>
      )}

      {alert.messages && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.08)' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {(['en', 'hi', 'gu'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '3px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', border: 'none', background: lang === l ? '#22d3ee' : '#0d1017', color: lang === l ? '#04121a' : '#7e8597' }}>{l}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.55, fontFamily: "'JetBrains Mono',monospace" }}>{alert.messages[lang]}</div>
        </div>
      )}
    </div>
  );
}

function StatusStrip({ activeCount, unackedCount, escalatedCount, openBeds, worstSeverity }: { activeCount: number; unackedCount: number; escalatedCount: number; openBeds: number; worstSeverity?: string | null }) {
  const meta = worstSeverity ? SEVERITIES.find((s) => s.id === worstSeverity) : null;
  const statusColor = meta ? meta.dot : '#34d399';
  const statusLabel = activeCount === 0 ? 'All clear' : `${meta ? meta.label : 'Advisory'} conditions active`;
  const stats = [
    { label: 'Active alerts', value: activeCount },
    { label: 'Awaiting ack', value: unackedCount },
    { label: 'Escalated', value: escalatedCount },
    { label: 'Shelter beds open', value: openBeds },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'stretch', background: '#12151e', border: '1px solid #1e2230', borderRadius: 16, marginBottom: 20 }}>
      <div style={{ width: 5, background: statusColor, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 9, height: 9, borderRadius: 999, background: statusColor, boxShadow: `0 0 10px ${statusColor}99` }} />
          <div style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{statusLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontWeight: 800, fontSize: 19, color: '#f1f5f9', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: '#7e8597', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShelterCapacity({ capacity, canManage, onAdjust }: { capacity: Record<string, any>; canManage: boolean; onAdjust: (campId: string, delta: number) => void }) {
  const rows = useMemo(() => {
    return CAMPS.map((camp) => {
      const current = capacity[camp.id] || { available: camp.bedsTotal, occupied: 0 };
      const available = Math.max(0, Number(current.available || camp.bedsTotal));
      const occupied = Math.max(0, Number(current.occupied || 0));
      const pct = available / camp.bedsTotal;
      const barColor = pct > 0.66 ? '#22d3ee' : pct > 0.35 ? '#fbbf24' : '#fb7185';
      return { ...camp, available, occupied, pct, barColor };
    });
  }, [capacity]);

  return (
    <div style={{ background: '#12151e', border: '1px solid #1e2230', borderRadius: 16, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7e8597', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        Shelter Network · by elevation & space available
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((c) => (
          <div key={c.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0' }}>{c.name}</div>
                <div style={{ fontSize: 10.5, color: '#7e8597', marginTop: 1 }}>{c.elevation}m MSL · {c.route}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <Users size={12} color="#7e8597" />
                <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700 }}>{c.available}</span>
                <span style={{ fontSize: 10, color: '#5c6478' }}>/ {c.bedsTotal} open</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#090c14', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(c.pct * 100)}%`, background: c.barColor, transition: 'width 0.4s ease' }} />
            </div>
            {canManage && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {[10, 25].map((n) => (
                  <button key={n} onClick={() => onAdjust(c.id, n)} style={{ padding: '3px 8px', borderRadius: 7, background: '#090c14', border: '1px solid #1e2230', color: '#94a3b8', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                    +{n} arrived
                  </button>
                ))}
                <button onClick={() => onAdjust(c.id, -c.occupied)} disabled={c.occupied === 0} style={{ padding: '3px 8px', borderRadius: 7, background: '#090c14', border: '1px solid #1e2230', color: c.occupied === 0 ? '#3a4152' : '#94a3b8', fontSize: 10, fontWeight: 600, cursor: c.occupied === 0 ? 'default' : 'pointer' }}>
                  Clear
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TeamAlertSyncView: React.FC = () => {
  const [stage, setStage] = useState<'join' | 'team'>('join');
  const [joinInput, setJoinInput] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'command' | 'field' | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'command' | 'field' | null>(null);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [capacity, setCapacity] = useState<Record<string, { available: number; occupied: number }>>({});
  const [copied, setCopied] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const siren = useSiren();

  const [title, setTitle] = useState('Upstream flash surge approaching within 60 minutes');
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'advisory'>('warning');
  const [floodType, setFloodType] = useState('flash-flood');
  const [description, setDescription] = useState('Sudden cloudburst runoff detected upstream. Water expected to reach urban front rapidly.');
  const [actionRequired, setActionRequired] = useState('Evacuate low-lying riverfront zones immediately.');
  const [campId, setCampId] = useState(CAMPS[0].id);
  const [channels, setChannels] = useState({ sms: true, siren: true, media: false, ndrf: true });
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: '', description: '', actionRequired: '' });

  const canManage = userRole === 'command';
  const selectedCamp = CAMPS.find((c) => c.id === campId) || CAMPS[0];
  const floodLabel = (FLOOD_TYPES.find((f) => f.id === floodType) || {}).label || '';
  const preview = buildMessages(severity, floodLabel, selectedCamp);
  const unackedUrgent = alerts.filter((a) => a.status !== 'retracted' && (a.ackedBy || []).length === 0 && (a.severity === 'critical' || a.severity === 'warning')).length;

  const statusStats = useMemo(() => {
    const activeAlerts = alerts.filter((a) => a.status !== 'retracted');
    const openBeds = Object.values(capacity).reduce((sum, c) => sum + (c.available || 0), 0);
    const worst = activeAlerts.reduce<string | null>((current, alert) => {
      if (alert.severity === 'critical') return 'critical';
      if (alert.severity === 'warning' && current !== 'critical') return 'warning';
      if (alert.severity === 'advisory' && current === null) return 'advisory';
      return current;
    }, null);
    return {
      activeCount: activeAlerts.length,
      unackedCount: activeAlerts.filter((a) => (a.ackedBy || []).length === 0).length,
      escalatedCount: activeAlerts.filter((a) => a.ackedBy?.length === 0 && (a.expiresAt || 0) <= nowTick).length,
      openBeds,
      worstSeverity: worst,
    };
  }, [alerts, capacity, nowTick]);

  const roomKey = useMemo(() => (teamCode ? `room:${teamCode}` : null), [teamCode]);

  const persistRoom = useCallback((nextAlerts: any[], nextCapacity: Record<string, { available: number; occupied: number }>) => {
    if (!roomKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(roomKey, JSON.stringify({ alerts: nextAlerts, capacity: nextCapacity }));
    } catch (error) {
      console.warn('Could not persist team alert data.', error);
    }
  }, [roomKey]);

  useEffect(() => {
    if (!roomKey || typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(roomKey);
      if (!saved) {
        const starter = CAMPS.reduce((acc, camp) => {
          acc[camp.id] = { available: camp.bedsTotal, occupied: 0 };
          return acc;
        }, {} as Record<string, { available: number; occupied: number }>);
        setCapacity(starter);
        return;
      }
      const parsed = JSON.parse(saved);
      if (parsed.alerts) setAlerts(parsed.alerts);
      if (parsed.capacity) setCapacity(parsed.capacity);
    } catch (error) {
      console.warn('Could not load team alert sync room.', error);
    }
  }, [roomKey]);

  useEffect(() => {
    persistRoom(alerts, capacity);
  }, [alerts, capacity, persistRoom]);

  useEffect(() => {
    const tick = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const canEnter = nameInput.trim().length > 0 && roleInput;

  const handleStartNew = () => {
    if (!canEnter) return;
    const code = generateTeamCode();
    setTeamCode(code);
    setUserName(nameInput.trim());
    setUserRole(roleInput);
    setStage('team');
  };

  const handleJoin = () => {
    if (!canEnter || !joinInput.trim()) return;
    const code = joinInput.trim().toUpperCase();
    setTeamCode(code);
    setUserName(nameInput.trim());
    setUserRole(roleInput);
    setStage('team');
  };

  const handleCopy = async () => {
    if (!teamCode) return;
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.warn('Copy failed', error);
    }
  };

  const applyTemplate = (template: any) => {
    setSeverity(template.severity);
    setFloodType(template.floodType);
    setTitle(template.title);
    setDescription(template.description);
    setActionRequired(template.actionRequired);
    setChannels(template.channels);
  };

  const toggleChannel = (id: string) => {
    setChannels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = () => {
    const selected = CAMPS.find((camp) => camp.id === campId) || CAMPS[0];
    const newAlert = {
      id: `alert-${Date.now()}`,
      severity,
      floodType,
      title,
      description,
      actionRequired,
      location: 'Active operational zone',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false,
      source: `${userName || 'Command'} via Team Alert Sync`,
      senderName: userName || 'Commander',
      status: 'active',
      ackedBy: [],
      expiresAt: Date.now() + (severity === 'critical' ? 2 * 60 * 1000 : 6 * 60 * 1000),
      channels,
      campName: selected.name,
      campElevation: selected.elevation,
      campRoute: selected.route,
      messages: buildMessages(severity, floodLabel, selected),
      edited: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setSending(false);
    if (channels.siren) siren.play(5);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.map((alert) => {
      if (alert.id !== id) return alert;
      const acked = alert.ackedBy || [];
      if (acked.includes(userName)) return alert;
      return { ...alert, ackedBy: [...acked, userName], acknowledged: true };
    }));
  };

  const handleRetract = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: 'retracted' } : alert)));
  };

  const handleEditStart = (alert: any) => {
    setEditingId(alert.id);
    setEditDraft({ title: alert.title, description: alert.description, actionRequired: alert.actionRequired || '' });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditDraft({ title: '', description: '', actionRequired: '' });
  };

  const handleEditSave = () => {
    if (!editingId) return;
    setAlerts((prev) => prev.map((alert) => (alert.id === editingId ? {
      ...alert,
      title: editDraft.title,
      description: editDraft.description,
      actionRequired: editDraft.actionRequired,
      edited: true,
    } : alert)));
    setEditingId(null);
    setEditDraft({ title: '', description: '', actionRequired: '' });
  };

  const handleCapacityAdjust = (campIdToAdjust: string, delta: number) => {
    setCapacity((prev) => {
      const currentCamp = prev[campIdToAdjust] || { available: CAMPS.find((camp) => camp.id === campIdToAdjust)?.bedsTotal || 0, occupied: 0 };
      const nextAvailable = Math.max(0, currentCamp.available + delta);
      const nextOccupied = Math.max(0, currentCamp.occupied - delta);
      return { ...prev, [campIdToAdjust]: { available: nextAvailable, occupied: nextOccupied } };
    });
  };

  if (stage === 'join') {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(34,211,238,0.15), rgba(15,23,42,0.9) 30%), #050b14', color: '#f8fafc', padding: '32px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(34,211,238,0.14)', border: '1px solid rgba(34,211,238,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BellRing size={24} color="#67e8f9" />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 800 }}>Team Alert Sync</div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Flood response coordination</h1>
            </div>
          </div>

          <div style={{ background: '#101b2d', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 24, padding: 20, boxShadow: '0 20px 60px rgba(2, 6, 23, 0.6)' }}>
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <div style={{ padding: 16, borderRadius: 18, background: '#0b1220', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: 12 }}>Create a new team</div>
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: 12, borderRadius: 12, background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', marginBottom: 10 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    const active = roleInput === role.id;
                    return (
                      <button key={role.id} onClick={() => setRoleInput(role.id as 'command' | 'field')} style={{ borderRadius: 12, border: active ? '1px solid #67e8f9' : '1px solid #334155', background: active ? 'rgba(34,211,238,0.12)' : '#0f172a', color: '#e2e8f0', padding: 12, textAlign: 'left' }}>
                        <Icon size={16} color={role.on} />
                        <div style={{ marginTop: 8, fontWeight: 700 }}>{role.label}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{role.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={handleStartNew} disabled={!canEnter} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: !canEnter ? '#1e293b' : '#22d3ee', color: !canEnter ? '#64748b' : '#04121a', fontWeight: 800, cursor: !canEnter ? 'not-allowed' : 'pointer' }}>Create team room</button>
              </div>

              <div style={{ padding: 16, borderRadius: 18, background: '#0b1220', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: 12 }}>Join an existing room</div>
                <input value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="Enter 6-digit room code" maxLength={6} style={{ width: '100%', padding: 12, borderRadius: 12, background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                <button onClick={handleJoin} disabled={!canEnter || !joinInput.trim()} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: !canEnter || !joinInput.trim() ? '#1e293b' : '#34d399', color: !canEnter || !joinInput.trim() ? '#64748b' : '#052e2f', fontWeight: 800, cursor: !canEnter || !joinInput.trim() ? 'not-allowed' : 'pointer' }}>Join room</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(8,13,22,1))', color: '#f8fafc', padding: 18, borderRadius: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9' }}>Team Alert Sync</div>
          <h2 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>Field & command alert coordination</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: '#e2e8f0' }}>{teamCode}</div>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, background: '#0b1220', border: '1px solid #1e293b', color: '#cbd5e1', fontWeight: 700 }}>
            <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={() => setStage('join')} style={{ padding: '8px 10px', borderRadius: 10, background: '#0b1220', border: '1px solid #1e293b', color: '#cbd5e1', fontWeight: 700 }}>Switch room</button>
        </div>
      </div>

      <StatusStrip activeCount={statusStats.activeCount} unackedCount={statusStats.unackedCount} escalatedCount={statusStats.escalatedCount} openBeds={statusStats.openBeds} worstSeverity={statusStats.worstSeverity} />
      <ShelterCapacity capacity={capacity} canManage={canManage} onAdjust={handleCapacityAdjust} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.2fr 0.8fr', marginBottom: 20 }}>
        <div style={{ background: '#101b2d', border: '1px solid #1e293b', borderRadius: 18, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 800 }}>Message composer</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{userRole === 'command' ? 'Command access' : 'Field access'}</div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {QUICK_TEMPLATES.map((template) => (
                <button key={template.id} onClick={() => applyTemplate(template)} style={{ borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', padding: 10, textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{template.emoji}</span>
                  <span style={{ fontWeight: 700 }}>{template.label}</span>
                </button>
              ))}
            </div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value as 'critical' | 'warning' | 'advisory')} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px' }}>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="advisory">Advisory</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Flood type</label>
                <select value={floodType} onChange={(e) => setFloodType(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px' }}>
                  {FLOOD_TYPES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px', resize: 'vertical' }} />
            <textarea value={actionRequired} onChange={(e) => setActionRequired(e.target.value)} rows={2} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px', resize: 'vertical' }} />

            <div>
              <label style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Shelter</label>
              <select value={campId} onChange={(e) => setCampId(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', padding: '10px 12px' }}>
                {CAMPS.map((camp) => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Delivery channels</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                {Object.entries(channels).map(([key, active]) => {
                  const def = CHANNEL_DEFS.find((c) => c.id === key)!;
                  const Icon = def.icon;
                  return (
                    <button key={key} onClick={() => toggleChannel(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, border: active ? '1px solid rgba(34,211,238,0.5)' : '1px solid #334155', background: active ? 'rgba(34,211,238,0.12)' : '#0f172a', color: '#e2e8f0' }}>
                      <Icon size={14} color={def.on} />
                      {def.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleSend} disabled={!canManage} style={{ fontWeight: 800, borderRadius: 12, padding: '12px 14px', background: !canManage ? '#1e293b' : '#22d3ee', color: !canManage ? '#64748b' : '#04121a', cursor: !canManage ? 'not-allowed' : 'pointer' }}>
              {sending ? 'Sending...' : 'Send alert to team'}
            </button>
          </div>
        </div>

        <div style={{ background: '#101b2d', border: '1px solid #1e293b', borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 800, marginBottom: 12 }}>Live preview</div>
          <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 14, padding: 12, fontFamily: "'JetBrains Mono', monospace", color: '#cbd5e1', lineHeight: 1.7, minHeight: 180 }}>
            {preview.en}
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }}><Sparkles size={14} color="#67e8f9" />{unackedUrgent} urgent alerts waiting</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }}><ShieldCheck size={14} color="#34d399" />Team code: {teamCode}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }}><Compass size={14} color="#fbbf24" />Shelter route: {selectedCamp.route}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 800 }}>Shared alert feed</div>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>Logged in as {userName || 'Unavailable'} · {userRole === 'command' ? 'Command Center' : 'Field / Community'}</div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {alerts.length === 0 ? (
          <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 14, padding: '38px 20px', textAlign: 'center', color: '#94a3b8' }}>No alerts yet. Send the first flood update to your team.</div>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAck={handleAcknowledge}
              onRetract={handleRetract}
              onEditStart={handleEditStart}
              canManage={canManage}
              userName={userName}
              editing={editingId === alert.id}
              editDraft={editDraft}
              onEditChange={(field: string, value: string) => setEditDraft((prev) => ({ ...prev, [field]: value }))}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              nowTick={nowTick}
            />
          ))
        )}
      </div>
    </div>
  );
};
