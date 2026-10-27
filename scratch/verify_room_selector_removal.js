import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\room_selector_removal';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING ROOM SELECTOR REMOVAL AND REACHABILITY ON 1366 x 768 AT A++ ===\n');

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
  const screenshotPath = path.join(outDir, 'home_1366x768_A_plus_plus_no_room_selector.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`✓ Captured screenshot at 1366x768 landscape at A++: ${screenshotPath}`);

  // 1. Measure Elements and Check Selector Removal
  const checkResults = await page.evaluate(() => {
    const roomSelector = document.querySelector('.room-filter-container');
    const roomPills = document.querySelectorAll('.room-pill-btn');
    const roomTrack = document.querySelector('.room-segmented-track');

    const header = document.querySelector('.app-header');
    const heroBand = document.querySelector('.hero-band');
    const archSill = document.querySelector('.hero-arch-sill');
    const firstRoomHeading = document.querySelector('.room-section-header');
    const firstCard = document.querySelector('.device-card');
    const firstCardTitle = firstCard?.querySelector('.device-title');
    const firstCardButton = firstCard?.querySelector('.device-action-btn');
    const emergencyBar = document.querySelector('.emergency-bottom-bar');

    const heroRect = heroBand?.getBoundingClientRect();
    const sillRect = archSill?.getBoundingClientRect();
    const headingRect = firstRoomHeading?.getBoundingClientRect();
    const cardRect = firstCard?.getBoundingClientRect();
    const titleRect = firstCardTitle?.getBoundingClientRect();
    const buttonRect = firstCardButton?.getBoundingClientRect();
    const emergencyRect = emergencyBar?.getBoundingClientRect();

    // Spacing between bottom of window sill/shadow and first room heading
    const spaceSillToHeading = headingRect ? (headingRect.top - sillRect.bottom) : null;
    const spaceHeadingToCard = (cardRect && headingRect) ? (cardRect.top - headingRect.bottom) : null;

    // Visibility above emergency bar
    const emergencyBarTop = emergencyRect ? emergencyRect.top : 768;
    const isTitleVisibleWithoutScrolling = titleRect ? (titleRect.bottom <= emergencyBarTop && titleRect.top >= 0) : false;
    const isButtonVisibleWithoutScrolling = buttonRect ? (buttonRect.bottom <= emergencyBarTop && buttonRect.top >= 0) : false;
    const isCardFullyVisibleWithoutScrolling = cardRect ? (cardRect.bottom <= emergencyBarTop) : false;

    // Room sections list
    const roomSections = Array.from(document.querySelectorAll('.room-group-section')).map(sec => {
      const title = sec.querySelector('.room-section-title')?.textContent?.trim();
      const count = sec.querySelectorAll('.device-card').length;
      return { title, count };
    });

    return {
      roomSelectorExists: Boolean(roomSelector || roomPills.length > 0 || roomTrack),
      spaceSillToHeading: Math.round(spaceSillToHeading),
      spaceHeadingToCard: Math.round(spaceHeadingToCard),
      sillRect: sillRect ? { top: Math.round(sillRect.top), bottom: Math.round(sillRect.bottom), height: Math.round(sillRect.height) } : null,
      headingRect: headingRect ? { top: Math.round(headingRect.top), bottom: Math.round(headingRect.bottom), height: Math.round(headingRect.height) } : null,
      cardRect: cardRect ? { top: Math.round(cardRect.top), bottom: Math.round(cardRect.bottom), height: Math.round(cardRect.height) } : null,
      titleRect: titleRect ? { top: Math.round(titleRect.top), bottom: Math.round(titleRect.bottom) } : null,
      buttonRect: buttonRect ? { top: Math.round(buttonRect.top), bottom: Math.round(buttonRect.bottom) } : null,
      emergencyBarTop: Math.round(emergencyBarTop),
      isTitleVisibleWithoutScrolling,
      isButtonVisibleWithoutScrolling,
      isCardFullyVisibleWithoutScrolling,
      roomSections
    };
  });

  console.log('\n--- 1. SELECTOR REMOVAL CHECK ---');
  console.log(`Room selector in DOM: ${checkResults.roomSelectorExists ? 'FAILED - Still present' : 'PASSED - Completely removed'}`);

  console.log('\n--- 2. ROOM SECTIONS ORDER ---');
  checkResults.roomSections.forEach((r, idx) => {
    console.log(`Room ${idx + 1}: "${r.title}" (${r.count} device cards)`);
  });

  console.log('\n--- 3. SPACING METRICS AT A++ (20px base) ---');
  console.log(`Measured space from sill bottom to first room heading: ${checkResults.spaceSillToHeading}px (target: 72px)`);
  console.log(`Measured space from first room heading to card: ${checkResults.spaceHeadingToCard}px (target: 12px)`);

  console.log('\n--- 4. REACHABILITY / VISIBILITY AT A++ ON 1366 x 768 ---');
  console.log(`Emergency bar top: ${checkResults.emergencyBarTop}px`);
  console.log(`First card title top/bottom: ${checkResults.titleRect?.top}px / ${checkResults.titleRect?.bottom}px`);
  console.log(`First card action button top/bottom: ${checkResults.buttonRect?.top}px / ${checkResults.buttonRect?.bottom}px`);
  console.log(`First card bottom: ${checkResults.cardRect?.bottom}px`);
  console.log(`First card title visible without scrolling: ${checkResults.isTitleVisibleWithoutScrolling}`);
  console.log(`First card action button visible without scrolling: ${checkResults.isButtonVisibleWithoutScrolling}`);
  console.log(`First card entirely visible above emergency bar: ${checkResults.isCardFullyVisibleWithoutScrolling}`);

  // Test at text size A (normal)
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'normal');
    document.body.setAttribute('data-text-scale', 'normal');
  });
  await new Promise(r => setTimeout(r, 200));
  const spacingA = await page.evaluate(() => {
    const sill = document.querySelector('.hero-arch-sill')?.getBoundingClientRect();
    const heading = document.querySelector('.room-section-header')?.getBoundingClientRect();
    return Math.round(heading.top - sill.bottom);
  });
  console.log(`\n--- 5. SPACING AT TEXT SIZE A (16px base) ---`);
  console.log(`Measured space from sill bottom to first room heading at A: ${spacingA}px (target: 64px)`);

  // Test at text size A+ (large)
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'large');
    document.body.setAttribute('data-text-scale', 'large');
  });
  await new Promise(r => setTimeout(r, 200));
  const spacingAPlus = await page.evaluate(() => {
    const sill = document.querySelector('.hero-arch-sill')?.getBoundingClientRect();
    const heading = document.querySelector('.room-section-header')?.getBoundingClientRect();
    return Math.round(heading.top - sill.bottom);
  });
  console.log(`\n--- 6. SPACING AT TEXT SIZE A+ (18px base) ---`);
  console.log(`Measured space from sill bottom to first room heading at A+: ${spacingAPlus}px (target: 64px)`);

  await browser.close();
}

run().catch(console.error);
