import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw,
  LifeBuoy
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

function getPhoneGroups(phoneStr) {
  if (!phoneStr) return [];
  const parts = phoneStr.trim().split(/\s+/);
  if (parts.length > 1) return parts;
  return [phoneStr];
}

export function HelpPage() {
  const { resetAllData, preferences } = useSmartHome();

  useEffect(() => {
    document.title = 'Guide';
  }, []);

  const handleReset = () => {
    if (window.confirm('Would you like to reset all Udobia settings and logs to clean defaults?')) {
      resetAllData();
    }
  };

  const contact = preferences?.trusted_contact;
  const contactName = contact?.name || 'Caregiver Support';
  const contactPhone = contact?.phone || '+234 816 498 1474';

  return (
    <div className="guide-page-container help-page-container" aria-label="Help and Guide Page">
      {/* 1. Visually hidden page title for screen readers */}
      <h1 className="visually-hidden">Guide</h1>
      <p className="visually-hidden">Simple, straightforward guidance on using your Udobia smart home</p>

      {/* 2. Guide sections separated by whitespace alone */}
      <main className="guide-sections-list">
        {/* Section 1: Control */}
        <section className="guide-section" aria-labelledby="help-title-control">
          <h2 id="help-title-control" className="guide-section-title">
            You Are Always in Control
          </h2>
          <p className="guide-section-desc">
            Every button on your screen describes its exact action in plain words (like "Turn On" or "Lock Door"). There are no hidden menus, confusing icons, or complicated multi-finger gestures.
          </p>
        </section>

        {/* Section 2: Voice Feedback */}
        <section className="guide-section" aria-labelledby="help-title-voice">
          <h2 id="help-title-voice" className="guide-section-title">
            Spoken Voice Feedback
          </h2>
          <p className="guide-section-desc">
            Whenever you tap any button, the system clearly speaks the result aloud (for example, <em>"Living Room Light turned on"</em>). You can turn voice sound on or off anytime in Settings.
          </p>
        </section>

        {/* Section 3: Undo */}
        <section className="guide-section" aria-labelledby="help-title-undo">
          <h2 id="help-title-undo" className="guide-section-title">
            Made a Mistake? Undo Anytime
          </h2>
          <p className="guide-section-desc">
            Whenever you change any device state, an <strong>Undo Action</strong> button stays visible for 5 seconds. Simply tap it to revert your home back to its previous state immediately.
          </p>
        </section>

        {/* Section 4: Privacy */}
        <section className="guide-section" aria-labelledby="help-title-privacy">
          <h2 id="help-title-privacy" className="guide-section-title">
            100% Private & Stored Locally
          </h2>
          <p className="guide-section-desc">
            All your settings, preferences, and routine habit logs stay right here inside your browser on this device. No personal data is ever sent to external cloud servers or third parties.
          </p>
        </section>

        {/* Section 5: Caregiver & Support Emergency Box */}
        <section className="guide-section guide-contact-section" aria-labelledby="caregiver-box-title">
          <h2 id="caregiver-box-title" className="guide-section-title">
            Caregiver & Support Contact
          </h2>
          <p className="guide-section-desc">
            If you need urgent assistance, visit the Emergency Help screen or call your caregiver from your phone:
          </p>

          <div className="guide-contact-controls">
            <div className="contact-saved-plate guide-contact-plate" aria-label="Caregiver phone contact information">
              <div className="contact-plate-details">
                <div className="contact-plate-name">
                  {contactName}
                </div>
                <div 
                  className="contact-plate-phone" 
                  role="text" 
                  aria-label={`Phone number: ${contactPhone}`}
                >
                  {getPhoneGroups(contactPhone).map((group, idx) => (
                    <span key={idx} className="phone-group-chunk">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="guide-section-desc guide-contact-note">
              Please dial this number directly on your telephone.
            </p>

            <Link 
              to="/emergency" 
              className="guide-emergency-btn emergency-btn"
              aria-label="Open Emergency Help Screen"
            >
              <LifeBuoy size={28} strokeWidth={2.6} aria-hidden="true" />
              <span>Open Emergency Help Screen</span>
            </Link>
          </div>
        </section>

        {/* Section 6: Factory Reset Section */}
        <section className="guide-section guide-reset-section" aria-label="Factory Reset">
          <button
            id="btn-reset-safe-defaults"
            type="button"
            className="guide-reset-btn time-jump-btn reset-defaults-btn"
            onClick={handleReset}
            aria-label="Reset all Udobia settings and logs to safe factory defaults"
          >
            <RefreshCw size={20} strokeWidth={2.5} aria-hidden="true" />
            <span>Reset Everything to Factory Defaults</span>
          </button>
        </section>
      </main>
    </div>
  );
}

export default HelpPage;
