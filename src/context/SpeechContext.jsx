import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../services/storage';

const SpeechContext = createContext(null);

import { SPEECH_CONFIG, selectPreferredVoice } from '../services/speechUtils';

export { SPEECH_CONFIG, selectPreferredVoice };

export function SpeechProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const prefs = storage.getPreferences();
    return prefs.sound_enabled !== undefined ? prefs.sound_enabled : true;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const selectedVoiceRef = useRef(null);

  const setSoundEnabled = useCallback((valueOrUpdater) => {
    setSoundEnabledState((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      const currentPrefs = storage.getPreferences();
      storage.savePreferences({ ...currentPrefs, sound_enabled: next });
      return next;
    });
  }, []);

  // Initialize and listen for voice changes
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const best = selectPreferredVoice(voices);
        if (best && (!selectedVoiceRef.current || selectedVoiceRef.current.name !== best.name)) {
          selectedVoiceRef.current = best;
          setSelectedVoice(best);
          console.log(`[Voice Engine] Loaded ${voices.length} voices. Selected Voice: "${best.name}" (${best.lang}, localService: ${best.localService})`);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (typeof window !== 'undefined') {
        window.__currentUtterance = null;
      }
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;
    
    console.log(`[Voice Feedback Requested] "${text}" | soundEnabled = ${soundEnabled}`);

    if (!soundEnabled) {
      console.log(`[Voice Feedback Suppressed] Sound is currently muted.`);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[Voice Feedback] Web Speech API not supported in this environment.');
      return;
    }

    try {
      // 1. Construct Utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = SPEECH_CONFIG.RATE;
      utterance.pitch = SPEECH_CONFIG.PITCH;
      utterance.volume = SPEECH_CONFIG.VOLUME;

      // 2. Assign voice if a preferred voice is resolved
      const voices = window.speechSynthesis.getVoices();
      const activeVoice = selectedVoiceRef.current || selectPreferredVoice(voices);
      if (activeVoice) {
        utterance.voice = activeVoice;
      }

      // 3. Attach Explicit Event Listeners with direct console logging
      utterance.onstart = (e) => {
        console.log(`[Voice Feedback onstart]: Audio playback STARTED for "${text}" (Voice: ${utterance.voice?.name || 'Default'})`);
        setIsSpeaking(true);
      };

      utterance.onend = (e) => {
        console.log(`[Voice Feedback onend]: Audio playback FINISHED for "${text}"`);
        setIsSpeaking(false);
        if (typeof window !== 'undefined' && window.__currentUtterance === utterance) {
          window.__currentUtterance = null;
        }
      };

      utterance.onerror = (e) => {
        const errType = e?.error || 'unknown';
        console.log(`[Voice Feedback onerror]: Speech event status for "${text}":`, errType, e);
        setIsSpeaking(false);
        if (typeof window !== 'undefined' && window.__currentUtterance === utterance) {
          window.__currentUtterance = null;
        }
      };

      // 4. Stable Reference on window to prevent V8 Garbage Collection
      if (typeof window !== 'undefined') {
        window.__currentUtterance = utterance;
      }

      // 5. Dispatch to Browser SpeechSynthesis Engine
      console.log(`[Voice Feedback DISPATCHING speak()]: "${text}" (Voice: ${utterance.voice?.name || 'Default'})`);
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('[Voice Feedback Execution Error]:', err);
      setIsSpeaking(false);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      console.log(`[Sound Toggle Clicked] Sound toggled from ${prev ? 'ON' : 'OFF'} -> ${next ? 'ON' : 'OFF'}`);

      if (!next) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          window.__currentUtterance = null;
        }
        setIsSpeaking(false);
      } else {
        setTimeout(() => {
          speak('Sound is now turned on');
        }, 50);
      }
      return next;
    });
  }, [setSoundEnabled, speak]);

  return (
    <SpeechContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        setSoundEnabled,
        speak,
        cancelSpeech,
        isSpeaking,
        selectedVoice,
        speechConfig: SPEECH_CONFIG
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}
