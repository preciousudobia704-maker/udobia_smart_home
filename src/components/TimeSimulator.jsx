import React from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset, Radio, X, RotateCcw } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export function TimeSimulator({ onClose }) {
  const { simulatedHour, changeSimulatedHour, isLiveClock, replayOnboarding } = useSmartHome();

  const presets = [
    { label: 'Morning (7:00 AM)', hour: 7, icon: Sunrise },
    { label: 'Afternoon (2:00 PM)', hour: 14, icon: Sun },
    { label: 'Evening (6:00 PM)', hour: 18, icon: Sunset },
    { label: 'Night (9:00 PM)', hour: 21, icon: Moon }
  ];

  const formattedHour = simulatedHour % 12 === 0 ? 12 : simulatedHour % 12;
  const ampm = simulatedHour >= 12 ? 'PM' : 'AM';

  return (
    <section className="time-simulator-bar" aria-label="Simulated Testing Time Controls">
      <div className="time-simulator-info">
        <div className="time-icon-badge" aria-hidden="true">
          <Clock size={28} />
        </div>
        <div>
          <div className="time-label-title">
            {isLiveClock ? 'Live Clock Time' : 'Simulated Testing Time'}
          </div>
          <div className="time-clock-display">
            <span>{formattedHour}:00 {ampm}</span>
            <span className="time-routine-badge">
              {simulatedHour >= 6 && simulatedHour < 12 ? 'Morning' : 
               simulatedHour >= 12 && simulatedHour < 17 ? 'Afternoon' :
               simulatedHour >= 17 && simulatedHour < 21 ? 'Evening' : 'Night'}
            </span>
          </div>
        </div>
      </div>

      <div className="time-buttons-row" role="group" aria-label="Quick Time Jumps for Testing Predictive Suggestions">
        <button
          id="btn-time-live"
          type="button"
          className={`time-jump-btn ${isLiveClock ? 'active' : ''}`}
          onClick={() => changeSimulatedHour(new Date().getHours(), true)}
        >
          <Radio size={18} aria-hidden="true" />
          <span>Real Time</span>
        </button>

        {presets.map((preset) => {
          const Icon = preset.icon;
          const isActive = !isLiveClock && simulatedHour === preset.hour;
          return (
            <button
              key={preset.hour}
              id={`btn-time-${preset.hour}`}
              type="button"
              className={`time-jump-btn ${isActive ? 'active' : ''}`}
              onClick={() => changeSimulatedHour(preset.hour, false)}
              aria-label={`Set simulated time to ${preset.label}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{preset.label}</span>
            </button>
          );
        })}

        <button
          id="btn-dev-replay-onboarding"
          type="button"
          className="time-jump-btn btn-dev-replay"
          onClick={replayOnboarding}
          aria-label="Replay Welcome Screen (clears only stored age profile)"
          title="Clears age profile and re-opens onboarding without wiping device states or history"
        >
          <RotateCcw size={18} aria-hidden="true" />
          <span>Replay Welcome Screen</span>
        </button>

        {onClose && (
          <button
            id="btn-close-time-simulator"
            type="button"
            className="time-jump-btn btn-close-dev-panel"
            onClick={onClose}
            aria-label="Hide time testing panel"
            style={{ marginLeft: 'auto', backgroundColor: '#f1f5f9', color: '#64748b' }}
          >
            <X size={18} aria-hidden="true" />
            <span>Hide Panel</span>
          </button>
        )}
      </div>
    </section>
  );
}
