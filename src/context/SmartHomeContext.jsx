import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../services/storage';
import { evaluateTimeBasedRule, evaluateCoOccurrenceRule } from '../services/ruleEngine';
import { useSpeech } from './SpeechContext';
import { getAgeProfileConfig } from '../constants/ageProfiles';

const SmartHomeContext = createContext(null);

export function SmartHomeProvider({ children }) {
  const { speak, setSoundEnabled } = useSpeech();

  const [preferences, setPreferences] = useState(() => {
    const loaded = storage.getPreferences();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlScale = params.get('scale');
      if (urlScale && ['normal', 'large', 'xlarge'].includes(urlScale)) {
        return { ...loaded, text_scale: urlScale };
      }
    }
    return loaded;
  });

  // 2. Devices State
  const [devices, setDevices] = useState(() => storage.getDevices());

  // 3. Habit History Logs
  const [habitLogs, setHabitLogs] = useState(() => storage.getHabitLogs());

  // 4. Active Suggestion (Predictive AI - displayed visually only, no unprompted speech)
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  // 6. Undo Stack / Toast (5-second timeout)
  const [activeUndo, setActiveUndo] = useState(null);
  const undoTimerRef = useRef(null);

  // 7. Time Simulation (Defaults to real current local hour)
  const [simulatedHour, setSimulatedHour] = useState(() => new Date().getHours());
  const [isLiveClock, setIsLiveClock] = useState(true);

  // Sync Preferences to DOM attributes & LocalStorage
  useEffect(() => {
    storage.savePreferences(preferences);
    document.documentElement.setAttribute('data-text-scale', preferences.text_scale || 'normal');
    document.documentElement.setAttribute('data-high-contrast', preferences.high_contrast ? 'true' : 'false');
  }, [preferences]);

  // Sync Devices to LocalStorage
  useEffect(() => {
    storage.saveDevices(devices);
  }, [devices]);

  // Live Clock update
  useEffect(() => {
    if (!isLiveClock) return;
    const interval = setInterval(() => {
      setSimulatedHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  // Helper to construct habit log entry
  const createHabitLog = useCallback((deviceId, deviceName, actionType, source = 'MANUAL_TAP') => {
    const now = new Date();
    const timeStr = `${String(simulatedHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logEntry = {
      log_id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      device_id: deviceId,
      device_name: deviceName,
      action_type: actionType,
      time_of_day: timeStr,
      hour: simulatedHour,
      minute: now.getMinutes(),
      day_of_week: now.getDay() || 7,
      timestamp: Date.now(),
      execution_source: source
    };

    const updated = storage.addHabitLog(logEntry);
    setHabitLogs(updated);
    return logEntry;
  }, [simulatedHour]);

  // Trigger Undo Toast (5-second auto dismiss)
  const triggerUndoPrompt = useCallback((snapshot) => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setActiveUndo(snapshot);

    undoTimerRef.current = setTimeout(() => {
      setActiveUndo(null);
    }, preferences.undo_timeout_ms || 5000);
  }, [preferences.undo_timeout_ms]);

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setActiveUndo(null);
  }, []);

  // Execute Undo Action
  const executeUndo = useCallback(() => {
    if (!activeUndo) return;

    const { deviceId, previousState, deviceName } = activeUndo;

    setDevices(prevDevices => {
      return prevDevices.map(dev => {
        if (dev.id === deviceId) {
          return {
            ...dev,
            state: { ...previousState },
            lastUpdated: new Date().toISOString()
          };
        }
        return dev;
      });
    });

    dismissUndo();

    // Voice announcement of undo result
    const undoMsg = `Action undone: ${deviceName} reverted to previous setting`;
    speak(undoMsg);
  }, [activeUndo, dismissUndo, speak]);

  // Check Rule 1 (Time-based suggestion) - Silent visual update only
  const checkTimeBasedRule = useCallback((hourToCheck, currentDevicesList = devices) => {
    const suggestion = evaluateTimeBasedRule(hourToCheck, currentDevicesList, habitLogs);
    if (suggestion) {
      setActiveSuggestion(suggestion);
    } else {
      setActiveSuggestion(null);
    }
  }, [devices, habitLogs]);

  // Evaluate Rule 1 when simulated hour changes or devices change
  useEffect(() => {
    checkTimeBasedRule(simulatedHour, devices);
  }, [simulatedHour, devices, checkTimeBasedRule]);

  // Device Toggle Action (Light, AC Power, TV Power, Lock Door)
  const toggleDevice = useCallback((deviceId) => {
    const targetDevice = devices.find(d => d.id === deviceId);
    if (!targetDevice) return;

    const previousState = { ...targetDevice.state };
    let resultingState = {};
    let spokenResult = '';
    let actionType = '';

    if (targetDevice.type === 'LOCK') {
      const isCurrentlyLocked = targetDevice.state.locked;
      const nextLocked = !isCurrentlyLocked;
      resultingState = { ...targetDevice.state, locked: nextLocked };
      actionType = nextLocked ? 'LOCK' : 'UNLOCK';
      spokenResult = nextLocked ? `${targetDevice.name} locked` : `${targetDevice.name} unlocked`;
    } else {
      const isCurrentlyOn = targetDevice.state.power;
      const nextPower = !isCurrentlyOn;
      resultingState = { ...targetDevice.state, power: nextPower };
      actionType = nextPower ? 'TOGGLE_ON' : 'TOGGLE_OFF';
      spokenResult = nextPower ? `${targetDevice.name} turned on` : `${targetDevice.name} turned off`;
    }

    // Update Device State
    const updatedDevices = devices.map(d => 
      d.id === deviceId ? { ...d, state: resultingState, lastUpdated: new Date().toISOString() } : d
    );
    setDevices(updatedDevices);

    // Speak Result immediately (Specific to the device tapped)
    speak(spokenResult);

    // Log Action
    createHabitLog(targetDevice.id, targetDevice.name, actionType, 'MANUAL_TAP');

    // Trigger Undo Prompt
    triggerUndoPrompt({
      deviceId: targetDevice.id,
      deviceName: targetDevice.name,
      previousState,
      actionDescription: spokenResult,
      timestamp: Date.now()
    });

    // Check Rule 2: Co-Occurrence if device was just turned ON (Silent visual banner only)
    if (actionType === 'TOGGLE_ON' || actionType === 'UNLOCK') {
      const cooccurSuggestion = evaluateCoOccurrenceRule(targetDevice.id, updatedDevices, habitLogs);
      if (cooccurSuggestion) {
        setActiveSuggestion(cooccurSuggestion);
      }
    }
  }, [devices, speak, createHabitLog, triggerUndoPrompt, habitLogs]);

  // Adjust Temperature for AC
  const adjustAcTemperature = useCallback((deviceId, delta) => {
    const targetDevice = devices.find(d => d.id === deviceId);
    if (!targetDevice || targetDevice.type !== 'THERMOSTAT') return;
    if (!targetDevice.state.power) return; // Only adjust when power is ON

    const currentTemp = targetDevice.state.temperature || 22;
    const minTemp = targetDevice.state.minTemp || 16;
    const maxTemp = targetDevice.state.maxTemp || 30;
    const nextTemp = Math.max(minTemp, Math.min(maxTemp, currentTemp + delta));

    if (nextTemp === currentTemp) return;

    const previousState = { ...targetDevice.state };
    const resultingState = { ...targetDevice.state, temperature: nextTemp };

    const updatedDevices = devices.map(d => 
      d.id === deviceId ? { ...d, state: resultingState, lastUpdated: new Date().toISOString() } : d
    );
    setDevices(updatedDevices);

    const spokenResult = `${targetDevice.name} set to ${nextTemp} degrees`;
    speak(spokenResult);

    createHabitLog(targetDevice.id, targetDevice.name, `TEMP_${nextTemp}`, 'MANUAL_TAP');

    triggerUndoPrompt({
      deviceId: targetDevice.id,
      deviceName: targetDevice.name,
      previousState,
      actionDescription: spokenResult,
      timestamp: Date.now()
    });
  }, [devices, speak, createHabitLog, triggerUndoPrompt]);

  // Accept Suggestion Card (Tapping "Yes, turn on" executes device action and speaks device confirmation)
  const acceptSuggestion = useCallback(() => {
    if (!activeSuggestion) return;

    const { deviceId, actionType } = activeSuggestion;
    const targetDevice = devices.find(d => d.id === deviceId);

    if (targetDevice) {
      const previousState = { ...targetDevice.state };
      let resultingState = {};
      let spokenResult = '';

      if (targetDevice.type === 'LOCK') {
        const nextLocked = actionType === 'LOCK';
        resultingState = { ...targetDevice.state, locked: nextLocked };
        spokenResult = nextLocked ? `${targetDevice.name} locked` : `${targetDevice.name} unlocked`;
      } else {
        resultingState = { ...targetDevice.state, power: true };
        spokenResult = `${targetDevice.name} turned on`;
      }

      const updatedDevices = devices.map(d => 
        d.id === deviceId ? { ...d, state: resultingState, lastUpdated: new Date().toISOString() } : d
      );
      setDevices(updatedDevices);

      // Speak confirmation of the device action taken
      speak(spokenResult);

      createHabitLog(targetDevice.id, targetDevice.name, actionType, 'HEURISTIC');

      triggerUndoPrompt({
        deviceId: targetDevice.id,
        deviceName: targetDevice.name,
        previousState,
        actionDescription: spokenResult,
        timestamp: Date.now()
      });
    }

    setActiveSuggestion(null);
  }, [activeSuggestion, devices, speak, createHabitLog, triggerUndoPrompt]);

  // Dismiss Suggestion Card (Silent visual dismissal only)
  const dismissSuggestion = useCallback(() => {
    setActiveSuggestion(null);
  }, []);

  // Change Time Simulator Hour
  const changeSimulatedHour = useCallback((hour, isLive = false) => {
    setIsLiveClock(isLive);
    setSimulatedHour(hour);
  }, []);

  // Update User Preferences
  const updatePreferences = useCallback((newPartial) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPartial };
      storage.savePreferences(updated);
      return updated;
    });
  }, []);

  // Apply Interface Profile based on age group
  const applyAgeProfile = useCallback((profileId) => {
    const config = getAgeProfileConfig(profileId);
    if (!config) return;

    setPreferences(prev => {
      const updated = {
        ...prev,
        age_profile: profileId,
        text_scale: config.text_scale,
        active_mode: config.active_mode,
        sound_enabled: config.sound_enabled
      };
      storage.savePreferences(updated);
      return updated;
    });

    if (setSoundEnabled) {
      setSoundEnabled(config.sound_enabled);
    }
  }, [setSoundEnabled]);

  // Replay Onboarding (clears stored age profile only without wiping device states or history)
  const replayOnboarding = useCallback(() => {
    setPreferences(prev => {
      const updated = { ...prev, age_profile: null };
      storage.savePreferences(updated);
      return updated;
    });
    speak('Welcome screen reloaded');
  }, [speak]);

  // Reset all to safe defaults (clears stored profile so onboarding appears on next load)
  const resetAllData = useCallback(() => {
    const safeData = storage.resetToSafeDefaults();
    setDevices(safeData.devices);
    setPreferences(safeData.preferences);
    setHabitLogs(safeData.logs);
    setActiveSuggestion(null);
    dismissUndo();
    speak('All Udobia settings restored to safe defaults');
  }, [dismissUndo, speak]);

  return (
    <SmartHomeContext.Provider
      value={{
        devices,
        toggleDevice,
        adjustAcTemperature,
        habitLogs,
        activeSuggestion,
        acceptSuggestion,
        dismissSuggestion,
        activeUndo,
        executeUndo,
        dismissUndo,
        preferences,
        updatePreferences,
        applyAgeProfile,
        replayOnboarding,
        simulatedHour,
        changeSimulatedHour,
        isLiveClock,
        resetAllData,
        createHabitLog
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  );
}

export function useSmartHome() {
  const context = useContext(SmartHomeContext);
  if (!context) {
    throw new Error('useSmartHome must be used within a SmartHomeProvider');
  }
  return context;
}
