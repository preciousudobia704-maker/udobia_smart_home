import React, { useState, useEffect, useMemo } from 'react';
import { useSmartHome } from '../context/SmartHomeContext';
import { generateHomeStatus } from '../utils/homeStatus';

export function DashboardGreeting() {
  const { simulatedHour, isLiveClock, devices } = useSmartHome();
  const [realTime, setRealTime] = useState(() => new Date());

  // Keep live minutes synchronized every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Determine active hour and minutes (driven by real clock or ?dev=true simulated hour)
  const activeHour = isLiveClock ? realTime.getHours() : simulatedHour;
  const activeMinutes = isLiveClock ? realTime.getMinutes() : 0;

  // Format tabular time (e.g., 6:00 PM)
  const displayHour = activeHour % 12 === 0 ? 12 : activeHour % 12;
  const ampm = activeHour >= 12 ? 'PM' : 'AM';
  const displayMinutes = activeMinutes < 10 ? `0${activeMinutes}` : String(activeMinutes);
  const timeString = `${displayHour}:${displayMinutes} ${ampm}`;

  // 1. Greeting Times (separated from the sky)
  // Good morning 5:00 to 11:59, Good afternoon 12:00 to 16:59, Good evening 17:00 to 21:59, Good night 22:00 to 4:59
  const greetingText = useMemo(() => {
    if (activeHour >= 5 && activeHour < 12) {
      return 'Good morning.';
    } else if (activeHour >= 12 && activeHour < 17) {
      return 'Good afternoon.';
    } else if (activeHour >= 17 && activeHour < 22) {
      return 'Good evening.';
    } else {
      return 'Good night.';
    }
  }, [activeHour]);

  // 2. Sky bands in the arch stay as they are (night sky from 20:00)
  const skyPhase = useMemo(() => {
    if (activeHour >= 5 && activeHour < 12) {
      // Morning (5:00 to 11:59): pale gold into sky blue
      const progress = Math.max(0, Math.min(1, (activeHour - 5) / 6.99));
      return {
        id: 'morning',
        isNight: false,
        skyClass: 'sky-morning',
        progress
      };
    } else if (activeHour >= 12 && activeHour < 17) {
      // Afternoon (12:00 to 16:59): clear light blue
      const progress = Math.max(0, Math.min(1, (activeHour - 12) / 4.99));
      return {
        id: 'afternoon',
        isNight: false,
        skyClass: 'sky-afternoon',
        progress
      };
    } else if (activeHour >= 17 && activeHour < 20) {
      // Evening (17:00 to 19:59): soft peach into dusk lavender
      const progress = Math.max(0, Math.min(1, (activeHour - 17) / 2.99));
      return {
        id: 'evening',
        isNight: false,
        skyClass: 'sky-evening',
        progress
      };
    } else {
      // Night (20:00 to 4:59): deep navy with a pale moon
      let progress = 0;
      if (activeHour >= 20) {
        progress = (activeHour - 20) / 9;
      } else {
        progress = (activeHour + 4) / 9;
      }
      progress = Math.max(0, Math.min(1, progress));
      return {
        id: 'night',
        isNight: true,
        skyClass: 'sky-night',
        progress
      };
    }
  }, [activeHour]);

  // Compute position of celestial disc inside 136 x 184 inner glass window
  // Clamped progress keeps the disc aloft between 0.08 and 0.92
  const clampedProgress = 0.08 + skyPhase.progress * 0.84;
  const angle = clampedProgress * Math.PI;
  const celestialX = Math.round(68 - 46 * Math.cos(angle));
  const celestialY = Math.round(142 - 82 * Math.sin(angle));

  // Compute live plain-language factual home status sentence
  const homeStatusSentence = useMemo(() => {
    return generateHomeStatus(devices);
  }, [devices]);

  return (
    <section className="hero-band" aria-label="Home status, greeting and time of day">
      <div className="hero-band-inner">
        {/* Left: Arch Window with 6px frame, Sill, Sky, Moon/Sun, and Stars */}
        <div className="hero-arch-container" aria-hidden="true">
          <div className={`hero-arch-window ${skyPhase.skyClass}`}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 136 184" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="arch-sky-svg"
            >
              {/* Static Stars in Night Sky (6 to 8 stars, 2-3px diameter, varied opacity) */}
              {skyPhase.isNight && (
                <g className="arch-stars-group">
                  <circle cx="24" cy="42" r="1.1" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="46" cy="24" r="1.4" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="86" cy="28" r="1.0" fill="#FFFFFF" opacity="0.7" />
                  <circle cx="112" cy="46" r="1.3" fill="#FFFFFF" opacity="0.8" />
                  <circle cx="20" cy="88" r="1.0" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="116" cy="92" r="1.2" fill="#FFFFFF" opacity="0.75" />
                  <circle cx="68" cy="112" r="1.1" fill="#FFFFFF" opacity="0.55" />
                </g>
              )}

              {/* Rising Celestial Disc (Sun in day, Moon in night - dashed arc line removed) */}
              <g transform={`translate(${celestialX}, ${celestialY})`}>
                <g className="celestial-rise-anim">
                  {skyPhase.isNight ? (
                    // Pale Moon with gentle craters and crescent contour
                    <g className="celestial-moon">
                      <circle cx="0" cy="0" r="13" fill="#F8FAFC" />
                      <path 
                        d="M 4 -12 A 12 12 0 0 0 4 12 A 13 13 0 0 1 4 -12 Z" 
                        fill="#E2E8F0" 
                      />
                      <circle cx="-3" cy="-2" r="1.8" fill="#CBD5E1" opacity="0.6" />
                      <circle cx="-1" cy="4" r="1.3" fill="#CBD5E1" opacity="0.5" />
                      <circle cx="-6" cy="2" r="1.1" fill="#CBD5E1" opacity="0.5" />
                    </g>
                  ) : (
                    // Luminous Warm Sun Disc with soft ring
                    <g className="celestial-sun">
                      <circle cx="0" cy="0" r="18" fill="rgba(245, 184, 61, 0.28)" />
                      <circle cx="0" cy="0" r="12" fill="#F5B83D" stroke="#FFFFFF" strokeWidth="2" />
                    </g>
                  )}
                </g>
              </g>
            </svg>
          </div>
          {/* Architectural window sill ledge */}
          <div className="hero-arch-sill" />
        </div>

        {/* Right: Greeting, Tabular Clock, and Factual Home Status */}
        <div className="hero-content-column">
          <h2 className="hero-greeting-title">{greetingText}</h2>
          
          <div className="hero-time-display" aria-label={`Current time ${timeString}`}>
            <span className="hero-time-numerals">{timeString}</span>
          </div>

          <p className="hero-status-sentence">
            {homeStatusSentence}
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardGreeting;
