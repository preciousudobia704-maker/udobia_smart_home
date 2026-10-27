import React from 'react';
import { Settings, Volume2, VolumeX, Sparkles, History, X } from 'lucide-react';
import { useSpeech } from '../context/SpeechContext';
import { useSmartHome } from '../context/SmartHomeContext';

export function SettingsModal({ isOpen, onClose, onOpenLogs }) {
  const { soundEnabled, toggleSound } = useSpeech();
  const { preferences, updatePreferences } = useSmartHome();

  if (!isOpen) return null;

  const handleToggleMode = () => {
    const nextMode = preferences.active_mode === 'SIMPLE' ? 'STANDARD' : 'SIMPLE';
    updatePreferences({ active_mode: nextMode });
  };

  const handleOpenHistory = () => {
    onClose();
    if (onOpenLogs) onOpenLogs();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="modal-dialog">
        <div className="modal-header">
          <div id="settings-modal-title" className="modal-title">
            <Settings size={28} strokeWidth={2.5} aria-hidden="true" />
            <span>Settings</span>
          </div>
          <button 
            type="button"
            className="btn-undo-dismiss" 
            onClick={onClose}
            aria-label="Close settings dialog"
          >
            <X size={24} aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>

        <div className="modal-body settings-modal-body">
          {/* 1. Sound / Voice Feedback Setting */}
          <div className="settings-item-card">
            <div className="settings-item-info">
              <div className="settings-item-title">
                {soundEnabled ? (
                  <Volume2 size={26} color="var(--color-teal)" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <VolumeX size={26} color="#64748b" strokeWidth={2.5} aria-hidden="true" />
                )}
                <span>Voice Feedback</span>
              </div>
              <p className="settings-item-desc">
                {soundEnabled 
                  ? 'The system speaks the result of every tap aloud with natural phrasing.' 
                  : 'Voice feedback is currently muted.'}
              </p>
            </div>
            <button
              id="btn-settings-sound-toggle"
              type="button"
              className={`settings-action-btn ${soundEnabled ? 'active-sound-pill' : 'muted-sound-pill'}`}
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Voice feedback is on. Tap to turn sound off.' : 'Voice feedback is off. Tap to turn sound on.'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={24} strokeWidth={2.5} aria-hidden="true" />
                  <span>Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX size={24} strokeWidth={2.5} aria-hidden="true" />
                  <span>Sound Off</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Display View Mode Setting */}
          <div className="settings-item-card">
            <div className="settings-item-info">
              <div className="settings-item-title">
                <Sparkles size={26} color="var(--color-teal)" strokeWidth={2.5} aria-hidden="true" />
                <span>Display View</span>
              </div>
              <p className="settings-item-desc">
                {preferences.active_mode === 'SIMPLE'
                  ? 'Simple Mode: Showing only essential high-priority devices with larger controls.'
                  : 'Standard View: Showing all rooms and appliances.'}
              </p>
            </div>
            <button
              id="btn-settings-mode-toggle"
              type="button"
              className="settings-action-btn"
              onClick={handleToggleMode}
              aria-label={preferences.active_mode === 'SIMPLE' ? 'Switch to Standard View' : 'Switch to Simple Mode'}
            >
              <Sparkles size={24} strokeWidth={2.5} aria-hidden="true" />
              <span>{preferences.active_mode === 'SIMPLE' ? 'Simple Mode' : 'Standard View'}</span>
            </button>
          </div>

          {/* 3. Activity Logs Setting */}
          <div className="settings-item-card">
            <div className="settings-item-info">
              <div className="settings-item-title">
                <History size={26} color="var(--color-teal)" strokeWidth={2.5} aria-hidden="true" />
                <span>Activity History</span>
              </div>
              <p className="settings-item-desc">
                View private routine interaction logs stored securely on this device.
              </p>
            </div>
            <button
              id="btn-settings-open-logs"
              type="button"
              className="settings-action-btn"
              onClick={handleOpenHistory}
              aria-label="Open interaction history logs"
            >
              <History size={24} strokeWidth={2.5} aria-hidden="true" />
              <span>View History</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            id="btn-close-settings-footer"
            type="button"
            className="btn-modal-close" 
            onClick={onClose}
          >
            <X size={22} aria-hidden="true" />
            <span>Close Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
