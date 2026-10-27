import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { 
  BulbIllustration, 
  FanIllustration, 
  AcIllustration, 
  PadlockIllustration, 
  PlugIllustration 
} from './DeviceIllustrations';

export function SuggestionCard() {
  const { activeSuggestion, acceptSuggestion, dismissSuggestion, devices } = useSmartHome();
  const [displayedSuggestion, setDisplayedSuggestion] = useState(null);
  const lastInteractionRef = useRef(0);
  const timerRef = useRef(null);

  // Track user taps, clicks, and scrolls to prevent shifting content under user's finger
  useEffect(() => {
    const handleUserActivity = () => {
      lastInteractionRef.current = Date.now();
      // If activeSuggestion is waiting to be displayed (not yet displayed)
      if (activeSuggestion && (!displayedSuggestion || displayedSuggestion.id !== activeSuggestion.id)) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setDisplayedSuggestion(activeSuggestion);
        }, 4000);
      }
    };

    window.addEventListener('pointerdown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeSuggestion, displayedSuggestion]);

  // Handle activeSuggestion changes
  useEffect(() => {
    if (!activeSuggestion) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedSuggestion(null);
      return;
    }

    // If activeSuggestion is already displayed, keep it
    if (displayedSuggestion && displayedSuggestion.id === activeSuggestion.id) {
      return;
    }

    // Check if user has tapped or scrolled in last 4 seconds
    const timeSinceInteraction = Date.now() - lastInteractionRef.current;
    if (timeSinceInteraction >= 4000) {
      setDisplayedSuggestion(activeSuggestion);
    } else {
      const waitTime = Math.max(100, 4000 - timeSinceInteraction);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDisplayedSuggestion(activeSuggestion);
      }, waitTime);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeSuggestion, displayedSuggestion]);

  if (!displayedSuggestion) return null;

  // Resolve device icon matching device card icon
  const targetDevice = devices?.find(d => d.id === displayedSuggestion.deviceId);
  const isLight = !targetDevice || targetDevice.type === 'LIGHT';
  const isFan = targetDevice?.type === 'FAN';
  const isThermostat = targetDevice?.type === 'THERMOSTAT';
  const isLockType = targetDevice?.type === 'LOCK';
  const isPlug = targetDevice?.type === 'PLUG';

  const renderDeviceIcon = () => {
    if (isLight) return <BulbIllustration isBanner={true} size={48} />;
    if (isFan) return <FanIllustration isBanner={true} size={48} />;
    if (isThermostat) return <AcIllustration isBanner={true} size={48} />;
    if (isLockType) return <PadlockIllustration isLocked={true} isBanner={true} size={48} />;
    if (isPlug) return <PlugIllustration isBanner={true} size={48} />;
    return <BulbIllustration isBanner={true} size={48} />;
  };

  return (
    <aside className="suggestion-banner" aria-live="polite" aria-labelledby="suggestion-title">
      <div className="suggestion-content">
        <div className="suggestion-device-icon" aria-hidden="true">
          {renderDeviceIcon()}
        </div>
        <div id="suggestion-title" className="suggestion-text">
          {displayedSuggestion.message}
        </div>
      </div>

      <div className="suggestion-actions">
        <button
          id="btn-suggestion-accept"
          type="button"
          className="btn-suggestion-yes"
          onClick={acceptSuggestion}
          aria-label={displayedSuggestion.confirmLabel}
        >
          <Check size={24} strokeWidth={3} aria-hidden="true" />
          <span>{displayedSuggestion.confirmLabel}</span>
        </button>

        <button
          id="btn-suggestion-dismiss"
          type="button"
          className="btn-suggestion-no"
          onClick={dismissSuggestion}
          aria-label="Not now, dismiss suggestion"
        >
          <X size={24} strokeWidth={2.5} aria-hidden="true" />
          <span>{displayedSuggestion.dismissLabel}</span>
        </button>
      </div>
    </aside>
  );
}

export default SuggestionCard;
