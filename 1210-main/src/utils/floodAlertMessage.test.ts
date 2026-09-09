import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFloodEmergencyMessage } from './floodAlertMessage.ts';

test('buildFloodEmergencyMessage includes location, severity, depth and ETA', () => {
  const msg = buildFloodEmergencyMessage({
    place: 'Old City, Ahmedabad',
    severity: 'High',
    floodDepth: '1.5m',
    eta: 'in 30 mins',
    recipient: 'hackathon team',
  });

  assert.match(msg, /Old City, Ahmedabad/i);
  assert.match(msg, /High/i);
  assert.match(msg, /1\.5m/i);
  assert.match(msg, /30 mins/i);
  assert.match(msg, /hackathon team/i);
});
