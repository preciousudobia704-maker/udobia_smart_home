import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, User, Users, Heart, Check } from 'lucide-react';
import { useSpeech } from '../context/SpeechContext';
import { useSmartHome } from '../context/SmartHomeContext';
import { ActivityLogModal } from '../components/ActivityLogModal';
import { AGE_PROFILES } from '../constants/ageProfiles';

function getPhoneGroups(phoneStr) {
  if (!phoneStr) return [];
  const parts = phoneStr.trim().split(/\s+/);
  if (parts.length > 1) return parts;
  return [phoneStr];
}

const AGE_TILES = [
  {
    id: AGE_PROFILES.YOUNGER,
    label: 'Younger adult',
    range: '18 to 39',
    icon: User
  },
  {
    id: AGE_PROFILES.MIDDLE,
    label: 'Middle-aged adult',
    range: '40 to 64',
    icon: Users
  },
  {
    id: AGE_PROFILES.OLDER,
    label: 'Older adult',
    range: '65 and older',
    icon: Heart
  }
];

export function SettingsPage() {
  const { soundEnabled, toggleSound, speak } = useSpeech();
  const { preferences, updatePreferences, applyAgeProfile } = useSmartHome();
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const contact = preferences.trusted_contact;
  const hasSavedContact = Boolean(contact && (contact.name || contact.phone));

  const [contactName, setContactName] = useState(contact?.name || '');
  const [contactPhone, setContactPhone] = useState(contact?.phone || '');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setContactName(preferences.trusted_contact?.name || '');
    setContactPhone(preferences.trusted_contact?.phone || '');
  }, [preferences.trusted_contact]);

  const handleProfileChange = (profileId) => {
    applyAgeProfile(profileId);
  };

  const handleOpenEdit = () => {
    setContactName(contact?.name || '');
    setContactPhone(contact?.phone || '');
    setIsConfirmingRemove(false);
    setIsEditingContact(true);
  };

  const handleCancelEdit = () => {
    setContactName(contact?.name || '');
    setContactPhone(contact?.phone || '');
    setIsConfirmingRemove(false);
    setIsEditingContact(false);
  };

  const handleSaveContact = (e) => {
    e?.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();

    if (!trimmedName && !trimmedPhone) {
      updatePreferences({ trusted_contact: null });
    } else {
      updatePreferences({
        trusted_contact: {
          name: trimmedName,
          phone: trimmedPhone
        }
      });
    }

    setIsEditingContact(false);
    setIsConfirmingRemove(false);
    setSavedFeedback(true);

    if (soundEnabled && speak) {
      speak('Contact saved.');
    }

    setTimeout(() => {
      setSavedFeedback(false);
    }, 3000);
  };

  const handleRemoveContact = () => {
    setContactName('');
    setContactPhone('');
    updatePreferences({ trusted_contact: null });
    setIsConfirmingRemove(false);
    setIsEditingContact(false);
    setSavedFeedback(true);

    if (soundEnabled && speak) {
      speak('Contact removed.');
    }

    setTimeout(() => {
      setSavedFeedback(false);
    }, 3000);
  };

  return (
    <div className="settings-page-container" aria-label="Settings Page">
      {/* 1. Page Title (Screen reader accessible, visually hidden) */}
      <h1 className="settings-page-title visually-hidden">Settings</h1>

      {/* 2. Single Paper Sheet */}
      <main className="settings-sheet">
        {/* ==============================================================
            SECTION 1: Display and voice preferences (No heading)
           ============================================================== */}
        <section className="settings-section" aria-label="Display and voice preferences">
          <div className="settings-section-rows">
            {/* Row 1: Your age group (Wide control: title & description on top, control under) */}
            <div className="settings-row settings-row-stacked" aria-labelledby="setting-profile-title">
              <div className="settings-row-info">
                <h3 id="setting-profile-title" className="settings-row-title">
                  Your age group
                </h3>
                <p className="settings-row-desc">
                  Pick your age group. The app will set the text size, the screen, and the voice to suit you.
                </p>
              </div>

              <div className="settings-row-control settings-control-tiles settings-control-full">
                <div 
                  className="age-profile-tiles-group" 
                  role="group" 
                  aria-label="Age Profile: Select your age group"
                >
                  {AGE_TILES.map((tile) => {
                    const isSelected = preferences.age_profile === tile.id;
                    const Icon = tile.icon;

                    return (
                      <button
                        key={tile.id}
                        id={`btn-settings-profile-${tile.id.toLowerCase()}`}
                        type="button"
                        className={`age-profile-choice-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleProfileChange(tile.id)}
                        aria-pressed={isSelected}
                        aria-label={`${tile.label}, ${tile.range}${isSelected ? ' (currently active)' : ''}`}
                      >
                        <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
                        <div className="profile-tile-text">
                          <span className="profile-tile-label">{tile.label}</span>
                          <span className="profile-tile-range">{tile.range}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: How the screen looks (Small control: inline side-by-side) */}
            <div className="settings-row settings-row-inline" aria-labelledby="setting-mode-title">
              <div className="settings-row-info">
                <h3 id="setting-mode-title" className="settings-row-title">
                  How the screen looks
                </h3>
                <p className="settings-row-desc">
                  {preferences.active_mode === 'SIMPLE'
                    ? 'Simple shows only the main things, with bigger buttons.'
                    : 'Standard shows everything in your home.'}
                </p>
              </div>

              <div className="settings-row-control">
                <div className="segmented-control-rocker" role="group" aria-label="Select display view mode">
                  <button
                    id="btn-view-mode-standard"
                    type="button"
                    className={`segmented-rocker-btn ${preferences.active_mode !== 'SIMPLE' ? 'active' : ''}`}
                    onClick={() => updatePreferences({ active_mode: 'STANDARD' })}
                    aria-pressed={preferences.active_mode !== 'SIMPLE'}
                    aria-label="Switch to Standard View"
                  >
                    <span>Standard</span>
                  </button>
                  <button
                    id="btn-view-mode-simple"
                    type="button"
                    className={`segmented-rocker-btn ${preferences.active_mode === 'SIMPLE' ? 'active' : ''}`}
                    onClick={() => updatePreferences({ active_mode: 'SIMPLE' })}
                    aria-pressed={preferences.active_mode === 'SIMPLE'}
                    aria-label="Switch to Simple View"
                  >
                    <span>Simple</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Voice (Small control: inline side-by-side) */}
            <div className="settings-row settings-row-inline" aria-labelledby="setting-voice-title">
              <div className="settings-row-info">
                <h3 id="setting-voice-title" className="settings-row-title">
                  Voice
                </h3>
                <p className="settings-row-desc">
                  The app tells you out loud what happened each time you tap a button.
                </p>
                <p className="voice-status-line" aria-live="polite">
                  {soundEnabled ? 'Sound is on.' : 'Sound is off.'}
                </p>
              </div>

              <div className="settings-row-control">
                <button
                  id="btn-settings-sound-toggle"
                  type="button"
                  className={`settings-action-btn ${soundEnabled ? 'sound-action-turn-off' : 'sound-action-turn-on'}`}
                  onClick={toggleSound}
                  aria-label={soundEnabled ? 'Turn Sound Off' : 'Turn Sound On'}
                >
                  {soundEnabled ? (
                    <>
                      <VolumeX size={24} strokeWidth={2.4} aria-hidden="true" />
                      <span>Turn Sound Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={24} strokeWidth={2.4} aria-hidden="true" />
                      <span>Turn Sound On</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            SECTION 2: Your contact and history
           ============================================================== */}
        <section className="settings-section" aria-labelledby="heading-contact-history">
          <h2 id="heading-contact-history" className="settings-section-heading">
            Your contact and history
          </h2>

          <div className="settings-section-rows">
            {/* Row 4: Your trusted contact (The Memorable Hero Element) */}
            <div className="settings-row settings-row-stacked settings-row-contact" aria-labelledby="setting-contact-title">
              <div className="settings-row-info">
                <h3 id="setting-contact-title" className="settings-row-title">
                  Your trusted contact
                </h3>
                <p className="settings-row-desc">
                  This is the person you would call if you need help. Their name and number show in big letters on the help screen.
                </p>

                {savedFeedback && (
                  <div className="contact-saved-feedback" role="status" aria-live="polite">
                    <Check size={20} strokeWidth={2.5} aria-hidden="true" />
                    <span>Contact saved.</span>
                  </div>
                )}
              </div>

              <div className="settings-row-control settings-control-full">
                {!isEditingContact ? (
                  /* 1. Large Plate Display View */
                  hasSavedContact ? (
                    <div className="contact-saved-plate" aria-label="Saved trusted contact">
                      <div className="contact-plate-details">
                        {contact?.name && (
                          <div className="contact-plate-name">
                            {contact.name}
                          </div>
                        )}
                        {contact?.phone && (
                          <div 
                            className="contact-plate-phone" 
                            role="text" 
                            aria-label={`Phone number: ${contact.phone}`}
                          >
                            {getPhoneGroups(contact.phone).map((group, idx) => (
                              <span key={idx} className="phone-group-chunk">
                                {group}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="contact-plate-actions">
                        <button
                          id="btn-edit-trusted-contact"
                          type="button"
                          className="btn-secondary"
                          onClick={handleOpenEdit}
                          aria-label="Change trusted contact details"
                        >
                          <span>Change</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* No Contact Saved View */
                    <div className="contact-empty-state">
                      <p className="contact-empty-msg">No trusted contact saved yet</p>
                      <button
                        id="btn-add-trusted-contact"
                        type="button"
                        className="btn-secondary"
                        onClick={handleOpenEdit}
                        aria-label="Add trusted contact"
                      >
                        <span>Add Contact</span>
                      </button>
                    </div>
                  )
                ) : (
                  /* 2. In-Place Form View */
                  <form className="contact-edit-form" onSubmit={handleSaveContact}>
                    <div className="contact-input-field">
                      <label htmlFor="input-contact-name" className="contact-input-label">
                        Name
                      </label>
                      <input
                        id="input-contact-name"
                        type="text"
                        className="contact-text-input"
                        placeholder="e.g. Sarah"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>

                    <div className="contact-input-field">
                      <label htmlFor="input-contact-phone" className="contact-input-label">
                        Phone number
                      </label>
                      <input
                        id="input-contact-phone"
                        type="tel"
                        inputMode="tel"
                        className="contact-text-input"
                        placeholder="e.g. +234 816 498 1474"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>

                    {isConfirmingRemove ? (
                      /* In-Place Remove Confirmation */
                      <div className="contact-remove-confirm-box" role="alert">
                        <p className="remove-confirm-prompt">Remove this contact?</p>
                        <div className="remove-confirm-actions">
                          <button
                            id="btn-confirm-remove-contact"
                            type="button"
                            className="btn-remove-confirm"
                            onClick={handleRemoveContact}
                            aria-label="Confirm remove contact"
                          >
                            <span>Yes, remove</span>
                          </button>
                          <button
                            id="btn-cancel-remove-contact"
                            type="button"
                            className="btn-secondary"
                            onClick={() => setIsConfirmingRemove(false)}
                            aria-label="Keep contact and cancel removal"
                          >
                            <span>Keep contact</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard Form Action Controls */
                      <div className="contact-form-actions">
                        <button
                          id="btn-save-trusted-contact"
                          type="submit"
                          className="btn-primary"
                          aria-label="Save Trusted Contact Details"
                        >
                          <span>Save Contact</span>
                        </button>

                        {hasSavedContact && (
                          <button
                            id="btn-remove-trusted-contact"
                            type="button"
                            className="btn-remove-text"
                            onClick={() => setIsConfirmingRemove(true)}
                            aria-label="Remove this contact"
                          >
                            <span>Remove Contact</span>
                          </button>
                        )}

                        <button
                          id="btn-cancel-edit-contact"
                          type="button"
                          className="btn-secondary btn-cancel-edit"
                          onClick={handleCancelEdit}
                          aria-label="Cancel editing contact"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Row 5: Activity History (Wide control: title & description on top, control under) */}
            <div className="settings-row settings-row-stacked" aria-labelledby="setting-history-title">
              <div className="settings-row-info">
                <h3 id="setting-history-title" className="settings-row-title">
                  Activity History
                </h3>
                <p className="settings-row-desc">
                  See a list of what you have switched on and off. It stays on this device and is never shared.
                </p>
              </div>

              <div className="settings-row-control">
                <button
                  id="btn-settings-open-logs"
                  type="button"
                  className="settings-action-btn settings-history-btn btn-secondary"
                  onClick={() => setIsLogsOpen(true)}
                  aria-label="Open interaction history logs"
                >
                  <span>View History</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Activity Logs Modal */}
      <ActivityLogModal 
        isOpen={isLogsOpen} 
        onClose={() => setIsLogsOpen(false)} 
      />
    </div>
  );
}

export default SettingsPage;
