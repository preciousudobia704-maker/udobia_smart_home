export const AGE_PROFILES = {
  YOUNGER: 'YOUNGER',
  MIDDLE: 'MIDDLE',
  OLDER: 'OLDER'
};

export const AGE_PROFILE_CONFIGS = [
  {
    id: AGE_PROFILES.YOUNGER,
    title: 'Younger adult (18 to 39)',
    description: 'Full controls on one screen with standard text size.',
    iconName: 'User',
    text_scale: 'normal',
    active_mode: 'STANDARD',
    sound_enabled: true
  },
  {
    id: AGE_PROFILES.MIDDLE,
    title: 'Middle-aged adult (40 to 64)',
    description: 'Full controls on one screen with larger text for easier reading.',
    iconName: 'Users',
    text_scale: 'large',
    active_mode: 'STANDARD',
    sound_enabled: true
  },
  {
    id: AGE_PROFILES.OLDER,
    title: 'Older adult (65 and older)',
    description: 'Simplified screens with fewer options and the largest text.',
    iconName: 'Heart',
    text_scale: 'xlarge',
    active_mode: 'SIMPLE',
    sound_enabled: true
  }
];

export function getAgeProfileConfig(profileId) {
  return AGE_PROFILE_CONFIGS.find(p => p.id === profileId) || null;
}
