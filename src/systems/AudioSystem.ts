import { loadSettings } from '../game/settings';

type SoundId =
  | 'pistol'
  | 'rifle'
  | 'shotgun'
  | 'rail'
  | 'enemy'
  | 'explode'
  | 'dash'
  | 'hit'
  | 'interact'
  | 'pickup'
  | 'reload'
  | 'alert'
  | 'complete';

export class AudioSystem {
  private context?: AudioContext;
  private enabled = false;

  resume(): void {
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') {
        void this.context.resume();
      }
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  play(id: SoundId): void {
    this.resume();
    if (!this.enabled || !this.context) {
      return;
    }
    const settings = loadSettings();
    const channelVolume =
      id === 'alert' || id === 'complete' || id === 'pickup' || id === 'interact'
        ? settings.uiVolume
        : settings.sfxVolume;
    const volume = settings.masterVolume * channelVolume;
    if (volume <= 0.001) {
      return;
    }
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(6200, now);
    gain.gain.setValueAtTime(0.0001, now);
    oscillator.start(now);

    const stop = (duration: number) => {
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.stop(now + duration + 0.03);
    };

    if (id === 'rifle') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(430, now);
      oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.09);
      gain.gain.linearRampToValueAtTime(0.075 * volume, now + 0.005);
      stop(0.1);
    } else if (id === 'pistol') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(360, now);
      oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.08);
      gain.gain.linearRampToValueAtTime(0.06 * volume, now + 0.005);
      stop(0.09);
    } else if (id === 'shotgun') {
      oscillator.type = 'sawtooth';
      filter.frequency.setValueAtTime(850, now);
      oscillator.frequency.setValueAtTime(120, now);
      oscillator.frequency.exponentialRampToValueAtTime(25, now + 0.25);
      gain.gain.linearRampToValueAtTime(0.15 * volume, now + 0.005);
      stop(0.28);
    } else if (id === 'rail') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(900, now);
      oscillator.frequency.linearRampToValueAtTime(1500, now + 0.18);
      gain.gain.linearRampToValueAtTime(0.12 * volume, now + 0.015);
      stop(0.35);
    } else if (id === 'enemy') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, now);
      oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.05 * volume, now + 0.004);
      stop(0.14);
    } else if (id === 'explode') {
      oscillator.type = 'square';
      filter.frequency.setValueAtTime(450, now);
      oscillator.frequency.setValueAtTime(70, now);
      oscillator.frequency.exponentialRampToValueAtTime(16, now + 0.55);
      gain.gain.linearRampToValueAtTime(0.22 * volume, now + 0.01);
      stop(0.6);
    } else if (id === 'dash') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(650, now);
      oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.16);
      gain.gain.linearRampToValueAtTime(0.07 * volume, now + 0.005);
      stop(0.18);
    } else if (id === 'hit') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(110, now);
      oscillator.frequency.exponentialRampToValueAtTime(35, now + 0.09);
      gain.gain.linearRampToValueAtTime(0.08 * volume, now + 0.003);
      stop(0.1);
    } else if (id === 'interact' || id === 'pickup' || id === 'reload' || id === 'complete') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(id === 'reload' ? 240 : 420, now);
      oscillator.frequency.linearRampToValueAtTime(id === 'complete' ? 980 : 760, now + 0.14);
      gain.gain.linearRampToValueAtTime(0.07 * volume, now + 0.004);
      stop(0.2);
    } else if (id === 'alert') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(240, now);
      oscillator.frequency.linearRampToValueAtTime(180, now + 0.22);
      gain.gain.linearRampToValueAtTime(0.09 * volume, now + 0.006);
      stop(0.28);
    }
  }

  destroy(): void {
    if (this.context && this.context.state !== 'closed') {
      void this.context.close();
    }
    this.context = undefined;
    this.enabled = false;
  }
}
