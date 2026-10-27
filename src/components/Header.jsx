import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle, Type, Settings, ArrowLeft } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { UdobiaLogo } from './DeviceIllustrations';

export function Header() {
  const { preferences, updatePreferences } = useSmartHome();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTextScaleChange = (scale) => {
    updatePreferences({ text_scale: scale });
  };

  const hasOnboarded = Boolean(preferences.age_profile);
  const isEmergency = location.pathname === '/emergency';
  const isOnboarding = location.pathname === '/onboarding' || (!hasOnboarded && !isEmergency);
  const isHome = location.pathname === '/';
  const isSettingsActive = location.pathname === '/settings';
  const isHelpActive = location.pathname === '/help';

  return (
    <header 
      className={`app-header ${isHome ? 'header-scrollable' : 'header-sticky'} ${isScrolled ? 'is-scrolled' : ''}`} 
      role="banner"
    >
      <div className="header-inner">
        {/* 1. Left Area: Wordmark alone on Home & Onboarding, Back to Home control on other subpages */}
        <div className="header-left-slot">
          {(isHome || location.pathname === '/onboarding') ? (
            <Link 
              to="/" 
              className="header-brand header-brand-link" 
              aria-label="Udobia - Go to Home Dashboard"
            >
              <div className="brand-icon-wrapper" aria-hidden="true">
                <UdobiaLogo size={44} />
              </div>
              <div className="brand-text-block">
                <h1 className="brand-title">Udobia</h1>
                <p className="brand-subtitle">Smart Home</p>
              </div>
            </Link>
          ) : (
            <Link 
              to="/" 
              id="btn-header-back-home"
              className="header-back-pill"
              aria-label="Return to Home Dashboard"
            >
              <ArrowLeft size="1.2em" strokeWidth={2.5} aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          )}
        </div>

        {/* 2. Controls Row: Text Size, Settings, and Guide grouped together in exact order */}
        {!isOnboarding && (
          <div className="header-controls" role="toolbar" aria-label="Accessibility and Navigation">
            {/* Fully Exposed Text Size Controls */}
            <div className="text-size-group" role="group" aria-label="Adjust Text Size">
              <span className="text-size-label">
                <Type size="1.2em" aria-hidden="true" />
                <span>Text:</span>
              </span>
              <button
                id="btn-size-normal"
                type="button"
                className={`text-size-btn ${preferences.text_scale === 'normal' || !preferences.text_scale ? 'active' : ''}`}
                onClick={() => handleTextScaleChange('normal')}
                aria-label="Standard font size"
                aria-pressed={preferences.text_scale === 'normal' || !preferences.text_scale}
              >
                A
              </button>
              <button
                id="btn-size-large"
                type="button"
                className={`text-size-btn ${preferences.text_scale === 'large' ? 'active' : ''}`}
                onClick={() => handleTextScaleChange('large')}
                aria-label="Large font size"
                aria-pressed={preferences.text_scale === 'large'}
              >
                A+
              </button>
              <button
                id="btn-size-xlarge"
                type="button"
                className={`text-size-btn ${preferences.text_scale === 'xlarge' ? 'active' : ''}`}
                onClick={() => handleTextScaleChange('xlarge')}
                aria-label="Extra large font size"
                aria-pressed={preferences.text_scale === 'xlarge'}
              >
                A++
              </button>
            </div>

            {/* Settings Button: Shown after onboarding and hidden on Settings page */}
            {hasOnboarded && !isSettingsActive && (
              <button
                id="btn-open-settings"
                type="button"
                className="header-btn"
                onClick={() => navigate('/settings')}
                aria-label="Open settings page for sound, display mode, and history"
              >
                <Settings size="1.2em" strokeWidth={2.4} aria-hidden="true" />
                <span className="btn-label-text">Settings</span>
              </button>
            )}

            {/* Guide Button: Shown after onboarding and hidden on Help & Emergency pages */}
            {hasOnboarded && !isHelpActive && !isEmergency && (
              <button
                id="btn-open-help"
                type="button"
                className="header-btn btn-guide"
                onClick={() => navigate('/help')}
                aria-label="Open guide and caregiver support"
              >
                <HelpCircle size="1.2em" strokeWidth={2.4} aria-hidden="true" />
                <span className="btn-label-text">Guide</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
