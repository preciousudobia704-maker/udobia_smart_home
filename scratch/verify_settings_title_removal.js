import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\settings_no_title';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING SETTINGS TITLE REMOVAL & ALIGNMENT ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1280, height: 960 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Set user preferences with onboarded profile and contact details
  await page.evaluateOnNewDocument(() => {
    const prefs = {
      preference_id: 'pref-default-1',
      age_profile: 'MIDDLE',
      active_mode: 'STANDARD',
      text_scale: 'normal',
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

  await page.goto('http://localhost:5174/settings', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Verify Browser Tab Title
  const tabTitle = await page.title();
  console.log(`Browser Tab Title: "${tabTitle}"`);

  // 2. Verify H1 exists, has text "Settings", and is visually hidden (not display: none)
  const h1Check = await page.evaluate(() => {
    const h1 = document.querySelector('h1.settings-page-title');
    if (!h1) return { error: 'h1 not found' };

    const cs = getComputedStyle(h1);
    const rect = h1.getBoundingClientRect();

    return {
      tagName: h1.tagName,
      text: h1.textContent.trim(),
      display: cs.display,
      visibility: cs.visibility,
      position: cs.position,
      width: rect.width,
      height: rect.height,
      clip: cs.clip
    };
  });
  console.log('H1 Accessibility Check:', JSON.stringify(h1Check, null, 2));

  // 3. Verify Alignment & Spacing at A
  console.log('\n--- Measuring at A (Normal) ---');
  await page.click('#btn-size-normal');
  await new Promise(r => setTimeout(r, 400));

  const measurementsA = await page.evaluate(() => {
    const header = document.querySelector('.app-header');
    const backBtn = document.querySelector('#btn-header-back-home');
    const firstHeading = document.querySelector('#setting-profile-title');

    const headerRect = header.getBoundingClientRect();
    const backBtnRect = backBtn.getBoundingClientRect();
    const headingRect = firstHeading.getBoundingClientRect();

    return {
      firstHeadingText: firstHeading.textContent.trim(),
      headerBottom: headerRect.bottom,
      headingTop: headingRect.top,
      distanceFromHeaderToHeading: headingRect.top - headerRect.bottom,
      backBtnLeft: backBtnRect.left,
      headingLeft: headingRect.left,
      leftEdgeDifference: headingRect.left - backBtnRect.left
    };
  });
  console.log('Measurements at A:', JSON.stringify(measurementsA, null, 2));

  // Capture full page screenshot at A
  const pathA = path.join(outDir, 'settings_no_title_A.png');
  await page.screenshot({ path: pathA, fullPage: true });
  console.log(`✓ Full-page screenshot saved: ${pathA}`);

  // 4. Verify Alignment & Spacing at A++
  console.log('\n--- Measuring at A++ (Extra Large) ---');
  await page.click('#btn-size-xlarge');
  await new Promise(r => setTimeout(r, 400));

  const measurementsAPlusPlus = await page.evaluate(() => {
    const header = document.querySelector('.app-header');
    const backBtn = document.querySelector('#btn-header-back-home');
    const firstHeading = document.querySelector('#setting-profile-title');

    const headerRect = header.getBoundingClientRect();
    const backBtnRect = backBtn.getBoundingClientRect();
    const headingRect = firstHeading.getBoundingClientRect();

    return {
      firstHeadingText: firstHeading.textContent.trim(),
      headerBottom: headerRect.bottom,
      headingTop: headingRect.top,
      distanceFromHeaderToHeading: headingRect.top - headerRect.bottom,
      backBtnLeft: backBtnRect.left,
      headingLeft: headingRect.left,
      leftEdgeDifference: headingRect.left - backBtnRect.left
    };
  });
  console.log('Measurements at A++:', JSON.stringify(measurementsAPlusPlus, null, 2));

  // Capture full page screenshot at A++
  const pathAPlusPlus = path.join(outDir, 'settings_no_title_A_plus_plus.png');
  await page.screenshot({ path: pathAPlusPlus, fullPage: true });
  console.log(`✓ Full-page screenshot saved: ${pathAPlusPlus}`);

  await browser.close();
  console.log('\n=== VERIFICATION FINISHED ===');
}

run().catch(console.error);
