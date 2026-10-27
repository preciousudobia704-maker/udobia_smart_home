import React from 'react';
import { Minus, Plus, Power, Lock, Unlock, Check } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { 
  BulbIllustration, 
  FanIllustration, 
  AcIllustration, 
  PadlockIllustration, 
  PlugIllustration 
} from './DeviceIllustrations';

export function DeviceCard({ device }) {
  const { toggleDevice, adjustAcTemperature } = useSmartHome();

  const isLockType = device.type === 'LOCK';
  const isThermostat = device.type === 'THERMOSTAT';
  const isPlug = device.type === 'PLUG';
  const isLight = device.type === 'LIGHT';
  const isFan = device.type === 'FAN';

  // Determine active state
  const isActive = isLockType ? !device.state.locked : Boolean(device.state.power);

  // Custom 64px+ inline illustrations
  const renderIllustration = () => {
    if (isLight) return <BulbIllustration isOn={isActive} size={70} />;
    if (isFan) return <FanIllustration isOn={isActive} size={70} />;
    if (isThermostat) return <AcIllustration isOn={isActive} size={70} />;
    if (isLockType) return <PadlockIllustration isLocked={Boolean(device.state.locked)} size={70} />;
    if (isPlug) return <PlugIllustration isOn={isActive} size={70} />;
    return <BulbIllustration isOn={isActive} size={70} />;
  };

  // Button wording: "Unlock" when locked, "Lock" when unlocked
  const getActionLabel = () => {
    if (isLockType) {
      return device.state.locked ? 'Unlock' : 'Lock';
    }
    return isActive ? 'Turn Off' : 'Turn On';
  };

  const getButtonClass = () => {
    if (isLockType) {
      return device.state.locked ? 'action-door-unlock action-turn-off' : 'action-door-lock action-turn-on';
    }
    return isActive ? 'action-turn-off' : 'action-turn-on';
  };

  // Card specific modifier classes
  const getCardTypeClass = () => {
    if (isLight) return `device-card-light ${isActive ? 'is-light-on' : ''}`;
    if (isFan) return `device-card-fan ${isActive ? 'is-fan-on' : ''}`;
    if (isThermostat) return `device-card-ac ${isActive ? 'is-ac-on' : ''}`;
    if (isLockType) return `device-card-lock ${device.state.locked ? 'is-door-locked' : 'is-door-unlocked'}`;
    if (isPlug) return `device-card-plug ${isActive ? 'is-plug-on' : ''}`;
    return '';
  };

  return (
    <article 
      className={`device-card ${getCardTypeClass()} ${isActive ? 'is-active' : ''}`}
      aria-label={device.name}
    >
      <div className="device-card-inner">
        {/* Left Side: Illustration and Device Name */}
        <div className="device-card-left">
          <div className="device-illustration-slot">
            {renderIllustration()}
          </div>
          
          <div className="device-text-slot">
            <h3 className="device-title">{device.name}</h3>

            {/* Subtitle / Plug Type */}
            {isPlug && (
              <p className="device-caption">
                Connected via {device.state.plugType || 'Wall socket'}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: State Details & Action Button */}
        <div className="device-card-right">
          <div className="device-card-state">
            {/* Front Door Large State Word with Check Icon when locked */}
            {isLockType && (
              <div className="door-state-indicator">
                <div className="door-state-badge">
                  <span className="door-state-word">
                    {device.state.locked ? 'Locked' : 'Unlocked'}
                  </span>
                  {device.state.locked && (
                    <Check size={28} strokeWidth={3.5} aria-hidden="true" className="door-check-icon" />
                  )}
                </div>
              </div>
            )}

            {/* Lights, Fan, Television: State Word "On" / "Off" in about 32px, 800 weight */}
            {(isLight || isFan || isPlug) && (
              <div className="device-state-indicator">
                <span className="device-state-word">
                  {isActive ? 'On' : 'Off'}
                </span>
              </div>
            )}

            {/* Air Conditioner When Off: State Word "Off" in about 32px, 800 weight */}
            {isThermostat && !isActive && (
              <div className="device-state-indicator">
                <span className="device-state-word">Off</span>
              </div>
            )}

            {/* Air Conditioner When Active: 64px numerals, left-aligned "Target temperature", Cooler/Warmer pill directly on surface */}
            {isThermostat && isActive && (
              <div className="ac-direct-controls" aria-label="Temperature controls">
                <div className="ac-temp-block">
                  <span className="ac-temp-numerals">
                    {device.state.temperature}°C
                  </span>
                  <span className="ac-temp-target-label">Target temperature</span>
                </div>

                <div className="ac-temp-rocker" role="group" aria-label="Adjust temperature">
                  <button
                    id={`btn-temp-down-${device.id}`}
                    type="button"
                    className="temp-rocker-btn temp-rocker-cooler"
                    onClick={() => adjustAcTemperature(device.id, -1)}
                    disabled={device.state.temperature <= device.state.minTemp}
                    aria-label={`Lower temperature to ${device.state.temperature - 1} degrees`}
                  >
                    <Minus size={20} strokeWidth={3} aria-hidden="true" />
                    <span>Cooler</span>
                  </button>

                  <div className="temp-rocker-divider" aria-hidden="true" />

                  <button
                    id={`btn-temp-up-${device.id}`}
                    type="button"
                    className="temp-rocker-btn temp-rocker-warmer"
                    onClick={() => adjustAcTemperature(device.id, 1)}
                    disabled={device.state.temperature >= device.state.maxTemp}
                    aria-label={`Raise temperature to ${device.state.temperature + 1} degrees`}
                  >
                    <Plus size={20} strokeWidth={3} aria-hidden="true" />
                    <span>Warmer</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button (>= 60px height, scale 0.97 pressed) */}
          <div className="device-action-row">
            <button
              id={`btn-toggle-${device.id}`}
              type="button"
              className={`device-action-btn ${getButtonClass()}`}
              onClick={() => toggleDevice(device.id)}
              aria-label={`${getActionLabel()} for ${device.name}`}
            >
              {isLockType ? (
                device.state.locked ? (
                  <Unlock size={24} strokeWidth={2.4} aria-hidden="true" />
                ) : (
                  <Lock size={24} strokeWidth={2.4} aria-hidden="true" />
                )
              ) : (
                <Power size={24} strokeWidth={2.4} aria-hidden="true" />
              )}
              <span>{getActionLabel()}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default DeviceCard;
