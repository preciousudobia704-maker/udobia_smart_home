import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\settings_whitespace';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING SETTINGS WHITESPACE & ZERO DIVIDERS ===');

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

  // 1. Check for any <hr> tags
  const hrCount = await page.evaluate(() => document.querySelectorAll('hr').length);
  console.log(`HR tags found: ${hrCount}`);

  // 2. Check for any border-top or border-bottom rules in settings container (excluding form inputs)
  const borderCheck = await page.evaluate(() => {
    const container = document.querySelector('.settings-page-container');
    if (!container) return { error: 'Settings container not found' };

    const elements = Array.from(container.querySelectorAll('*'));
    const bordersFound = [];

    for (const el of elements) {
      // Allow input element borders and alert box
      if (el.tagName === 'INPUT' || el.classList.contains('contact-remove-confirm-box')) continue;
      
      const cs = getComputedStyle(el);
      const bt = parseFloat(cs.borderTopWidth);
      const bb = parseFloat(cs.borderBottomWidth);

      if (bt > 0 && cs.borderTopStyle !== 'none' && cs.borderTopColor !== 'transparent') {
        bordersFound.push({ tag: el.tagName, class: el.className, type: 'border-top', width: cs.borderTopWidth, color: cs.borderTopColor });
      }
      if (bb > 0 && cs.borderBottomStyle !== 'none' && cs.borderBottomColor !== 'transparent') {
        bordersFound.push({ tag: el.tagName, class: el.className, type: 'border-bottom', width: cs.borderBottomWidth, color: cs.borderBottomColor });
      }
    }
    return bordersFound;
  });

  console.log('Horizontal borders found (should be empty):', JSON.stringify(borderCheck, null, 2));

  // 3. Measure Spacing at A
  console.log('\n--- Measuring Spacing at A (Normal) ---');
  await page.click('#btn-size-normal');
  await new Promise(r => setTimeout(r, 400));

  const spacingA = await page.evaluate(() => {
    const title = document.querySelector('.settings-row-title');
    const desc = document.querySelector('.settings-row-desc');
    const rows = document.querySelectorAll('.settings-row');
    const sheet = document.querySelector('.settings-sheet');
    const section2 = document.querySelectorAll('.settings-section')[1];
    const heading = document.querySelector('.settings-section-heading');
    const rowControl = document.querySelector('.settings-row-control');

    const titleMarginBottom = title ? getComputedStyle(title).marginBottom : null;
    const descToControlGap = document.querySelector('.settings-row-stacked') ? getComputedStyle(document.querySelector('.settings-row-stacked')).gap : null;
    const rowsGap = document.querySelector('.settings-section-rows') ? getComputedStyle(document.querySelector('.settings-section-rows')).gap : null;
    const sheetGap = sheet ? getComputedStyle(sheet).gap : null;
    const sectionGap = section2 ? getComputedStyle(section2).gap : null;

    return {
      titleToDesc: titleMarginBottom,
      descToControlGap,
      betweenSettingsInSameCategory: rowsGap,
      betweenCategories: sheetGap,
      headingToFirstSetting: sectionGap
    };
  });
  console.log('Spacing at A:', JSON.stringify(spacingA, null, 2));

  // Capture full page screenshot at A
  const pathA = path.join(outDir, 'settings_scale_A.png');
  await page.screenshot({ path: pathA, fullPage: true });
  console.log(`✓ Full-page screenshot saved: ${pathA}`);

  // 4. Measure Spacing at A++
  console.log('\n--- Measuring Spacing at A++ (Extra Large) ---');
  await page.click('#btn-size-xlarge');
  await new Promise(r => setTimeout(r, 400));

  const spacingAPlusPlus = await page.evaluate(() => {
    const title = document.querySelector('.settings-row-title');
    const desc = document.querySelector('.settings-row-desc');
    const sheet = document.querySelector('.settings-sheet');
    const section2 = document.querySelectorAll('.settings-section')[1];

    const titleMarginBottom = title ? getComputedStyle(title).marginBottom : null;
    const descToControlGap = document.querySelector('.settings-row-stacked') ? getComputedStyle(document.querySelector('.settings-row-stacked')).gap : null;
    const rowsGap = document.querySelector('.settings-section-rows') ? getComputedStyle(document.querySelector('.settings-section-rows')).gap : null;
    const sheetGap = sheet ? getComputedStyle(sheet).gap : null;
    const sectionGap = section2 ? getComputedStyle(section2).gap : null;

    return {
      titleToDesc: titleMarginBottom,
      descToControlGap,
      betweenSettingsInSameCategory: rowsGap,
      betweenCategories: sheetGap,
      headingToFirstSetting: sectionGap
    };
  });
  console.log('Spacing at A++:', JSON.stringify(spacingAPlusPlus, null, 2));

  // Capture full page screenshot at A++
  const pathAPlusPlus = path.join(outDir, 'settings_scale_A_plus_plus.png');
  await page.screenshot({ path: pathAPlusPlus, fullPage: true });
  console.log(`✓ Full-page screenshot saved: ${pathAPlusPlus}`);

  await browser.close();
  console.log('\n=== VERIFICATION FINISHED ===');
}

run().catch(console.error);
