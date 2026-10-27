import React from 'react';
import { Armchair, UtensilsCrossed, BedDouble, KeyRound } from 'lucide-react';
import { DeviceCard } from './DeviceCard';
import { useSmartHome } from '../context/SmartHomeContext';

const ROOM_ICONS = {
  'Living Room': Armchair,
  'Kitchen': UtensilsCrossed,
  'Bedroom': BedDouble,
  'Entrance': KeyRound
};

const ROOM_ORDER = ['Entrance', 'Living Room', 'Kitchen', 'Bedroom'];

export function DeviceGrid() {
  const { devices, preferences } = useSmartHome();

  // In Simple Mode, prioritize essential devices
  const filteredDevices = devices.filter(device => {
    // Simple Mode filter (hides non-essential devices if enabled)
    if (preferences.active_mode === 'SIMPLE') {
      return device.type === 'LIGHT' || device.type === 'THERMOSTAT' || device.type === 'LOCK';
    }
    return true;
  });

  return (
    <div className="device-dashboard-container">
      {ROOM_ORDER.map((roomName) => {
        const roomDevices = filteredDevices.filter(d => d.room === roomName);
        if (roomDevices.length === 0) return null;

        const RoomIcon = ROOM_ICONS[roomName] || Armchair;
        const countClass = roomDevices.length === 1 
          ? 'grid-cols-1' 
          : roomDevices.length === 2 
            ? 'grid-cols-2' 
            : 'grid-cols-3';

        return (
          <section 
            key={roomName} 
            className="room-group-section" 
            aria-labelledby={`room-title-${roomName.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="room-section-header">
              <h2 id={`room-title-${roomName.toLowerCase().replace(/\s+/g, '-')}`} className="room-section-title">
                <RoomIcon size="1.2em" strokeWidth={2.4} aria-hidden="true" className="room-title-icon" />
                <span>{roomName}</span>
              </h2>
            </div>

            <div className={`device-cards-grid ${countClass}`}>
              {roomDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default DeviceGrid;
