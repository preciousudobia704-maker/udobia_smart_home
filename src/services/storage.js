import { INITIAL_DEVICES, generateSeedHistory } from './seedData.js';

const KEYS = {
  PREFERENCES: 'smart_home_user_preferences',
  DEVICES: 'smart_home_device_states',
  HABIT_LOGS: 'smart_home_habit_logs',
  ROLLBACKS: 'smart_home_state_rollbacks'
};

const DEFAULT_PREFERENCES = {
  preference_id: 'pref-default-1',
  age_profile: null, // null means first-launch onboarding is required
  active_mode: 'STANDARD', // 'STANDARD' | 'SIMPLE'
  text_scale: 'normal',   // 'normal' | 'large' | 'xlarge'
  high_contrast: false,
  sound_enabled: true,
  undo_timeout_ms: 5000,
  trusted_contact: {
    name: 'Sarah (Daughter)',
    phone: '+234 816 498 1474'
  }
};

export const storage = {
  // --- User Preferences ---
  getPreferences() {
    try {
      const data = localStorage.getItem(KEYS.PREFERENCES);
      if (!data) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        trusted_contact: parsed.trusted_contact !== undefined ? parsed.trusted_contact : DEFAULT_PREFERENCES.trusted_contact
      };
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs) {
    try {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Error saving preferences to localStorage:', e);
    }
  },

  // --- Devices State ---
  getDevices() {
    try {
      const data = localStorage.getItem(KEYS.DEVICES);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with default devices
      this.saveDevices(INITIAL_DEVICES);
      return INITIAL_DEVICES;
    } catch (e) {
      console.error('Error loading devices from localStorage:', e);
      return INITIAL_DEVICES;
    }
  },

  saveDevices(devices) {
    try {
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.error('Error saving devices to localStorage:', e);
    }
  },

  // --- Habit Interaction Logs ---
  getHabitLogs() {
    try {
      const data = localStorage.getItem(KEYS.HABIT_LOGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // First load: seed 7 days of realistic historical routines
      const seeds = generateSeedHistory();
      this.saveHabitLogs(seeds);
      return seeds;
    } catch (e) {
      console.error('Error loading habit logs from localStorage:', e);
      return generateSeedHistory();
    }
  },

  saveHabitLogs(logs) {
    try {
      localStorage.setItem(KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving habit logs to localStorage:', e);
    }
  },

  addHabitLog(logEntry) {
    try {
      const currentLogs = this.getHabitLogs();
      const updated = [logEntry, ...currentLogs];
      this.saveHabitLogs(updated);
      return updated;
    } catch (e) {
      console.error('Error appending habit log:', e);
      return [];
    }
  },

  // --- Reset to Safe Defaults ---
  resetToSafeDefaults() {
    try {
      localStorage.removeItem(KEYS.PREFERENCES);
      localStorage.removeItem(KEYS.DEVICES);
      localStorage.removeItem(KEYS.HABIT_LOGS);
      localStorage.removeItem(KEYS.ROLLBACKS);
      return {
        devices: INITIAL_DEVICES,
        preferences: DEFAULT_PREFERENCES,
        logs: generateSeedHistory()
      };
    } catch (e) {
      console.error('Error resetting to safe defaults:', e);
      return {
        devices: INITIAL_DEVICES,
        preferences: DEFAULT_PREFERENCES,
        logs: []
      };
    }
  },

  // --- Age Profile Helper for Dev Reset ---
  clearAgeProfile() {
    try {
      const current = this.getPreferences();
      const updated = { ...current, age_profile: null };
      this.savePreferences(updated);
      return updated;
    } catch (e) {
      console.error('Error clearing age profile:', e);
      return null;
    }
  }
};
