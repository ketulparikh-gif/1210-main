export interface FloodEmergencyMessageInput {
  place: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  floodDepth: string;
  eta: string;
  recipient?: string;
}

export function buildFloodEmergencyMessage({
  place,
  severity,
  floodDepth,
  eta,
  recipient = 'team',
}: FloodEmergencyMessageInput): string {
  const normalizedPlace = place.trim() || 'your area';
  const normalizedDepth = floodDepth.trim() || 'low level';
  const normalizedEta = eta.trim() || 'soon';

  return `🚨 Flood Alert for ${recipient}: Flood is coming to ${normalizedPlace}. Severity: ${severity}. Expected water level: ${normalizedDepth}. Estimated arrival: ${normalizedEta}. Please move to higher ground and share this alert immediately.`;
}
