// Web Audio API Sound Synthesizer for notifications and calling
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a soft WhatsApp-like message notification pop
  playMessageTone() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Could not play message tone:', e);
    }
  }

  // Play outgoing ringing tone (calling...)
  startOutgoingRingtone() {
    this.stopRingtone();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const playRingBurst = () => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      };

      playRingBurst();
      this.ringInterval = setInterval(playRingBurst, 3000);
    } catch (e) {
      console.warn('Could not play outgoing ringtone:', e);
    }
  }

  // Play incoming ringtone (melodic WhatsApp-like call ring)
  startIncomingRingtone() {
    this.stopRingtone();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const playMelody = () => {
        const now = ctx.currentTime;
        const notes = [
          { freq: 523.25, time: 0, dur: 0.18 },    // C5
          { freq: 659.25, time: 0.2, dur: 0.18 },  // E5
          { freq: 783.99, time: 0.4, dur: 0.22 },  // G5
          { freq: 1046.50, time: 0.65, dur: 0.4 }, // C6
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0.25, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur);
        });
      };

      playMelody();
      this.ringInterval = setInterval(playMelody, 2200);
    } catch (e) {
      console.warn('Could not play incoming ringtone:', e);
    }
  }

  // Stop ringtone
  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Play call ended tone
  playEndCallTone() {
    this.stopRingtone();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Could not play end call tone:', e);
    }
  }
}

export const soundService = new SoundService();
