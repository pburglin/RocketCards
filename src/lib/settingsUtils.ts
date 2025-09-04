// src/lib/settingsUtils.ts
export interface GeneralSettings {
  theme: string;
  language: string;
  animations: boolean;
  autoSave: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
  webglEffects: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  gameUpdates: boolean;
  friendRequests: boolean;
  achievements: boolean;
}

export interface PrivacySettings {
  profileVisibility: string;
  gameHistory: string;
  showOnlineStatus: boolean;
}

export interface UserSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    theme: 'dark',
    language: 'en',
    animations: true,
    autoSave: true,
    soundEffects: true,
    backgroundMusic: true,
    webglEffects: true
  },
  notifications: {
    email: true,
    push: true,
    gameUpdates: true,
    friendRequests: true,
    achievements: true
  },
  privacy: {
    profileVisibility: 'friends',
    gameHistory: 'friends',
    showOnlineStatus: true
  }
};

export const loadSettings = (): UserSettings => {
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy }
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const getSetting = <T>(path: string, defaultValue: T): T => {
  try {
    const settings = loadSettings();
    const keys = path.split('.');
    let value: any = settings;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

export const areAnimationsEnabled = (): boolean => {
  return getSetting('general.animations', true);
};

export const areSoundEffectsEnabled = (): boolean => {
  return getSetting('general.soundEffects', true);
};

export const areWebGLEffectsEnabled = (): boolean => {
  return getSetting('general.webglEffects', true);
};