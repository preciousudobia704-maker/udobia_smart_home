/**
 * Generates a plain-language factual sentence from current device states.
 * Follows strict safety rules: states facts only, never says "all is well" or implies safety.
 * Updates live as devices change with zero network calls.
 */
export function generateHomeStatus(devices) {
  if (!devices || devices.length === 0) {
    return 'No devices are connected.';
  }

  // 1. Check Front Door lock status
  const doorDevice = devices.find(d => d.type === 'LOCK');
  let doorPart = '';
  if (doorDevice) {
    const isLocked = Boolean(doorDevice.state?.locked);
    doorPart = isLocked ? 'The front door is locked.' : 'The front door is unlocked.';
  }

  // 2. Tally other active appliances/devices
  const nonLockDevices = devices.filter(d => d.type !== 'LOCK');
  const activeDevices = nonLockDevices.filter(d => Boolean(d.state?.power));

  const numberWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

  let devicesPart = '';
  if (activeDevices.length === 0) {
    devicesPart = 'Everything is switched off.';
  } else {
    // Breakdown by device type
    const lightsOn = activeDevices.filter(d => d.type === 'LIGHT');
    const fansOn = activeDevices.filter(d => d.type === 'FAN');
    const acsOn = activeDevices.filter(d => d.type === 'THERMOSTAT');
    const plugsOn = activeDevices.filter(d => d.type === 'PLUG');

    const totalLights = nonLockDevices.filter(d => d.type === 'LIGHT').length;

    const parts = [];

    if (lightsOn.length > 0) {
      if (lightsOn.length === totalLights && totalLights > 1) {
        parts.push('all lights');
      } else if (lightsOn.length === 1) {
        parts.push('one light');
      } else {
        const countWord = (numberWords[lightsOn.length] || String(lightsOn.length)).toLowerCase();
        parts.push(`${countWord} lights`);
      }
    }

    if (fansOn.length > 0) {
      parts.push('the bedroom fan');
    }

    if (acsOn.length > 0) {
      parts.push('the air conditioner');
    }

    if (plugsOn.length > 0) {
      parts.push('the television');
    }

    // Join clauses with proper grammar
    if (parts.length === 1) {
      const phrase = parts[0];
      const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);
      const isPlural = phrase.endsWith('lights') || phrase.endsWith('appliances');
      devicesPart = `${capitalized} ${isPlural ? 'are' : 'is'} on.`;
    } else if (parts.length === 2) {
      const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      devicesPart = `${first} and ${parts[1]} are on.`;
    } else {
      const allExceptLast = parts.slice(0, -1).join(', ');
      const last = parts[parts.length - 1];
      const capitalized = allExceptLast.charAt(0).toUpperCase() + allExceptLast.slice(1);
      devicesPart = `${capitalized}, and ${last} are on.`;
    }
  }

  // Combine door and device status
  if (doorPart && devicesPart) {
    return `${doorPart} ${devicesPart}`;
  }
  return doorPart || devicesPart || 'Everything is switched off.';
}
