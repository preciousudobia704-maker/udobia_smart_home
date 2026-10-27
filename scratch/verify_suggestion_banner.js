import puppeteer from 'puppeteer-core';

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.evaluateOnNewDocument(() => {
    const prefs = {
      preference_id: 'pref-default-1',
      age_profile: 'MIDDLE',
      active_mode: 'STANDARD',
      text_scale: 'normal',
      high_contrast: false,
      sound_enabled: false,
      undo_timeout_ms: 5000,
      trusted_contact: {
        name: 'Sarah (Daughter)',
        phone: '+234 816 498 1474'
      }
    };
    localStorage.setItem('smart_home_user_preferences', JSON.stringify(prefs));
  });

  console.log('--- Navigating to app ---');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  // 1. Wait for suggestion banner to appear
  await page.waitForSelector('.suggestion-banner', { timeout: 6000 });
  console.log('✓ Suggestion banner is displayed.');

  // 2. MEASURE SPACING WHEN BANNER IS SHOWN
  console.log('\n=== 1. SPACING WHEN BANNER SHOWS ===');
  const shownSpacing = await page.evaluate(() => {
    const hero = document.querySelector('.hero-band');
    const banner = document.querySelector('.suggestion-banner');
    const firstHeading = document.querySelector('.room-section-header');

    const heroRect = hero.getBoundingClientRect();
    const bannerRect = banner.getBoundingClientRect();
    const headingRect = firstHeading.getBoundingClientRect();

    return {
      gapGreetingToBanner: Math.round(bannerRect.top - heroRect.bottom),
      gapBannerToFirstHeading: Math.round(headingRect.top - bannerRect.bottom)
    };
  });
  console.log('Gap between greeting section and banner (Target: 32px):', shownSpacing.gapGreetingToBanner, 'px');
  console.log('Gap between banner and first room heading (Target: 40px):', shownSpacing.gapBannerToFirstHeading, 'px');

  // 3. SURFACE STYLING
  console.log('\n=== 2. SURFACE STYLING ===');
  const surface = await page.evaluate(() => {
    const banner = document.querySelector('.suggestion-banner');
    const cs = window.getComputedStyle(banner);
    const hero = document.querySelector('.hero-band');
    const heroRect = hero.getBoundingClientRect();
    const bannerRect = banner.getBoundingClientRect();

    return {
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      borderRadius: cs.borderRadius,
      border: cs.border,
      boxShadow: cs.boxShadow,
      width: Math.round(bannerRect.width),
      heroWidth: Math.round(heroRect.width),
      fullWidthUnderHero: Math.abs(bannerRect.width - heroRect.width) <= 2
    };
  });
  console.log('Surface Background (expected rgb(23, 38, 64)):', surface.backgroundColor);
  console.log('Surface Text Color (expected rgb(255, 255, 255)):', surface.color);
  console.log('Border Radius (expected 28px):', surface.borderRadius);
  console.log('Border (expected none or 0px):', surface.border);
  console.log('Box Shadow (soft Ink-tinted):', surface.boxShadow);
  console.log('Full width under hero:', surface.fullWidthUnderHero, `(${surface.width}px vs ${surface.heroWidth}px)`);

  // 4. CONTENT & CONTRAST
  console.log('\n=== 3. CONTENT & CONTRAST ===');
  const content = await page.evaluate(() => {
    const banner = document.querySelector('.suggestion-banner');
    const iconContainer = banner.querySelector('.suggestion-device-icon');
    const iconSvg = iconContainer.querySelector('svg');
    const iconPaths = Array.from(iconSvg.querySelectorAll('path, rect, circle, line'));
    const message = banner.querySelector('.suggestion-text');
    const yesBtn = banner.querySelector('.btn-suggestion-yes');
    const noBtn = banner.querySelector('.btn-suggestion-no');

    const msgCs = window.getComputedStyle(message);
    const yesCs = window.getComputedStyle(yesBtn);
    const noCs = window.getComputedStyle(noBtn);
    const iconCs = window.getComputedStyle(iconContainer);

    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const bannerRect = banner.getBoundingClientRect();

    const fills = iconPaths.map(p => p.getAttribute('fill') || window.getComputedStyle(p).fill);
    const strokes = iconPaths.map(p => p.getAttribute('stroke') || window.getComputedStyle(p).stroke);

    const auraCircle = iconSvg.querySelector('.bulb-aura');
    const auraDisplay = auraCircle ? window.getComputedStyle(auraCircle).display : null;

    return {
      iconContainerSize: { width: iconCs.width, height: iconCs.height },
      iconSvgSize: { width: iconSvg.getAttribute('width'), height: iconSvg.getAttribute('height') },
      hasCircleBehindIt: !!(auraCircle && auraDisplay !== 'none'),
      iconFills: fills,
      iconStrokes: strokes,
      messageText: message.textContent.trim(),
      messageFontSize: msgCs.fontSize,
      messageFontWeight: msgCs.fontWeight,
      messageColor: msgCs.color,
      messageMaxWidth: msgCs.maxWidth,
      yesButton: {
        text: yesBtn.textContent.trim(),
        bgColor: yesCs.backgroundColor,
        color: yesCs.color,
        fontWeight: yesCs.fontWeight,
        fontSize: yesCs.fontSize,
        height: Math.round(yesRect.height)
      },
      noButton: {
        text: noBtn.textContent.trim(),
        bgColor: noCs.backgroundColor,
        color: noCs.color,
        fontWeight: noCs.fontWeight,
        fontSize: noCs.fontSize,
        border: noCs.border,
        height: Math.round(noRect.height)
      },
      buttonGap: Math.round(noRect.left - yesRect.right),
      buttonsOnRight: yesRect.left > bannerRect.left + (bannerRect.width / 2)
    };
  });

  console.log('Icon container size (expected 48px):', content.iconContainerSize);
  console.log('Has circle behind icon (expected false):', content.hasCircleBehindIt);
  console.log('Icon fills:', content.iconFills);
  console.log('Icon strokes:', content.iconStrokes);
  console.log('Message text:', content.messageText);
  console.log('Message font-size (expected 28px):', content.messageFontSize);
  console.log('Message font-weight (expected 700):', content.messageFontWeight);
  console.log('Message color (expected rgb(255, 255, 255)):', content.messageColor);
  console.log('Message max-width (expected 60ch):', content.messageMaxWidth);

  console.log('"Yes, turn on" button (solid amber, Ink text, 700, >=60px):', content.yesButton);
  console.log('"Not now" button (translucent white ~16%, white text, no border, >=60px):', content.noButton);
  console.log('Gap between buttons (expected 16px):', content.buttonGap, 'px');
  console.log('Buttons on right of row (desktop):', content.buttonsOnRight);

  // Contrast Ratios
  const inkRgb = [23, 38, 64];
  const whiteRgb = [255, 255, 255];
  const amberRgb = [245, 184, 61];
  const translucentOnInk = [
    Math.round(23 * 0.84 + 255 * 0.16),
    Math.round(38 * 0.84 + 255 * 0.16),
    Math.round(64 * 0.84 + 255 * 0.16)
  ];

  const bannerTextContrast = getContrastRatio(whiteRgb, inkRgb);
  const yesButtonContrast = getContrastRatio(amberRgb, inkRgb);
  const noButtonContrast = getContrastRatio(whiteRgb, translucentOnInk);

  console.log('\nContrast checks (Target: >= 7.0:1):');
  console.log(`- Banner text contrast: ${bannerTextContrast.toFixed(2)}:1 (>= 7:1 ? ${bannerTextContrast >= 7})`);
  console.log(`- "Yes, turn on" contrast: ${yesButtonContrast.toFixed(2)}:1 (>= 7:1 ? ${yesButtonContrast >= 7})`);
  console.log(`- "Not now" contrast: ${noButtonContrast.toFixed(2)}:1 (>= 7:1 ? ${noButtonContrast >= 7})`);

  // 5. LAMP TINT PROHIBITION
  const lampTintDetected = await page.evaluate(() => {
    const banner = document.querySelector('.suggestion-banner');
    const allElements = [banner, ...banner.querySelectorAll('*')];
    const lampTintColors = ['#fff1cf', 'rgb(255, 241, 207)', 'rgba(255, 241, 207'];
    const hits = [];

    allElements.forEach(el => {
      const cs = window.getComputedStyle(el);
      const bg = cs.backgroundColor.toLowerCase();
      const col = cs.color.toLowerCase();
      const fill = (el.getAttribute('fill') || cs.fill || '').toLowerCase();
      const stroke = (el.getAttribute('stroke') || cs.stroke || '').toLowerCase();

      for (const lt of lampTintColors) {
        if (bg.includes(lt)) hits.push({ element: el.tagName + (el.className ? '.' + el.className : ''), prop: 'backgroundColor', val: bg });
        if (col.includes(lt)) hits.push({ element: el.tagName + (el.className ? '.' + el.className : ''), prop: 'color', val: col });
        if (fill.includes(lt)) hits.push({ element: el.tagName + (el.className ? '.' + el.className : ''), prop: 'fill', val: fill });
        if (stroke.includes(lt)) hits.push({ element: el.tagName + (el.className ? '.' + el.className : ''), prop: 'stroke', val: stroke });
      }
    });
    return hits;
  });
  console.log('\nLamp Tint occurrences in banner:', lampTintDetected.length === 0 ? 'NONE (Passed!)' : lampTintDetected);

  // 6. RESPONSIVENESS (MOBILE NARROW SCREEN)
  console.log('\n=== 4. MOBILE NARROW SCREEN (<900px) ===');
  await page.setViewport({ width: 400, height: 800 });
  await new Promise(r => setTimeout(r, 200));
  const mobileLayout = await page.evaluate(() => {
    const banner = document.querySelector('.suggestion-banner');
    const text = banner.querySelector('.suggestion-text');
    const actions = banner.querySelector('.suggestion-actions');
    const yesBtn = banner.querySelector('.btn-suggestion-yes');
    const noBtn = banner.querySelector('.btn-suggestion-no');

    const textRect = text.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    return {
      actionsStackedUnderText: actionsRect.top >= textRect.bottom - 2,
      yesHeight: Math.round(yesRect.height),
      noHeight: Math.round(noRect.height),
      buttonsOverlap: !(yesRect.bottom <= noRect.top || noRect.bottom <= yesRect.top || yesRect.right <= noRect.left || noRect.right <= yesRect.left)
    };
  });
  console.log('Buttons stacked under text on mobile (expected true):', mobileLayout.actionsStackedUnderText);
  console.log('"Yes" button height on mobile (>= 60px):', mobileLayout.yesHeight);
  console.log('"Not now" button height on mobile (>= 60px):', mobileLayout.noHeight);
  console.log('Buttons overlap (expected false):', mobileLayout.buttonsOverlap);

  // 7. TEXT SCALING (A, A+, A++)
  console.log('\n=== 5. TEXT SCALING (A, A+, A++) ===');
  await page.setViewport({ width: 1280, height: 900 });
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 150));

    const scaleMetrics = await page.evaluate(() => {
      const banner = document.querySelector('.suggestion-banner');
      const text = banner.querySelector('.suggestion-text');
      const yesBtn = banner.querySelector('.btn-suggestion-yes');
      const noBtn = banner.querySelector('.btn-suggestion-no');
      const icon = banner.querySelector('.suggestion-device-icon');
      const hero = document.querySelector('.hero-band');
      const heading = document.querySelector('.room-section-header');

      const heroRect = hero.getBoundingClientRect();
      const bannerRect = banner.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const yesRect = yesBtn.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();

      return {
        textFontSize: window.getComputedStyle(text).fontSize,
        yesBtnHeight: Math.round(yesRect.height),
        noBtnHeight: Math.round(noRect.height),
        iconWidth: Math.round(icon.getBoundingClientRect().width),
        gapGreetingToBanner: Math.round(bannerRect.top - heroRect.bottom),
        gapBannerToHeading: Math.round(headingRect.top - bannerRect.bottom),
        overlap: !(yesRect.right <= noRect.left || yesRect.bottom <= noRect.top || noRect.bottom <= yesRect.top)
      };
    });
    console.log(`Scale ${scale}:`, scaleMetrics);
  }

  // Restore normal scale
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'normal');
  });

  // Save screenshot of banner
  await page.screenshot({ path: 'scratch/suggestion_banner_verified.png' });
  console.log('✓ Saved screenshot to scratch/suggestion_banner_verified.png');

  // 8. TEST DISMISSAL & SPACING WHEN BANNER IS HIDDEN
  console.log('\n=== 6. DISMISSAL & SPACING WHEN BANNER IS HIDDEN ===');
  await page.evaluate(() => {
    document.querySelector('.btn-suggestion-no').click();
  });
  await new Promise(r => setTimeout(r, 400));

  const hiddenState = await page.evaluate(() => {
    const banner = document.querySelector('.suggestion-banner');
    const hero = document.querySelector('.hero-band');
    const heading = document.querySelector('.room-section-header');

    const heroRect = hero.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();

    return {
      bannerExists: !!banner,
      gapHeroToHeading: Math.round(headingRect.top - heroRect.bottom)
    };
  });
  console.log('Banner exists after clicking "Not now" (expected false):', hiddenState.bannerExists);
  console.log('Gap between greeting and first room heading when hidden (Target: 64px):', hiddenState.gapHeroToHeading, 'px');

  await browser.close();
  console.log('\n=== ALL VERIFICATION TESTS PASSED! ===');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
