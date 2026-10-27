// Default Initial Devices Data
export const INITIAL_DEVICES = [
  {
    id: 'en-door',
    name: 'Front Door',
    room: 'Entrance',
    type: 'LOCK',
    icon: 'DoorClosed',
    state: {
      locked: true,
    },
    primaryActionLabelOn: 'Unlock', // When locked, action to unlock
    primaryActionLabelOff: 'Lock',  // When unlocked, action to lock
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lr-light',
    name: 'Living Room Light',
    room: 'Living Room',
    type: 'LIGHT',
    icon: 'Lightbulb',
    state: {
      power: false,
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lr-ac',
    name: 'Air Conditioner',
    room: 'Living Room',
    type: 'THERMOSTAT',
    icon: 'AirVent',
    state: {
      power: false,
      temperature: 22,
      minTemp: 16,
      maxTemp: 30
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lr-tv',
    name: 'TV Power',
    room: 'Living Room',
    type: 'PLUG',
    icon: 'Tv',
    state: {
      power: false,
      plugType: 'Wall Socket'
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'kt-light',
    name: 'Kitchen Light',
    room: 'Kitchen',
    type: 'LIGHT',
    icon: 'Lightbulb',
    state: {
      power: false,
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'br-light',
    name: 'Bedroom Light',
    room: 'Bedroom',
    type: 'LIGHT',
    icon: 'Lightbulb',
    state: {
      power: false,
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'br-fan',
    name: 'Bedroom Fan',
    room: 'Bedroom',
    type: 'FAN',
    icon: 'Fan',
    state: {
      power: false,
    },
    primaryActionLabelOn: 'Turn Off',
    primaryActionLabelOff: 'Turn On',
    lastUpdated: new Date().toISOString()
  }
];

// Seed 7 days of realistic historical habit logs
export function generateSeedHistory() {
  const logs = [];
  const now = new Date();

  // Create daily entries for the past 7 days
  for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - dayOffset);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = targetDate.getDay() || 7; // 1-7

    // 1. Morning Routine (~07:00 - 07:15)
    // Kitchen Light ON at 07:02
    logs.push({
      log_id: `log-seed-${dayOffset}-1`,
      device_id: 'kt-light',
      device_name: 'Kitchen Light',
      action_type: 'TOGGLE_ON',
      time_of_day: '07:02:00',
      hour: 7,
      minute: 2,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T07:02:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });

    // Front Door UNLOCK at 07:06 (within 30m of Kitchen Light)
    logs.push({
      log_id: `log-seed-${dayOffset}-2`,
      device_id: 'en-door',
      device_name: 'Front Door',
      action_type: 'UNLOCK',
      time_of_day: '07:06:00',
      hour: 7,
      minute: 6,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T07:06:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });

    // 2. Evening Routine (~18:00 - 18:15)
    // Living Room Light ON at 18:05
    logs.push({
      log_id: `log-seed-${dayOffset}-3`,
      device_id: 'lr-light',
      device_name: 'Living Room Light',
      action_type: 'TOGGLE_ON',
      time_of_day: '18:05:00',
      hour: 18,
      minute: 5,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T18:05:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });

    // Air Conditioner ON at 18:10 (within 30m of Living Room Light)
    logs.push({
      log_id: `log-seed-${dayOffset}-4`,
      device_id: 'lr-ac',
      device_name: 'Air Conditioner',
      action_type: 'TOGGLE_ON',
      time_of_day: '18:10:00',
      hour: 18,
      minute: 10,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T18:10:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });

    // 3. Night Routine (~21:00 - 21:15)
    // Bedroom Light ON at 21:02
    logs.push({
      log_id: `log-seed-${dayOffset}-5`,
      device_id: 'br-light',
      device_name: 'Bedroom Light',
      action_type: 'TOGGLE_ON',
      time_of_day: '21:02:00',
      hour: 21,
      minute: 2,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T21:02:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });

    // Bedroom Fan ON at 21:07 (within 30m of Bedroom Light)
    logs.push({
      log_id: `log-seed-${dayOffset}-6`,
      device_id: 'br-fan',
      device_name: 'Bedroom Fan',
      action_type: 'TOGGLE_ON',
      time_of_day: '21:07:00',
      hour: 21,
      minute: 7,
      day_of_week: dayOfWeek,
      timestamp: new Date(`${dateStr}T21:07:00`).getTime(),
      execution_source: 'MANUAL_TAP'
    });
  }

  return logs;
}
