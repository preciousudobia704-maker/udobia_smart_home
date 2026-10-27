import React from 'react';
import { HelpCircle, PhoneCall, CheckCircle2, RotateCcw, Volume2, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export function HelpModal({ isOpen, onClose }) {
  const { resetAllData } = useSmartHome();

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Would you like to reset all smart home devices and logs to clean defaults?')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <div className="modal-dialog">
        <div className="modal-header">
          <div id="help-modal-title" className="modal-title">
            <HelpCircle size={28} />
            <span>Guide & Reassurance</span>
          </div>
          <button 
            className="btn-undo-dismiss" 
            onClick={onClose}
            aria-label="Close guide"
          >
            <X size={24} />
            <span>Close</span>
          </button>
        </div>

        <div className="modal-body">
          <div className="help-card">
            <div className="help-card-title">
              <CheckCircle2 size={22} color="var(--color-teal)" />
              <span>You Are Always in Control</span>
            </div>
            <p>
              Every button on your screen describes its exact action in plain words (like "Turn On" or "Lock Door"). There are no hidden menus or complicated gestures.
            </p>
          </div>

          <div className="help-card">
            <div className="help-card-title">
              <Volume2 size={22} color="var(--color-teal)" />
              <span>Voice Feedback</span>
            </div>
            <p>
              Whenever you tap a button, the system speaks the result aloud (for example, <em>"Living Room Light turned on"</em>). You can turn sound off at any time using the <strong>Sound On/Off</strong> button at the top.
            </p>
          </div>

          <div className="help-card">
            <div className="help-card-title">
              <RotateCcw size={22} color="var(--color-teal)" />
              <span>Made a Mistake? Undo Anytime</span>
            </div>
            <p>
              Whenever you change a device, an <strong>Undo Action</strong> button appears for 5 seconds. Simply tap it to revert your home back to its previous state immediately.
            </p>
          </div>

          <div className="help-card">
            <div className="help-card-title">
              <ShieldCheck size={22} color="var(--color-teal)" />
              <span>100% Private & Offline</span>
            </div>
            <p>
              All your settings and habits stay right here inside your browser on this device. No information is ever sent to external cloud servers.
            </p>
          </div>

          <div className="emergency-contact-box">
            <div className="emergency-title">
              <PhoneCall size={22} />
              <span>Caregiver & Support Contact</span>
            </div>
            <p>
              If you need assistance, please use your phone to call your designated caregiver:
            </p>
            <div 
              className="emergency-btn"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'default' }}
            >
              <PhoneCall size={24} />
              <span>Caregiver Support (+234 816 498 1474)</span>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              id="btn-reset-safe-defaults"
              className="time-jump-btn"
              onClick={handleReset}
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            >
              <RefreshCw size={20} />
              <span>Reset Everything to Factory Defaults</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            id="btn-close-help-footer"
            className="btn-modal-close" 
            onClick={onClose}
          >
            <span>Understood, Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
