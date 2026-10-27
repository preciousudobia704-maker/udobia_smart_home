// Speech synthesis tuning parameters
export const SPEECH_CONFIG = {
  RATE: 0.95,   // Calibrated pacing (0.95 = clear, unhurried)
  PITCH: 1.05,  // Warm, natural inflection
  VOLUME: 1.0,  // Full clarity
  LANG_PREFIX: 'en'
};

/**
 * Selects preferred voice with Female voice priority, falling back to Google,
 * natural/neural, and default English voices.
 */
export function selectPreferredVoice(voicesList) {
  if (!voicesList || voicesList.length === 0) return null;

  // Filter for local service voices when available to ensure offline reliability (no network-based voices)
  const localVoices = voicesList.filter(v => v.localService === true);
  const basePool = localVoices.length > 0 ? localVoices : voicesList;

  const englishVoices = basePool.filter(v => v.lang && v.lang.toLowerCase().startsWith(SPEECH_CONFIG.LANG_PREFIX));
  const targetPool = englishVoices.length > 0 ? englishVoices : basePool;

  // 1. First priority: Female voice preference (e.g. "Microsoft Zira", "Samantha", "Google UK English Female")
  const femaleVoice = targetPool.find(v => /female/i.test(v.name)) ||
                      targetPool.find(v => /zira|samantha|karen|hazel|susan|victoria|jenny|aria/i.test(v.name));
  if (femaleVoice) return femaleVoice;

  // 2. Fallback: Default English voice
  const defaultEnglish = targetPool.find(v => v.default) || targetPool[0];
  if (defaultEnglish) return defaultEnglish;

  // 3. Fallback: Default voice in pool
  return targetPool.find(v => v.default) || targetPool[0] || null;
}
