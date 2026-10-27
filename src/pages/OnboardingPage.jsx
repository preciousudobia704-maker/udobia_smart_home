import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Heart, Check } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { useSpeech } from '../context/SpeechContext';
import { AGE_PROFILE_CONFIGS, AGE_PROFILES } from '../constants/ageProfiles';

const TILE_ICONS = {
  [AGE_PROFILES.YOUNGER]: User,
  [AGE_PROFILES.MIDDLE]: Users,
  [AGE_PROFILES.OLDER]: Heart
};

const AGE_DETAILS = {
  [AGE_PROFILES.YOUNGER]: {
    label: 'Younger adult',
    range: '18 to 39'
  },
  [AGE_PROFILES.MIDDLE]: {
    label: 'Middle-aged adult',
    range: '40 to 64'
  },
  [AGE_PROFILES.OLDER]: {
    label: 'Older adult',
    range: '65 and older'
  }
};

export function OnboardingPage() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const { applyAgeProfile } = useSmartHome();
  const { speak } = useSpeech();
  const navigate = useNavigate();

  const handleSelectTile = (profile) => {
    setSelectedProfile(profile.id);
    const detail = AGE_DETAILS[profile.id];
    // Speak the selected tile's label aloud on tap, respecting the sound setting
    speak(detail ? detail.label : profile.title);
  };

  const handleContinue = () => {
    if (!selectedProfile) return;

    // Apply the chosen profile settings (Younger: A, Middle: A+, Older: A++)
    applyAgeProfile(selectedProfile);
    speak('Welcome to Udobia');
    navigate('/');
  };

  return (
    <div className="onboarding-page-container" aria-label="Welcome and Interface Setup">
      {/* 1. Page Heading & Reassurance Line */}
      <header className="onboarding-header">
        <h1 className="onboarding-title">Welcome to Udobia</h1>
        <p className="onboarding-subtitle">
          Choose your age group and we will set up the app for you. You can change this at any time in Settings.
        </p>
      </header>

      {/* 2. Three Equal Tiles in One Row (Stacked under 800px) */}
      <section 
        className="onboarding-tiles-row" 
        role="radiogroup" 
        aria-label="Choose your age group"
      >
        {AGE_PROFILE_CONFIGS.map((profile) => {
          const isSelected = selectedProfile === profile.id;
          const Icon = TILE_ICONS[profile.id] || User;
          const detail = AGE_DETAILS[profile.id] || { label: profile.title, range: '' };

          return (
            <button
              key={profile.id}
              id={`btn-onboard-${profile.id.toLowerCase()}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`onboarding-tile-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelectTile(profile)}
            >
              {/* Corner Check Mark Badge (visible when selected) */}
              {isSelected && (
                <div className="tile-corner-badge" aria-hidden="true">
                  <Check size={20} strokeWidth={3.5} />
                </div>
              )}

              {/* 56px Icon in Ink with no circle behind it */}
              <div className="onboarding-tile-icon-wrap" aria-hidden="true">
                <Icon size={56} strokeWidth={2.4} />
              </div>

              {/* Tile Content: Label, Age Range, Description */}
              <div className="onboarding-tile-content">
                <h2 className="onboarding-tile-label">{detail.label}</h2>
                <div className="onboarding-tile-range">{detail.range}</div>
                <p className="onboarding-tile-desc">{profile.description}</p>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. Continue Action: Left-aligned, solid teal, with prompt hint while unselected */}
      <footer className="onboarding-footer">
        <button
          id="btn-onboarding-continue"
          type="button"
          className="btn-onboarding-continue"
          disabled={!selectedProfile}
          onClick={handleContinue}
          aria-label={selectedProfile ? 'Continue to your smart home dashboard' : 'Choose one to continue'}
        >
          <Check size={24} strokeWidth={3} aria-hidden="true" />
          <span>Continue</span>
        </button>

        {!selectedProfile && (
          <span className="onboarding-choose-hint">
            Choose one to continue.
          </span>
        )}
      </footer>
    </div>
  );
}

export default OnboardingPage;
