export interface AppSettings {
  graphicsQuality: 'Low' | 'Medium' | 'High';
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  uiVolume: number;
  screenShake: number;
  flashIntensity: number;
  colorblindMode: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'breach-vector-settings';

export const defaultSettings: AppSettings = {
  graphicsQuality: 'High',
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  uiVolume: 0.8,
  screenShake: 1,
  flashIntensity: 1,
  colorblindMode: false,
  reduceMotion: false
};

export function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultSettings };
    }
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Local storage can be unavailable in private or restricted contexts.
  }
}

export function updateSettings(update: Partial<AppSettings>): AppSettings {
  const next = normalizeSettings({ ...loadSettings(), ...update });
  saveSettings(next);
  return next;
}

export function resetSettings(): AppSettings {
  const next = { ...defaultSettings };
  saveSettings(next);
  return next;
}

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  const quality = settings.graphicsQuality;
  return {
    graphicsQuality:
      quality === 'Low' || quality === 'Medium' || quality === 'High' ? quality : defaultSettings.graphicsQuality,
    masterVolume: clamp01(settings.masterVolume ?? defaultSettings.masterVolume),
    musicVolume: clamp01(settings.musicVolume ?? defaultSettings.musicVolume),
    sfxVolume: clamp01(settings.sfxVolume ?? defaultSettings.sfxVolume),
    uiVolume: clamp01(settings.uiVolume ?? defaultSettings.uiVolume),
    screenShake: clamp01(settings.screenShake ?? defaultSettings.screenShake),
    flashIntensity: clamp01(settings.flashIntensity ?? defaultSettings.flashIntensity),
    colorblindMode: Boolean(settings.colorblindMode ?? defaultSettings.colorblindMode),
    reduceMotion: Boolean(settings.reduceMotion ?? defaultSettings.reduceMotion)
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
