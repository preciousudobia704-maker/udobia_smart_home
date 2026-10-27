import puppeteer from 'puppeteer-core';

async function testAcAndLightOn() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
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

  const btnIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.device-action-btn')).map(b => b.id);
  });
  console.log('Available device buttons:', btnIds);

  console.log('Toggling AC ON via DOM...');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-ac')?.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Toggling Light ON via DOM...');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-light')?.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Toggling TV ON via DOM...');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-tv')?.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const results = await page.evaluate(() => {
    const acCard = document.querySelector('.device-card-ac');
    const lightCard = document.querySelector('.device-card-light');
    const tvCard = document.querySelector('.device-card-plug');

    const acStyle = window.getComputedStyle(acCard);
    const lightStyle = window.getComputedStyle(lightCard);
    const tvStyle = window.getComputedStyle(tvCard);

    const acPlate = document.querySelector('.ac-controls-plate');
    const acPlateStyle = acPlate ? window.getComputedStyle(acPlate) : null;
    const acTempNum = document.querySelector('.ac-temp-value-fraunces');
    const acTempNumStyle = acTempNum ? window.getComputedStyle(acTempNum) : null;
    const acTempLabel = document.querySelector('.ac-temp-label');
    const acTempLabelStyle = acTempLabel ? window.getComputedStyle(acTempLabel) : null;
    const rockerBtn = document.querySelector('.temp-rocker-cooler');
    const rockerBtnStyle = rockerBtn ? window.getComputedStyle(rockerBtn) : null;

    const acRect = acCard.getBoundingClientRect();
    const lightRect = lightCard.getBoundingClientRect();
    const tvRect = tvCard.getBoundingClientRect();

    const lightInner = lightCard.querySelector('.device-card-inner');
    const lightInnerStyle = window.getComputedStyle(lightInner);

    return {
      ac: {
        bg: acStyle.backgroundColor,
        border: acStyle.borderColor,
        borderWidth: acStyle.borderWidth,
        shadow: acStyle.boxShadow,
        height: acRect.height
      },
      light: {
        bg: lightStyle.backgroundColor,
        border: lightStyle.borderColor,
        borderWidth: lightStyle.borderWidth,
        shadow: lightStyle.boxShadow,
        height: lightRect.height,
        justifyContent: lightInnerStyle.justifyContent
      },
      tv: {
        bg: tvStyle.backgroundColor,
        border: tvStyle.borderColor,
        borderWidth: tvStyle.borderWidth,
        shadow: tvStyle.boxShadow,
        height: tvRect.height
      },
      acPlate: {
        bg: acPlateStyle?.backgroundColor,
        border: acPlateStyle?.borderColor,
        tempNumColor: acTempNumStyle?.color,
        tempLabelColor: acTempLabelStyle?.color,
        rockerBtnColor: rockerBtnStyle?.color
      },
      heightMatch: Math.abs(acRect.height - lightRect.height) < 1
    };
  });

  console.log('Results with AC and Light ON:', JSON.stringify(results, null, 2));

  // Also check at A++
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'xlarge');
  });
  await new Promise(r => setTimeout(r, 400));

  const resultsXLarge = await page.evaluate(() => {
    const acCard = document.querySelector('.device-card-ac');
    const lightCard = document.querySelector('.device-card-light');
    const acRect = acCard.getBoundingClientRect();
    const lightRect = lightCard.getBoundingClientRect();
    const lightInner = lightCard.querySelector('.device-card-inner');
    const lightInnerStyle = window.getComputedStyle(lightInner);

    const titles = Array.from(document.querySelectorAll('.device-title')).map(t => ({
      text: t.textContent.trim(),
      wordBreak: window.getComputedStyle(t).wordBreak,
      overflowWrap: window.getComputedStyle(t).overflowWrap,
      isOverflowing: t.scrollWidth > t.clientWidth
    }));

    return {
      acHeight: acRect.height,
      lightHeight: lightRect.height,
      heightMatch: Math.abs(acRect.height - lightRect.height) < 1,
      lightJustifyContent: lightInnerStyle.justifyContent,
      titles
    };
  });

  console.log('Results at A++ (xlarge):', JSON.stringify(resultsXLarge, null, 2));

  // Take screenshot for visual inspection
  await page.screenshot({ path: 'scratch/living_room_active_screenshot.png' });
  console.log('Screenshot saved to scratch/living_room_active_screenshot.png');

  await browser.close();
}

testAcAndLightOn().catch(err => {
  console.error(err);
  process.exit(1);
});
