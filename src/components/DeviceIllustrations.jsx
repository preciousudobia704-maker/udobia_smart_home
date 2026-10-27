import React from 'react';

/**
 * Custom Logomark: Arched doorway with a small round hanging lamp inside.
 * Heavy 3px rounded stroke with one accent fill.
 */
export function UdobiaLogo({ size = 44, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 44 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`udobia-logomark ${className}`}
      aria-hidden="true"
    >
      {/* Doorway Frame with Arch Top in Teal - 3px stroke */}
      <path 
        d="M9 40V18C9 10.82 14.82 5 22 5C29.18 5 35 10.82 35 18V40" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Ground Threshold - 3px stroke */}
      <path 
        d="M5 40H39" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      {/* Hanging Cord */}
      <path 
        d="M22 5V13" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      {/* Small Round Lamp with Warm Accent Fill - lamp dot about 8px (r=4) */}
      <circle 
        cx="22" 
        cy="18" 
        r="4" 
        fill="#F5B83D" 
        stroke="currentColor" 
        strokeWidth="2.5" 
      />
      {/* Subtle Lamp Radiant Glow Rings */}
      <path 
        d="M17 18C17 15.24 19.24 13 22 13" 
        stroke="#F5B83D" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.8" 
      />
    </svg>
  );
}

/**
 * Custom Bulb Illustration: Heavy 3px rounded stroke with soft glow on active.
 */
