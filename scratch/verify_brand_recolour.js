import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\99b4a37f-f49b-4ba1-a157-683eb6928b75\\screenshots\\brand_recolour';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== VERIFYING APP NAME AND LOGO RECOLOUR ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1280, height: 960 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Setup onboarded state
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

  // 1. Home Page Check
  console.log('\n--- Checking Home Page Header ---');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const homeHeaderCheck = await page.evaluate(() => {
    const brandTitle = document.querySelector('.brand-title');
    const brandSubtitle = document.querySelector('.brand-subtitle');
    const logoSvg = document.querySelector('.udobia-logomark');
    const archPath = logoSvg ? logoSvg.querySelector('path') : null;
    const lampCircle = logoSvg ? logoSvg.querySelector('circle') : null;
    const brandLink = document.querySelector('.header-brand-link');
    const heroCard = document.querySelector('.main-content');

    return {
      titleText: brandTitle?.textContent.trim(),
      titleColor: brandTitle ? getComputedStyle(brandTitle).color : null,
      titleWeight: brandTitle ? getComputedStyle(brandTitle).fontWeight : null,
      titleSize: brandTitle ? getComputedStyle(brandTitle).fontSize : null,
      subtitleText: brandSubtitle?.textContent.trim(),
      subtitleColor: brandSubtitle ? getComputedStyle(brandSubtitle).color : null,
      subtitleSize: brandSubtitle ? getComputedStyle(brandSubtitle).fontSize : null,
      logoColor: logoSvg ? getComputedStyle(logoSvg).color : null,
      archStroke: archPath ? getComputedStyle(archPath).stroke : null,
      lampFill: lampCircle ? lampCircle.getAttribute('fill') : null,
      brandLeft: brandLink ? brandLink.getBoundingClientRect().left : null,
      contentLeft: heroCard ? heroCard.getBoundingClientRect().left + 24 : null // main-content padding is 24
    };
  });
  console.log('Home Header:', JSON.stringify(homeHeaderCheck, null, 2));

  const pathHome = path.join(outDir, 'header_home.png');
  await page.screenshot({ path: pathHome, clip: { x: 0, y: 0, width: 1280, height: 160 } });
  console.log(`Saved screenshot: ${pathHome}`);

  // 2. Onboarding Page Check
  console.log('\n--- Checking Onboarding Page Header ---');
  // Clear preferences to view Onboarding
  await page.evaluate(() => {
    localStorage.removeItem('smart_home_user_preferences');
  });
  await page.goto('http://localhost:5174/onboarding', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const onboardingHeaderCheck = await page.evaluate(() => {
    const brandTitle = document.querySelector('.brand-title');
    const brandSubtitle = document.querySelector('.brand-subtitle');
    const logoSvg = document.querySelector('.udobia-logomark');
    const archPath = logoSvg ? logoSvg.querySelector('path') : null;
    const lampCircle = logoSvg ? logoSvg.querySelector('circle') : null;
    const brandLink = document.querySelector('.header-brand-link');

    return {
      titleText: brandTitle?.textContent.trim(),
      titleColor: brandTitle ? getComputedStyle(brandTitle).color : null,
      titleWeight: brandTitle ? getComputedStyle(brandTitle).fontWeight : null,
      subtitleText: brandSubtitle?.textContent.trim(),
      subtitleColor: brandSubtitle ? getComputedStyle(brandSubtitle).color : null,
      subtitleSize: brandSubtitle ? getComputedStyle(brandSubtitle).fontSize : null,
      logoColor: logoSvg ? getComputedStyle(logoSvg).color : null,
      archStroke: archPath ? getComputedStyle(archPath).stroke : null,
      lampFill: lampCircle ? lampCircle.getAttribute('fill') : null,
      brandLeft: brandLink ? brandLink.getBoundingClientRect().left : null
    };
  });
  console.log('Onboarding Header:', JSON.stringify(onboardingHeaderCheck, null, 2));

  const pathOnboarding = path.join(outDir, 'header_onboarding.png');
  await page.screenshot({ path: pathOnboarding, clip: { x: 0, y: 0, width: 1280, height: 160 } });
  console.log(`Saved screenshot: ${pathOnboarding}`);

  await browser.close();
  console.log('\n=== VERIFICATION FINISHED ===');
}

run().catch(console.error);
