/**
 * Rule-Based Predictive Heuristic Engine
 * Deterministic conditional logic reading local interaction logs
 */

/**
 * Rule 1: Time-of-Day Heuristic
 * If a device has historically been activated around current hour on 3+ different days
 * and is not currently active, generate an activation suggestion.
 */
export function evaluateTimeBasedRule(currentHour, currentDevices, habitLogs) {
  if (!Array.isArray(habitLogs) || habitLogs.length === 0) return null;

  // Find inactive devices
  const inactiveDevices = currentDevices.filter(dev => {
    if (dev.type === 'LOCK') {
      return dev.state.locked === true; // Can suggest unlocking
    }
    return dev.state.power === false; // Power is OFF
  });

  if (inactiveDevices.length === 0) return null;

  for (const device of inactiveDevices) {
    // Find historical activations for this device around current hour (hour +- 1)
    const matchingLogs = habitLogs.filter(log => {
      const isTargetDevice = log.device_id === device.id;
      const isActivation = log.action_type === 'TOGGLE_ON' || log.action_type === 'UNLOCK';
      const logHour = log.hour !== undefined ? log.hour : new Date(log.timestamp).getHours();
      const hourMatch = Math.abs(logHour - currentHour) <= 1;
      return isTargetDevice && isActivation && hourMatch;
    });

    // Count distinct calendar dates/days
    const uniqueDays = new Set(matchingLogs.map(log => {
      const d = new Date(log.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));

    if (uniqueDays.size >= 3) {
      const actionVerb = device.type === 'LOCK' ? 'unlock' : 'turn on';
      const confirmLabel = device.type === 'LOCK' ? 'Yes, unlock' : 'Yes, turn on';

      const suggestionText = `You usually ${actionVerb} the ${device.name} around this time`;

      return {
        id: `sug-time-${device.id}-${currentHour}`,
        type: 'TIME_BASED',
        deviceId: device.id,
        deviceName: device.name,
        actionType: device.type === 'LOCK' ? 'UNLOCK' : 'TOGGLE_ON',
        title: `Daily Routine Suggestion`,
        reason: `Based on your routine across ${uniqueDays.size} past days`,
        message: suggestionText,
        spokenMessage: suggestionText,
        confirmLabel: confirmLabel,
        dismissLabel: 'Not now'
      };
    }
  }

  return null;
}

/**
 * Rule 2: Co-Occurrence Heuristic
 * If device A is just activated, and device B has historically been activated
 * within 30 minutes of device A on 3+ past days, suggest activating device B.
 */
export function evaluateCoOccurrenceRule(activatedDeviceId, currentDevices, habitLogs) {
  if (!activatedDeviceId || !Array.isArray(habitLogs) || habitLogs.length === 0) return null;

  const activatedDevice = currentDevices.find(d => d.id === activatedDeviceId);
  if (!activatedDevice) return null;

  // Find other devices that are currently inactive
  const otherInactiveDevices = currentDevices.filter(d => {
    if (d.id === activatedDeviceId) return false;
    if (d.type === 'LOCK') return d.state.locked === true;
    return d.state.power === false;
  });

  if (otherInactiveDevices.length === 0) return null;

  // Get historical activation logs of the triggered device
  const deviceALogs = habitLogs.filter(log => 
    log.device_id === activatedDeviceId && 
    (log.action_type === 'TOGGLE_ON' || log.action_type === 'UNLOCK')
  );

  for (const candidate of otherInactiveDevices) {
    let coOccurCount = 0;
    const pairedDays = new Set();

    // Check each activation of Device A to see if Candidate Device was activated within 30 mins
    for (const logA of deviceALogs) {
      const timeA = logA.timestamp;
      const d = new Date(timeA);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      const matchedB = habitLogs.some(logB => {
        if (logB.device_id !== candidate.id) return false;
        if (logB.action_type !== 'TOGGLE_ON' && logB.action_type !== 'UNLOCK') return false;
        const timeDiffMinutes = Math.abs(logB.timestamp - timeA) / (1000 * 60);
        return timeDiffMinutes <= 30;
      });

      if (matchedB && !pairedDays.has(dayKey)) {
        pairedDays.add(dayKey);
        coOccurCount++;
      }
    }

    if (coOccurCount >= 3) {
      const actionVerb = candidate.type === 'LOCK' ? 'unlock' : 'turn on';
      const confirmLabel = candidate.type === 'LOCK' ? 'Yes, unlock' : 'Yes, turn on';

      const suggestionText = `You usually ${actionVerb} the ${candidate.name} around this time`;

      return {
        id: `sug-cooccur-${candidate.id}-${Date.now()}`,
        type: 'CO_OCCURRENCE',
        deviceId: candidate.id,
        deviceName: candidate.name,
        triggerDeviceName: activatedDevice.name,
        actionType: candidate.type === 'LOCK' ? 'UNLOCK' : 'TOGGLE_ON',
        title: `Paired Habit Suggestion`,
        reason: `Usually activated around this time on ${coOccurCount} past days`,
        message: suggestionText,
        spokenMessage: suggestionText,
        confirmLabel: confirmLabel,
        dismissLabel: 'Not now'
      };
    }
  }

  return null;
}
