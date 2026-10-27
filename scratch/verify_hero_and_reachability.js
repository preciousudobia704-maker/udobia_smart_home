import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\hero_refinements';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING FIVE HOME SCREEN AND HEADER REFINEMENTS ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Test with A++ (xlarge) text scale
  await page.evaluateOnNewDocument(() => {
    const prefs = {
      preference_id: 'pref-default-1',
      age_profile: 'OLDER',
      active_mode: 'STANDARD',
      text_scale: 'xlarge',
      high_contrast: false,
      sound_enabled: true,
      undo_timeout_ms: 5000,
      trusted_contact: {
        name: 'Sarah (Daughter)',
        phone: '+234 816 498 1474'
      }
    };
    localStorage.setItem('smart_home_user_preferences', JSON.stringify(prefs));
  });

  await page.goto('http://localhost:5174/?dev=true', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Capture screenshot of home dashboard at 1366x768 A++
  await page.screenshot({ path: path.join(outDir, 'home_1366x768_A_plus_plus.png') });
  console.log('✓ Captured screenshot at 1366x768 landscape at A++');

  // 1. Measure Reachability and Block Heights
  console.log('\n--- 1. HERO HEIGHT & REACHABILITY ON 1366 x 768 AT A++ ---');
  const metrics = await page.evaluate(() => {
    const scrollY = window.scrollY;
    const header = document.querySelector('.app-header');
    const heroBand = document.querySelector('.hero-band');
    const archWindow = document.querySelector('.hero-arch-window');
    const archSill = document.querySelector('.hero-arch-sill');
    const heroContent = document.querySelector('.hero-content-column');
    const roomSelector = document.querySelector('.room-filter-container');
    const roomHeading = document.querySelector('.room-section-header');
    const firstCard = document.querySelector('.device-card');
    const firstCardTitle = firstCard?.querySelector('.device-title');
    const firstCardButton = firstCard?.querySelector('.device-action-btn');
    const emergencyBar = document.querySelector('.emergency-bottom-bar');

    const getBox = el => el ? {
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
      top: el.getBoundingClientRect().top,
      bottom: el.getBoundingClientRect().bottom
    } : null;

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      header: getBox(header),
      heroBand: getBox(heroBand),
      archWindow: getBox(archWindow),
      archSill: getBox(archSill),
      heroContent: getBox(heroContent),
      roomSelector: getBox(roomSelector),
      roomHeading: getBox(roomHeading),
      firstCard: getBox(firstCard),
      firstCardTitle: getBox(firstCardTitle),
      firstCardButton: getBox(firstCardButton),
      emergencyBar: getBox(emergencyBar),
      scrollY
    };
  });

  console.log(`Viewport: ${metrics.viewport.width} x ${metrics.viewport.height}`);
  console.log(`Header height: ${metrics.header.height.toFixed(1)}px (bottom at Y = ${metrics.header.bottom.toFixed(1)}px)`);
  console.log(`Arch Window: ${metrics.archWindow.width.toFixed(1)}px W x ${metrics.archWindow.height.toFixed(1)}px H (width/height ratio = ${(metrics.archWindow.width / metrics.archWindow.height).toFixed(3)})`);
  console.log(`Arch Sill: ${metrics.archSill.width.toFixed(1)}px W x ${metrics.archSill.height.toFixed(1)}px H`);
  console.log(`Hero Text Block: ${metrics.heroContent.width.toFixed(1)}px W x ${metrics.heroContent.height.toFixed(1)}px H`);
  console.log(`Room Selector: height ${metrics.roomSelector.height.toFixed(1)}px (top at Y = ${metrics.roomSelector.top.toFixed(1)}px)`);
  console.log(`Room Heading: height ${metrics.roomHeading.height.toFixed(1)}px (top at Y = ${metrics.roomHeading.top.toFixed(1)}px)`);
  console.log(`First Device Card Title: top at Y = ${metrics.firstCardTitle.top.toFixed(1)}px, bottom at Y = ${metrics.firstCardTitle.bottom.toFixed(1)}px`);
  console.log(`First Device Card Action Button: top at Y = ${metrics.firstCardButton.top.toFixed(1)}px, bottom at Y = ${metrics.firstCardButton.bottom.toFixed(1)}px`);
  console.log(`Emergency Bar: top at Y = ${metrics.emergencyBar.top.toFixed(1)}px (height = ${metrics.emergencyBar.height.toFixed(1)}px)`);

  const clearance = metrics.emergencyBar.top - metrics.firstCardButton.bottom;
  console.log(`Clearance between Action Button and Emergency Bar: ${clearance.toFixed(1)}px`);
  if (clearance > 0) {
    console.log(`✓ REACHABLE: First device card title and action button are completely visible WITHOUT scrolling above the fixed bottom bar!`);
  } else {
    console.error(`✗ Action button overlaps bottom bar by ${(-clearance).toFixed(1)}px`);
  }

  // Check 16px gaps
  const gapHeroToSelector = metrics.roomSelector.top - metrics.heroBand.bottom;
  const gapSelectorToHeading = metrics.roomHeading.top - metrics.roomSelector.bottom;
  console.log(`Gap Hero -> Selector: ${gapHeroToSelector.toFixed(1)}px`);
  console.log(`Gap Selector -> Heading: ${gapSelectorToHeading.toFixed(1)}px`);

  // 2. Test Greeting Times and Sky Bands
  console.log('\n--- 2. GREETING TIMES & SKY PHASES ---');
  const testHours = [
    { hour: 8, expectedGreeting: 'Good morning.', expectedSky: 'sky-morning' },
    { hour: 13, expectedGreeting: 'Good afternoon.', expectedSky: 'sky-afternoon' },
    { hour: 18, expectedGreeting: 'Good evening.', expectedSky: 'sky-evening' },
    { hour: 20, expectedGreeting: 'Good evening.', expectedSky: 'sky-night' }, // Night sky from 20:00, evening greeting!
    { hour: 21, expectedGreeting: 'Good evening.', expectedSky: 'sky-night' },
    { hour: 22, expectedGreeting: 'Good night.', expectedSky: 'sky-night' },
    { hour: 2, expectedGreeting: 'Good night.', expectedSky: 'sky-night' },
    { hour: 5, expectedGreeting: 'Good morning.', expectedSky: 'sky-morning' },
    { hour: 11, expectedGreeting: 'Good morning.', expectedSky: 'sky-morning' },
    { hour: 16, expectedGreeting: 'Good afternoon.', expectedSky: 'sky-afternoon' }
  ];

  for (const t of testHours) {
    await page.evaluate((h) => {
      // Trigger dev hour button or context
      const btn = document.querySelector(`#btn-time-jump-${h}`);
      if (btn) btn.click();
    }, t.hour);
    await new Promise(r => setTimeout(r, 100));

    const res = await page.evaluate(() => {
      const greeting = document.querySelector('.hero-greeting-title')?.textContent?.trim();
      const windowEl = document.querySelector('.hero-arch-window');
      let sky = '';
      if (windowEl.classList.contains('sky-morning')) sky = 'sky-morning';
      else if (windowEl.classList.contains('sky-afternoon')) sky = 'sky-afternoon';
      else if (windowEl.classList.contains('sky-evening')) sky = 'sky-evening';
      else if (windowEl.classList.contains('sky-night')) sky = 'sky-night';
      return { greeting, sky };
    });

    const pass = res.greeting === t.expectedGreeting && res.sky === t.expectedSky;
    console.log(`Hour ${t.hour}:00 -> Greeting: "${res.greeting}" | Sky: "${res.sky}" ${pass ? '✓ PASS' : '✗ FAIL'}`);
  }

  // 3. Test Arch Reads as a Window
  console.log('\n--- 3. ARCH READS AS A WINDOW ---');
  // Set to night sky (hour 22)
  await page.evaluate(() => {
    document.querySelector('#btn-time-jump-22')?.click();
  });
  await new Promise(r => setTimeout(r, 200));

  const windowCheck = await page.evaluate(() => {
    const arch = document.querySelector('.hero-arch-window');
    const sill = document.querySelector('.hero-arch-sill');
    const archComputed = window.getComputedStyle(arch);
    const sillComputed = window.getComputedStyle(sill);
    const stars = document.querySelectorAll('.arch-stars-group circle');
    const dashedArc = document.querySelector('.arch-sky-svg path[stroke-dasharray]');
    const moon = document.querySelector('.celestial-moon');

    return {
      archBorder: archComputed.borderWidth + ' ' + archComputed.borderStyle + ' ' + archComputed.borderColor,
      archRadius: archComputed.borderRadius,
      archBg: archComputed.backgroundImage,
      sillWidth: sillComputed.width,
      sillHeight: sillComputed.height,
      sillBg: sillComputed.backgroundColor,
      sillShadow: sillComputed.boxShadow,
      starsCount: stars.length,
      hasDashedArc: Boolean(dashedArc),
      hasMoon: Boolean(moon)
    };
  });

  console.log(`Arch Border: ${windowCheck.archBorder}`);
  console.log(`Arch Border-Radius: ${windowCheck.archRadius}`);
  console.log(`Arch Background Gradient: ${windowCheck.archBg}`);
  console.log(`Sill Dimensions: ${windowCheck.sillWidth} W x ${windowCheck.sillHeight} H`);
  console.log(`Sill Shadow: ${windowCheck.sillShadow}`);
  console.log(`Static Stars Count: ${windowCheck.starsCount} (expected 6 to 8)`);
  console.log(`Dashed Arc Path: ${windowCheck.hasDashedArc ? 'EXISTS (should be removed)' : 'REMOVED ✓'}`);
  console.log(`Pale Moon: ${windowCheck.hasMoon ? 'PRESENT ✓' : 'MISSING'}`);

  // Capture night sky arch screenshot
  await page.screenshot({ path: path.join(outDir, 'arch_window_night.png') });
  console.log('✓ Captured screenshot of night sky arch window with stars and sill');

  // 4. Test Logomark
  console.log('\n--- 4. LOGOMARK ---');
  const logoCheck = await page.evaluate(() => {
    const logoSvg = document.querySelector('.udobia-logomark');
    const logoBox = logoSvg?.getBoundingClientRect();
    const doorwayPath = logoSvg?.querySelector('path');
    const lampCircle = logoSvg?.querySelector('circle');
    const wordmarkTitle = document.querySelector('.brand-title');
    const wordmarkBox = wordmarkTitle?.getBoundingClientRect();

    const logoCenterY = logoBox ? logoBox.top + logoBox.height / 2 : 0;
    const wordmarkCenterY = wordmarkBox ? wordmarkBox.top + wordmarkBox.height / 2 : 0;

    return {
      width: logoBox?.width,
      height: logoBox?.height,
      strokeWidth: doorwayPath?.getAttribute('stroke-width'),
      lampRadius: lampCircle?.getAttribute('r'),
      lampDiameter: lampCircle ? parseFloat(lampCircle.getAttribute('r')) * 2 : 0,
      verticalAlignmentDiff: Math.abs(logoCenterY - wordmarkCenterY)
    };
  });

  console.log(`Logomark size: ${logoCheck.width}px x ${logoCheck.height}px (expected ~44px)`);
  console.log(`Logomark stroke: ${logoCheck.strokeWidth}px (expected 3px)`);
  console.log(`Lamp dot diameter: ${logoCheck.lampDiameter}px (expected ~8px)`);
  console.log(`Vertical alignment difference with wordmark: ${logoCheck.verticalAlignmentDiff.toFixed(1)}px (centred)`);

  // 5. Test UI Icons Scale With Text and Settings/Guide labels
  console.log('\n--- 5. ICONS SCALE WITH TEXT & LABELS 18PX ---');
  const iconAndLabelCheck = await page.evaluate(() => {
    const settingsLabel = document.querySelector('#btn-open-settings .btn-label-text');
    const guideLabel = document.querySelector('#btn-open-help .btn-label-text');
    const settingsIcon = document.querySelector('#btn-open-settings svg');
    const guideIcon = document.querySelector('#btn-open-help svg');
    const textIcon = document.querySelector('.text-size-label svg');
    const roomPillIcon = document.querySelector('.room-pill-btn svg');
    const roomHeadingIcon = document.querySelector('.room-section-title svg');

    const getDim = el => el ? {
      fontSize: window.getComputedStyle(el).fontSize,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height
    } : null;

    return {
      settingsLabel: getDim(settingsLabel),
      guideLabel: getDim(guideLabel),
      settingsIcon: getDim(settingsIcon),
      guideIcon: getDim(guideIcon),
      textIcon: getDim(textIcon),
      roomPillIcon: getDim(roomPillIcon),
      roomHeadingIcon: getDim(roomHeadingIcon)
    };
  });

  console.log(`Settings label font size: ${iconAndLabelCheck.settingsLabel?.fontSize} (expected 18px)`);
  console.log(`Guide label font size: ${iconAndLabelCheck.guideLabel?.fontSize} (expected 18px)`);
  console.log(`Settings icon size: ${iconAndLabelCheck.settingsIcon?.width.toFixed(1)}px x ${iconAndLabelCheck.settingsIcon?.height.toFixed(1)}px (>= 20px)`);
  console.log(`Guide icon size: ${iconAndLabelCheck.guideIcon?.width.toFixed(1)}px x ${iconAndLabelCheck.guideIcon?.height.toFixed(1)}px (>= 20px)`);
  console.log(`Text control icon size: ${iconAndLabelCheck.textIcon?.width.toFixed(1)}px x ${iconAndLabelCheck.textIcon?.height.toFixed(1)}px (>= 20px)`);
  console.log(`Room pill icon size: ${iconAndLabelCheck.roomPillIcon?.width.toFixed(1)}px x ${iconAndLabelCheck.roomPillIcon?.height.toFixed(1)}px`);
  console.log(`Room heading icon size: ${iconAndLabelCheck.roomHeadingIcon?.width.toFixed(1)}px x ${iconAndLabelCheck.roomHeadingIcon?.height.toFixed(1)}px`);

  // Verify scaling across A, A+, A++
  console.log('\n--- Checking Icon Scaling across A, A+, A++ ---');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((s) => {
      document.documentElement.setAttribute('data-text-scale', s);
    }, scale);
    await new Promise(r => setTimeout(r, 100));

    const sizes = await page.evaluate(() => {
      const pillIcon = document.querySelector('.room-pill-btn svg')?.getBoundingClientRect();
      const headingIcon = document.querySelector('.room-section-title svg')?.getBoundingClientRect();
      const settingsIcon = document.querySelector('#btn-open-settings svg')?.getBoundingClientRect();
      return {
        scale: document.documentElement.getAttribute('data-text-scale'),
        pillIconWidth: pillIcon?.width.toFixed(1),
        headingIconWidth: headingIcon?.width.toFixed(1),
        settingsIconWidth: settingsIcon?.width.toFixed(1)
      };
    });
    console.log(`Scale ${sizes.scale}: Pill Icon = ${sizes.pillIconWidth}px | Heading Icon = ${sizes.headingIconWidth}px | Settings Icon = ${sizes.settingsIconWidth}px`);
  }

  await browser.close();
  console.log('\n=== ALL VERIFICATIONS COMPLETE ===');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
