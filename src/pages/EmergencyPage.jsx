import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, Info, UserPlus, PhoneCall, AlertTriangle } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { useSpeech } from '../context/SpeechContext';

/**
 * Splits phone string into readable non-breaking groups (e.g., "+234", "816", "498", "1474")
 * so each group stays strictly together on one line and never breaks mid-group.
 */
function getPhoneGroups(phone) {
  if (!phone) return [];
  const trimmed = phone.trim();
  if (trimmed.includes(' ')) {
    return trimmed.split(/\s+/);
  }
  const chunks = trimmed.match(/.{1,4}/g);
  return chunks || [trimmed];
}

/**
 * Converts phone number into unhurried, clearly separated spoken digits
 */
function getSpokenPhoneText(phone) {
  if (!phone) return '';
  return phone
    .replace(/\+/g, 'plus ')
    .split('')
    .map(char => {
      if (/\d/.test(char)) return `${char} `;
      if (char === ' ' || char === '-') return ', ';
      return char;
    })
    .join('');
}

export function EmergencyPage() {
  const { preferences, createHabitLog } = useSmartHome();
  const { soundEnabled, cancelSpeech, selectedVoice } = useSpeech();

  // Active step highlighted during sequential read-aloud: null | 1 | 2 | 3
  const [activeStep, setActiveStep] = useState(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const hasAutoSpokenRef = useRef(false);
  const isMountedRef = useRef(true);

  const contact = preferences.trusted_contact;
  const hasContact = Boolean(contact && (contact.name || contact.phone));
  const contactName = contact?.name || '';
  const contactPhone = contact?.phone || '';
  const phoneGroups = getPhoneGroups(contactPhone);

  // 1. Log "Opened emergency help screen" in Activity History on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (createHabitLog) {
      createHabitLog('emergency-help', 'Emergency Help', 'Opened emergency help screen', 'DIRECT_VIEW');
    }

    return () => {
      isMountedRef.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [createHabitLog]);

  // 2. Step-by-Step Read Aloud Engine
  const startSequentialReadAloud = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel existing audio
    window.speechSynthesis.cancel();

    if (!soundEnabled) {
      console.log('[Emergency Help] Voice read-aloud requested but sound is currently off in Settings.');
      return;
    }

    setIsReadingAloud(true);

    const step1Utterance = new SpeechSynthesisUtterance(
      'Step 1. Stay where you are if it is safe to do so.'
    );
    step1Utterance.rate = 0.82; // Calm, clear, unhurried
    step1Utterance.pitch = 1.0;
    if (selectedVoice) step1Utterance.voice = selectedVoice;

    let step2Text = '';
    if (hasContact) {
      const spokenPhone = getSpokenPhoneText(contactPhone);
      step2Text = `Step 2. Call your trusted contact, ${contactName}, on your phone at ${spokenPhone}.`;
    } else {
      step2Text = 'Step 2. Call your trusted contact on your phone. No trusted contact saved yet. You can add one in Settings.';
    }

    const step2Utterance = new SpeechSynthesisUtterance(step2Text);
    step2Utterance.rate = 0.82;
    step2Utterance.pitch = 1.0;
    if (selectedVoice) step2Utterance.voice = selectedVoice;

    const step3Utterance = new SpeechSynthesisUtterance(
      'Step 3. If it is a serious emergency, call 1, 1, 2 on your phone.'
    );
    step3Utterance.rate = 0.82;
    step3Utterance.pitch = 1.0;
    if (selectedVoice) step3Utterance.voice = selectedVoice;

    // Step 1 Events
    step1Utterance.onstart = () => {
      if (isMountedRef.current) setActiveStep(1);
    };
    step1Utterance.onend = () => {
      if (isMountedRef.current) {
        window.speechSynthesis.speak(step2Utterance);
      }
    };
    step1Utterance.onerror = () => {
      if (isMountedRef.current) {
        setActiveStep(null);
        setIsReadingAloud(false);
      }
    };

    // Step 2 Events
    step2Utterance.onstart = () => {
      if (isMountedRef.current) setActiveStep(2);
    };
    step2Utterance.onend = () => {
      if (isMountedRef.current) {
        window.speechSynthesis.speak(step3Utterance);
      }
    };
    step2Utterance.onerror = () => {
      if (isMountedRef.current) {
        setActiveStep(null);
        setIsReadingAloud(false);
      }
    };

    // Step 3 Events
    step3Utterance.onstart = () => {
      if (isMountedRef.current) setActiveStep(3);
    };
    step3Utterance.onend = () => {
      if (isMountedRef.current) {
        setActiveStep(null);
        setIsReadingAloud(false);
      }
    };
    step3Utterance.onerror = () => {
      if (isMountedRef.current) {
        setActiveStep(null);
        setIsReadingAloud(false);
      }
    };

    // Begin playback with step 1
    window.speechSynthesis.speak(step1Utterance);
  }, [soundEnabled, selectedVoice, hasContact, contactName, contactPhone]);

  const stopReadAloud = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveStep(null);
    setIsReadingAloud(false);
  }, []);

  const handleReadAloudToggle = () => {
    if (isReadingAloud) {
      stopReadAloud();
    } else {
      startSequentialReadAloud();
    }
  };

  // 3. Auto-read steps once when screen opens if sound is on
  useEffect(() => {
    if (soundEnabled && !hasAutoSpokenRef.current) {
      hasAutoSpokenRef.current = true;
      const timer = setTimeout(() => {
        startSequentialReadAloud();
      }, 550); // slight breathing room for initial entry slide animation
      return () => clearTimeout(timer);
    }
  }, [soundEnabled, startSequentialReadAloud]);

  return (
    <div className="emergency-screen-wrapper" aria-label="Emergency Help Screen">
      <div className="emergency-container">
        {/* Responsive Two-Column Layout (1 Column on Mobile) */}
        <div className="emergency-grid">
          
          {/* ============================================================
              LEFT COLUMN: Stay Calm, Breathing Ring, Voice Action
             ============================================================ */}
          <section className="emergency-col-left" aria-labelledby="emergency-heading-main">
            <div className="emergency-heading-group">
              <h1 id="emergency-heading-main" className="emergency-hero-title">
                Stay calm.
              </h1>
              <p className="emergency-hero-subtitle">
                Here is what to do.
              </p>
            </div>

            {/* Breathing Ring with Faint Teal Radial Glow */}
            <div className="emergency-breathing-area" aria-label="Slow breathing visual guide">
              <div className="emergency-breathing-glow" aria-hidden="true" />
              <div className="emergency-breathing-ring" aria-hidden="true" />
              <div className="emergency-breathing-caption-wrap">
                <span className="emergency-breathing-caption">Take a slow breath</span>
              </div>
            </div>

            {/* Read These Steps Aloud Button */}
            <div className="emergency-speech-action-wrap">
              <button
                id="btn-read-emergency-steps"
                type="button"
                className={`emergency-read-aloud-btn ${isReadingAloud ? 'is-playing' : ''}`}
                onClick={handleReadAloudToggle}
                aria-pressed={isReadingAloud}
                aria-label={isReadingAloud ? 'Stop reading emergency steps aloud' : 'Read these emergency steps aloud slowly'}
              >
                <Volume2 size={28} strokeWidth={2.4} aria-hidden="true" />
                <span>{isReadingAloud ? 'Reading Steps Aloud...' : 'Read These Steps Aloud'}</span>
              </button>

              {!soundEnabled && (
                <p className="emergency-sound-status-hint">
                  <VolumeX size={16} aria-hidden="true" />
                  <span>Voice sound is currently off in Settings.</span>
                </p>
              )}
            </div>
          </section>

          {/* ============================================================
              RIGHT COLUMN: Vertical Timeline (3 Distinct Tonal Steps)
             ============================================================ */}
          <section className="emergency-col-right" aria-label="Emergency Steps Timeline">
            <div className="emergency-timeline-track">
              {/* Thin Vertical Guide Line */}
              <div className="emergency-timeline-line" aria-hidden="true" />

              {/* --------------------------------------------------------
                  STEP 1 (Compact Tonal Surface)
                 -------------------------------------------------------- */}
              <article 
                className={`emergency-timeline-step emergency-step-1 ${activeStep === 1 ? 'is-step-active' : ''}`}
                aria-current={activeStep === 1 ? 'step' : undefined}
              >
                <div className="step-numeral-badge" aria-hidden="true">
                  1
                </div>
                <div className="step-content-card step-card-compact">
                  <p className="step-compact-instruction">
                    Stay where you are if it is safe to do so.
                  </p>
                </div>
              </article>

              {/* --------------------------------------------------------
                  STEP 2 (The Hero Contact Plate)
                 -------------------------------------------------------- */}
              <article 
                className={`emergency-timeline-step emergency-step-2 ${activeStep === 2 ? 'is-step-active' : ''}`}
                aria-current={activeStep === 2 ? 'step' : undefined}
              >
                <div className="step-numeral-badge" aria-hidden="true">
                  2
                </div>
                <div className="step-content-card step-card-hero">
                  <div className="hero-contact-instruction">
                    Call your trusted contact on your phone.
                  </div>

                  {hasContact ? (
                    <div className="hero-contact-details">
                      {contactName && (
                        <div className="hero-contact-name">
                          {contactName}
                        </div>
                      )}
                      
                      {/* Huge bold digits with tabular numerals in non-breaking groups */}
                      {contactPhone && (
                        <div 
                          className="hero-contact-phone-plate" 
                          role="text" 
                          aria-label={`Phone number: ${contactPhone}`}
                        >
                          {phoneGroups.map((group, idx) => (
                            <span key={idx} className="phone-group-chunk">
                              {group}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hero-no-contact-state">
                      <p className="no-contact-text">No trusted contact saved yet</p>
                      <Link 
                        to="/settings" 
                        id="btn-emergency-add-contact" 
                        className="emergency-add-contact-btn"
                        aria-label="Add trusted contact in Settings"
                      >
                        <UserPlus size={22} strokeWidth={2.4} aria-hidden="true" />
                        <span>Add Trusted Contact</span>
                      </Link>
                    </div>
                  )}

                  {/* Quiet Callout directly under contact plate - No border, impossible to miss */}
                  <aside className="emergency-quiet-callout" role="note">
                    <Info size={24} strokeWidth={2.4} className="quiet-callout-icon" aria-hidden="true" />
                    <p className="quiet-callout-text">
                      This app cannot call or message anyone for you. Please use your phone to make the call.
                    </p>
                  </aside>
                </div>
              </article>

              {/* --------------------------------------------------------
                  STEP 3 (Soft Coral Tone Plate for 112)
                 -------------------------------------------------------- */}
              <article 
                className={`emergency-timeline-step emergency-step-3 ${activeStep === 3 ? 'is-step-active' : ''}`}
                aria-current={activeStep === 3 ? 'step' : undefined}
              >
                <div className="step-numeral-badge" aria-hidden="true">
                  3
                </div>
                <div className="step-content-card step-card-coral">
                  <p className="step-coral-instruction">
                    If it is a serious emergency, call
                  </p>
                  <div 
                    className="emergency-112-display" 
                    role="text" 
                    aria-label="Emergency telephone number: 112"
                  >
                    112
                  </div>
                </div>
              </article>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default EmergencyPage;