export function BulbIllustration({ isOn, isBanner = false, size = 68, className = '' }) {
  if (isBanner) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`device-illustration illustration-bulb ${className}`}
        aria-hidden="true"
      >
        {/* Glass Bulb Contour - White stroke with Amber fill, no circle behind it */}
        <path 
          d="M23 33C23 23.6 28.8 16 36 16C43.2 16 49 23.6 49 33C49 38.6 46 43.5 43.5 46.5C42.8 47.4 42.5 48.5 42.5 49.6V52.5C42.5 53.6 41.6 54.5 40.5 54.5H31.5C30.4 54.5 29.5 53.6 29.5 52.5V49.6C29.5 48.5 29.2 47.4 28.5 46.5C26 43.5 23 38.6 23 33Z" 
          fill="#F5B83D" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Internal Filament */}
        <path 
          d="M32 37V30C32 27.8 33.8 26 36 26C38.2 26 40 27.8 40 30V37" 
          stroke="#FFFFFF" 
          strokeWidth="2.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Threaded Base Rings */}
        <path 
          d="M30.5 58H41.5" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <path 
          d="M33 62H39" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`device-illustration illustration-bulb ${isOn ? 'bulb-glow' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* Warm Ambient Glow Aura Behind Bulb (Active state only) */}
      {isOn && (
        <circle 
          cx="36" 
          cy="31" 
          r="26" 
          fill="#FFF1CF" 
          className="bulb-aura" 
        />
      )}

      {/* Glass Bulb Contour */}
      <path 
        d="M23 33C23 23.6 28.8 16 36 16C43.2 16 49 23.6 49 33C49 38.6 46 43.5 43.5 46.5C42.8 47.4 42.5 48.5 42.5 49.6V52.5C42.5 53.6 41.6 54.5 40.5 54.5H31.5C30.4 54.5 29.5 53.6 29.5 52.5V49.6C29.5 48.5 29.2 47.4 28.5 46.5C26 43.5 23 38.6 23 33Z" 
        fill={isOn ? '#F5B83D' : '#FFFFFF'} 
        stroke="#172640" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Internal Filament */}
      <path 
        d="M32 37V30C32 27.8 33.8 26 36 26C38.2 26 40 27.8 40 30V37" 
        stroke={isOn ? '#172640' : '#8A99AD'} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Threaded Base Rings */}
      <path 
        d="M30.5 58H41.5" 
        stroke="#172640" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      <path 
        d="M33 62H39" 
        stroke="#172640" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

/**
 * Custom Fan Illustration: Rotating blade group when on.
 */
export function FanIllustration({ isOn, isBanner = false, size = 68, className = '' }) {
  if (isBanner) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`device-illustration illustration-fan ${className}`}
        aria-hidden="true"
      >
        {/* Outer Protective Guard Ring - white stroke, no fill (no background circle) */}
        <circle 
          cx="36" 
          cy="36" 
          r="28" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
          fill="none" 
        />

        {/* Rotating Blades Group - Amber fill, white stroke */}
        <g style={{ transformOrigin: '36px 36px' }}>
          {/* Blade Top */}
          <path 
            d="M36 36C33 26 31 16 38 13C42 16 40 26 36 36Z" 
            fill="#F5B83D" 
            stroke="#FFFFFF" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />
          {/* Blade Right */}
          <path 
            d="M36 36C46 33 56 31 59 38C56 42 46 40 36 36Z" 
            fill="#F5B83D" 
            stroke="#FFFFFF" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />
          {/* Blade Bottom */}
          <path 
            d="M36 36C39 46 41 56 34 59C30 56 32 46 36 36Z" 
            fill="#F5B83D" 
            stroke="#FFFFFF" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />
          {/* Blade Left */}
          <path 
            d="M36 36C26 39 16 41 13 34C16 30 26 32 36 36Z" 
            fill="#F5B83D" 
            stroke="#FFFFFF" 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
          />
          {/* Center Hub */}
          <circle 
            cx="36" 
            cy="36" 
            r="6" 
            fill="#FFFFFF" 
          />
        </g>
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`device-illustration illustration-fan ${className}`}
      aria-hidden="true"
    >
      {/* Outer Protective Guard Ring */}
      <circle 
        cx="36" 
        cy="36" 
        r="28" 
        stroke="#172640" 
        strokeWidth="3.2" 
        fill={isOn ? '#FFF1CF' : '#FFFFFF'} 
      />

      {/* Rotating Blades Group */}
      <g className={`fan-rotor ${isOn ? 'is-spinning' : ''}`} style={{ transformOrigin: '36px 36px' }}>
        {/* Blade Top */}
        <path 
          d="M36 36C33 26 31 16 38 13C42 16 40 26 36 36Z" 
          fill={isOn ? '#F5B83D' : '#C7D8D4'} 
          stroke="#172640" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Blade Right */}
        <path 
          d="M36 36C46 33 56 31 59 38C56 42 46 40 36 36Z" 
          fill={isOn ? '#F5B83D' : '#C7D8D4'} 
          stroke="#172640" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Blade Bottom */}
        <path 
          d="M36 36C39 46 41 56 34 59C30 56 32 46 36 36Z" 
          fill={isOn ? '#F5B83D' : '#C7D8D4'} 
          stroke="#172640" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Blade Left */}
        <path 
          d="M36 36C26 39 16 41 13 34C16 30 26 32 36 36Z" 
          fill={isOn ? '#F5B83D' : '#C7D8D4'} 
          stroke="#172640" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Center Hub */}
        <circle 
          cx="36" 
          cy="36" 
          r="6" 
          fill="#172640" 
        />
      </g>
    </svg>
  );
}

/**
 * Custom Air Conditioner Illustration: Clean horizontal body with louvers and airflow.
 */
export function AcIllustration({ isOn, isBanner = false, size = 68, className = '' }) {
  if (isBanner) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`device-illustration illustration-ac ${className}`}
        aria-hidden="true"
      >
        {/* AC Main Unit Body - White stroke, transparent fill, no lamp tint */}
        <rect 
          x="12" 
          y="20" 
          width="48" 
          height="26" 
          rx="6" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
        />

        {/* Front Panel Horizon Line */}
        <line 
          x1="12" 
          y1="34" 
          x2="60" 
          y2="34" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
        />

        {/* Status LED in amber */}
        <circle 
          cx="51" 
          cy="27" 
          r="2.5" 
          fill="#F5B83D" 
        />

        {/* Air Vent Louver Bar in amber with white stroke */}
        <rect 
          x="16" 
          y="38" 
          width="40" 
          height="5" 
          rx="2.5" 
          fill="#F5B83D" 
          stroke="#FFFFFF" 
          strokeWidth="1.8" 
        />

        {/* Downward Cooling Airflow Waves in amber */}
        <g stroke="#F5B83D" strokeWidth="2.8" strokeLinecap="round" opacity="0.95">
          <path d="M22 51C22 55 24 57 26 59" />
          <path d="M34 51C34 56 36 58 38 61" />
          <path d="M46 51C46 55 48 57 50 59" />
        </g>
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`device-illustration illustration-ac ${className}`}
      aria-hidden="true"
    >
      {/* AC Main Unit Body */}
      <rect 
        x="12" 
        y="20" 
        width="48" 
        height="26" 
        rx="6" 
        fill={isOn ? '#FFF1CF' : '#FFFFFF'} 
        stroke="#172640" 
        strokeWidth="3.2" 
      />

      {/* Front Panel Horizon Line */}
      <line 
        x1="12" 
        y1="34" 
        x2="60" 
        y2="34" 
        stroke="#172640" 
        strokeWidth="2.5" 
      />

      {/* Status LED / Display Pill */}
      <circle 
        cx="51" 
        cy="27" 
        r="2.5" 
        fill={isOn ? '#F5B83D' : '#A3B4C8'} 
      />

      {/* Air Vent Louver Bar */}
      <rect 
        x="16" 
        y="38" 
        width="40" 
        height="5" 
        rx="2.5" 
        fill={isOn ? '#F5B83D' : '#C7D8D4'} 
        stroke="#172640" 
        strokeWidth="1.8" 
      />

      {/* Downward Cooling Airflow Waves (When on) */}
      {isOn && (
        <g stroke="#F5B83D" strokeWidth="2.8" strokeLinecap="round" opacity="0.95">
          <path d="M22 51C22 55 24 57 26 59" />
          <path d="M34 51C34 56 36 58 38 61" />
          <path d="M46 51C46 55 48 57 50 59" />
        </g>
      )}
    </svg>
  );
}

/**
 * Custom Padlock Illustration: Animated shackle that visibly opens or closes over 300ms.
 * Locked: closed padlock, shackle down, teal accent fill (#0F766E).
 * Unlocked: open padlock, shackle raised and swung open, Ink strokes with no accent fill.
 */
export function PadlockIllustration({ isLocked, isBanner = false, size = 68, className = '' }) {
  if (isBanner) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`device-illustration illustration-padlock ${className}`}
        aria-hidden="true"
      >
        {/* Shackle in White stroke */}
        <g>
          <path 
            d="M25 35V23C25 16.9 29.9 12 36 12C42.1 12 47 16.9 47 23V35" 
            stroke="#FFFFFF" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </g>

        {/* Padlock Body in Amber with White stroke */}
        <rect 
          x="18" 
          y="33" 
          width="36" 
          height="28" 
          rx="8" 
          fill="#F5B83D" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
        />

        {/* Keyhole Circle & Slot */}
        <circle 
          cx="36" 
          cy="45" 
          r="4" 
          fill="#172640" 
        />
        <path 
          d="M34.5 47L33.5 53H38.5L37.5 47H34.5Z" 
          fill="#172640" 
        />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`device-illustration illustration-padlock ${isLocked ? 'is-locked' : 'is-unlocked'} ${className}`}
      aria-hidden="true"
    >
      {/* Shackle: Moves up and swings open when unlocked over 300ms */}
      <g 
        className="padlock-shackle"
        style={{
          transformBox: 'view-box',
          transformOrigin: '25px 28px',
          transform: isLocked ? 'none' : 'translateY(-8px) rotate(-32deg)',
          transition: 'transform 300ms cubic-bezier(0.34, 1.25, 0.64, 1)'
        }}
      >
        <path 
          d="M25 35V23C25 16.9 29.9 12 36 12C42.1 12 47 16.9 47 23V35" 
          stroke="#172640" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* Sturdy Padlock Body: Teal fill when locked, white/paper when unlocked with Ink stroke */}
      <rect 
        x="18" 
        y="33" 
        width="36" 
        height="28" 
        rx="8" 
        fill={isLocked ? '#0F766E' : '#FFFFFF'} 
        stroke="#172640" 
        strokeWidth="3.2" 
        style={{ transition: 'fill 300ms ease' }}
      />

      {/* Keyhole Circle & Slot */}
      <circle 
        cx="36" 
        cy="45" 
        r="4" 
        fill={isLocked ? '#FFFFFF' : '#172640'} 
        style={{ transition: 'fill 300ms ease' }}
      />
      <path 
        d="M34.5 47L33.5 53H38.5L37.5 47H34.5Z" 
        fill={isLocked ? '#FFFFFF' : '#172640'} 
        style={{ transition: 'fill 300ms ease' }}
      />
    </svg>
  );
}

/**
 * Custom Plug / TV Illustration: Heavy 3px stroke with clean grounding prongs.
 */
export function PlugIllustration({ isOn, isBanner = false, size = 68, className = '' }) {
  if (isBanner) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`device-illustration illustration-plug ${className}`}
        aria-hidden="true"
      >
        {/* Wall Plate Background - white stroke, no fill */}
        <rect 
          x="14" 
          y="14" 
          width="44" 
          height="44" 
          rx="12" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
        />

        {/* Center Socket Face Disc in Amber fill with White stroke */}
        <circle 
          cx="36" 
          cy="36" 
          r="15" 
          fill="#F5B83D" 
          stroke="#FFFFFF" 
          strokeWidth="2.6" 
        />

        {/* Dual Socket Receptors in white */}
        <line 
          x1="31" 
          y1="30" 
          x2="31" 
          y2="40" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <line 
          x1="41" 
          y1="30" 
          x2="41" 
          y2="40" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />

        {/* Grounding Aperture */}
        <circle 
          cx="36" 
          cy="45" 
          r="2.5" 
          fill="#FFFFFF" 
        />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`device-illustration illustration-plug ${className}`}
      aria-hidden="true"
    >
      {/* Wall Plate Background */}
      <rect 
        x="14" 
        y="14" 
        width="44" 
        height="44" 
        rx="12" 
        fill={isOn ? '#FFF1CF' : '#FFFFFF'} 
        stroke="#172640" 
        strokeWidth="3.2" 
      />

      {/* Center Socket Face Disc */}
      <circle 
        cx="36" 
        cy="36" 
        r="15" 
        fill={isOn ? '#F5B83D' : '#F1F5F9'} 
        stroke="#172640" 
        strokeWidth="2.6" 
      />

      {/* Dual Socket Receptors */}
      <line 
        x1="31" 
        y1="30" 
        x2="31" 
        y2="40" 
        stroke="#172640" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <line 
        x1="41" 
        y1="30" 
        x2="41" 
        y2="40" 
        stroke="#172640" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Grounding Aperture */}
      <circle 
        cx="36" 
        cy="45" 
        r="2.5" 
        fill="#172640" 
      />
    </svg>
  );
}
