import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\fonts_check';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING ATKINSON HYPERLEGIBLE NEXT MIGRATION ===');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1280, height: 960 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // Track all network requests
  const networkRequests = [];
  page.on('request', req => {
    networkRequests.push(req.url());
  });

  // Ensure default prefs before scripts run on any page
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

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Check 1: Network requests to external CDNs / Google Fonts
  console.log('\n--- Checking Network Requests ---');
  const externalFontReqs = networkRequests.filter(url => 
    url.includes('google') || url.includes('gstatic') || url.includes('cdnjs') || url.includes('jsdelivr') || url.includes('typekit')
  );
  if (externalFontReqs.length === 0) {
    console.log('✓ PASS: Zero external requests to Google Fonts or any CDN.');
  } else {
    console.error('✗ FAIL: Found external font requests:', externalFontReqs);
  }

  // Check 2: Check computed font-family and weights on Home Page
  console.log('\n--- Checking Typography on Home Page ---');
  const homeTypo = await page.evaluate(() => {
    const brand = document.querySelector('.brand-title');
    const heroTitle = document.querySelector('.hero-greeting-title');
    const clock = document.querySelector('.hero-time-numerals');
    const roomTitle = document.querySelector('.room-section-title');
    const acTemp = document.querySelector('.ac-temp-value-fraunces');
    const body = document.body;

    return {
      body: {
        fontFamily: getComputedStyle(body).fontFamily,
        fontWeight: getComputedStyle(body).fontWeight
      },
      brand: brand ? {
        fontFamily: getComputedStyle(brand).fontFamily,
        fontWeight: getComputedStyle(brand).fontWeight,
        letterSpacing: getComputedStyle(brand).letterSpacing
      } : null,
      heroTitle: heroTitle ? {
        fontFamily: getComputedStyle(heroTitle).fontFamily,
        fontWeight: getComputedStyle(heroTitle).fontWeight,
        letterSpacing: getComputedStyle(heroTitle).letterSpacing
      } : null,
      clock: clock ? {
        fontFamily: getComputedStyle(clock).fontFamily,
        fontWeight: getComputedStyle(clock).fontWeight,
        tabularNums: getComputedStyle(clock).fontVariantNumeric
      } : null,
      roomTitle: roomTitle ? {
        fontFamily: getComputedStyle(roomTitle).fontFamily,
        fontWeight: getComputedStyle(roomTitle).fontWeight
      } : null,
      acTemp: acTemp ? {
        fontFamily: getComputedStyle(acTemp).fontFamily,
        fontWeight: getComputedStyle(acTemp).fontWeight,
        tabularNums: getComputedStyle(acTemp).fontVariantNumeric
      } : null
    };
  });
  console.log('Home Page Typography:', JSON.stringify(homeTypo, null, 2));

  // Check 3: Check Settings Page
  console.log('\n--- Checking Settings Page Typography ---');
  await page.goto('http://localhost:5174/settings', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const settingsTypo = await page.evaluate(() => {
    const pageTitle = document.querySelector('.settings-page-title');
    const heading = document.querySelector('.settings-section-heading');
    const desc = document.querySelector('.settings-row-desc');
    const contactName = document.querySelector('.contact-plate-name');
    const contactPhone = document.querySelector('.contact-plate-phone');

    return {
      pageTitle: pageTitle ? {
        fontFamily: getComputedStyle(pageTitle).fontFamily,
        fontWeight: getComputedStyle(pageTitle).fontWeight
      } : null,
      heading: heading ? {
        fontFamily: getComputedStyle(heading).fontFamily,
        fontWeight: getComputedStyle(heading).fontWeight
      } : null,
      desc: desc ? {
        fontFamily: getComputedStyle(desc).fontFamily,
        fontWeight: getComputedStyle(desc).fontWeight,
        color: getComputedStyle(desc).color
      } : null,
      contactName: contactName ? {
        fontFamily: getComputedStyle(contactName).fontFamily,
        fontWeight: getComputedStyle(contactName).fontWeight
      } : null,
      contactPhone: contactPhone ? {
        fontFamily: getComputedStyle(contactPhone).fontFamily,
        fontWeight: getComputedStyle(contactPhone).fontWeight,
        tabularNums: getComputedStyle(contactPhone).fontVariantNumeric
      } : null
    };
  });
  console.log('Settings Page Typography:', JSON.stringify(settingsTypo, null, 2));

  // Check 4: Check Emergency Page
  console.log('\n--- Checking Emergency Page Typography ---');
  await page.goto('http://localhost:5174/emergency', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const emergencyTypo = await page.evaluate(() => {
    const wrapper = document.querySelector('.emergency-screen-wrapper');
    const title = document.querySelector('.emergency-hero-title');
    const subtitle = document.querySelector('.emergency-hero-subtitle');
    const phone = document.querySelector('.hero-contact-phone-plate');
    const display112 = document.querySelector('.emergency-112-display');

    return {
      wrapper: wrapper ? {
        fontFamily: getComputedStyle(wrapper).fontFamily
      } : null,
      title: title ? {
        fontFamily: getComputedStyle(title).fontFamily,
        fontWeight: getComputedStyle(title).fontWeight,
        letterSpacing: getComputedStyle(title).letterSpacing
      } : null,
      subtitle: subtitle ? {
        fontWeight: getComputedStyle(subtitle).fontWeight
      } : null,
      phone: phone ? {
        tabularNums: getComputedStyle(phone).fontVariantNumeric,
        fontWeight: getComputedStyle(phone).fontWeight
      } : null,
      display112: display112 ? {
        tabularNums: getComputedStyle(display112).fontVariantNumeric,
        fontWeight: getComputedStyle(display112).fontWeight
      } : null
    };
  });
  console.log('Emergency Page Typography:', JSON.stringify(emergencyTypo, null, 2));

  // Check 5: Check Guide Page
  console.log('\n--- Checking Guide Page Typography ---');
  await page.goto('http://localhost:5174/help', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const guideTypo = await page.evaluate(() => {
    const pageTitle = document.querySelector('.subpage-title');
    const subtitle = document.querySelector('.subpage-subtitle');
    const caregiverPhone = document.querySelector('.emergency-contact-display');

    return {
      pageTitle: pageTitle ? {
        fontFamily: getComputedStyle(pageTitle).fontFamily,
        fontWeight: getComputedStyle(pageTitle).fontWeight
      } : null,
      subtitle: subtitle ? {
        fontFamily: getComputedStyle(subtitle).fontFamily,
        fontWeight: getComputedStyle(subtitle).fontWeight,
        color: getComputedStyle(subtitle).color
      } : null,
      caregiverPhone: caregiverPhone ? {
        tabularNums: getComputedStyle(caregiverPhone).fontVariantNumeric
      } : null
    };
  });
  console.log('Guide Page Typography:', JSON.stringify(guideTypo, null, 2));

  // Check 6: Check for any Fraunces or serif anywhere on document
  console.log('\n--- Checking For Any Remaining Fraunces or Serif ---');
  const serifElements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = [];
    for (const el of all) {
      const ff = getComputedStyle(el).fontFamily.toLowerCase();
      if (ff.includes('fraunces') || ff.includes('times') || ff.includes('georgia')) {
        matches.push({ tag: el.tagName, class: el.className, fontFamily: ff });
      }
    }
    return matches;
  });
  if (serifElements.length === 0) {
    console.log('✓ PASS: Zero elements using Fraunces or serif fallbacks!');
  } else {
    console.error('✗ FAIL: Found elements using serif:', serifElements);
  }

  // Check 7: Visual verification screenshots across A, A+, A++ for all 5 pages
  console.log('\n--- Capturing Scale Screenshots (A, A+, A++) ---');
  const pages = [
    { name: 'Home', url: 'http://localhost:5174/' },
    { name: 'Settings', url: 'http://localhost:5174/settings' },
    { name: 'Guide', url: 'http://localhost:5174/help' },
    { name: 'Emergency', url: 'http://localhost:5174/emergency' },
    { name: 'Onboarding', url: 'http://localhost:5174/onboarding' }
  ];

  const scales = [
    { id: 'normal', name: 'A' },
    { id: 'large', name: 'A_plus' },
    { id: 'xlarge', name: 'A_plus_plus' }
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    for (const s of scales) {
      await page.evaluate((scale) => {
        document.documentElement.setAttribute('data-text-scale', scale);
      }, s.id);
      await new Promise(r => setTimeout(r, 400));

      const screenshotPath = path.join(outDir, `${p.name}_${s.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot: ${screenshotPath}`);
    }
  }

  await browser.close();
  console.log('\n=== ALL FONT MIGRATION CHECKS FINISHED ===');
}

run().catch(console.error);
