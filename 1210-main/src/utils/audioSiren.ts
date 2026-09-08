// Web Audio API emergency siren generator (no external audio files needed)
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: any = null;

export function playEmergencySiren(durationSeconds = 6) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Stop existing if any
    stopEmergencySiren();

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);

    // Initial subtle volume ramp
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    // Modulate pitch like a municipal wailing flood siren (600Hz to 1100Hz oscillation)
    let goingUp = true;
    sirenInterval = setInterval(() => {
      if (!audioCtx || !oscillator) return;
      const targetFreq = goingUp ? 1150 : 620;
      oscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.6);
      goingUp = !goingUp;
    }, 650);

    // Auto shut off
    setTimeout(() => {
      stopEmergencySiren();
    }, durationSeconds * 1000);
  } catch (err) {
    console.warn('Audio siren could not be initialized:', err);
  }
}

export function stopEmergencySiren() {
  try {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
  } catch {
    // Ignore cleanup errors
  }
}
