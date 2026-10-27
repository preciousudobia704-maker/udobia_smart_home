import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { SpeechProvider } from './context/SpeechContext';
import { SmartHomeProvider } from './context/SmartHomeContext';
import { useSmartHome } from './context/SmartHomeContext';
import { Header } from './components/Header';
import { TimeSimulator } from './components/TimeSimulator';
import { UndoToast } from './components/UndoToast';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { EmergencyPage } from './pages/EmergencyPage';
import './styles/app.css';

function MainLayout() {
  const [showDevTime, setShowDevTime] = useState(false);
  const { preferences } = useSmartHome();

  const hasOnboarded = Boolean(preferences.age_profile);


  const isDevMode = (() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('dev') === 'true' || params.get('dev') === '1';
  })();

  return (
    <div className="app-container">
      {/* Dark Navy Header with text scale controls and navigation */}
      <Header />

      {/* Main Responsive Canvas */}
      <main className="main-content" role="main">
        {/* Simulated Testing Time Panel (Only accessible when ?dev=true is active and toggled open) */}
        {isDevMode && showDevTime && (
          <TimeSimulator onClose={() => setShowDevTime(false)} />
        )}

        <Routes>
          {hasOnboarded ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          )}
        </Routes>
      </main>

      {/* Persistent 5-second Undo / State Rollback Toast */}
      {hasOnboarded && <UndoToast />}

      {/* Dev Tools toggle button in bottom corner - Only rendered if ?dev=true is in URL */}
      {isDevMode && (
        <div className="dev-tools-toggle-wrapper">
          <button
            id="btn-toggle-dev-time"
            type="button"
            className="dev-tools-toggle-btn"
            onClick={() => setShowDevTime(prev => !prev)}
            aria-expanded={showDevTime}
            aria-label={showDevTime ? 'Hide time testing panel' : 'Open time testing panel for developer testing'}
          >
            <Wrench size={16} aria-hidden="true" />
            <span>{showDevTime ? 'Close Dev Time' : 'Dev Time Panel'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SpeechProvider>
        <SmartHomeProvider>
          <MainLayout />
        </SmartHomeProvider>
      </SpeechProvider>
    </BrowserRouter>
  );
}
