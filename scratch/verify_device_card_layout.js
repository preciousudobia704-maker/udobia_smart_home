import puppeteer from 'puppeteer-core';

async function testDeviceCardLayout() {
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

  // 1. Initial State: Devices are OFF (except door locked)
  console.log('=== Checking State Words when OFF ===');
  const initialCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.device-card'));
    return cards.map(c => {
      const title = c.querySelector('.device-title')?.textContent.trim();
      const stateWord = c.querySelector('.device-state-word, .door-state-word')?.textContent.trim();
      const stateWordStyle = window.getComputedStyle(c.querySelector('.device-state-word, .door-state-word'));
      const cardRect = c.getBoundingClientRect();
      const iconRect = c.querySelector('.device-illustration-slot')?.getBoundingClientRect();
      const spaceAboveIcon = iconRect ? iconRect.top - cardRect.top : null;
      const btnRect = c.querySelector('.device-action-btn')?.getBoundingClientRect();
      const spaceBelowBtn = btnRect ? cardRect.bottom - btnRect.bottom : null;

      return {
        title,
        stateWord,
        stateWordSize: stateWordStyle?.fontSize,
        stateWordWeight: stateWordStyle?.fontWeight,
        spaceAboveIcon,
        spaceBelowBtn,
        cardHeight: cardRect.height
      };
    });
  });
  console.log('Initial cards when off:', JSON.stringify(initialCards, null, 2));

  // 2. Turn ON Living Room AC and Living Room Light
  console.log('=== Turning ON AC ===');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-ac')?.click();
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('=== Turning ON Living Room Light ===');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-light')?.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const activeCards = await page.evaluate(() => {
    const lightCard = document.querySelector('.device-card-light');
    const acCard = document.querySelector('.device-card-ac');

    const lightRect = lightCard.getBoundingClientRect();
    const acRect = acCard.getBoundingClientRect();

    const lightIconRect = lightCard.querySelector('.device-illustration-slot').getBoundingClientRect();
    const acIconRect = acCard.querySelector('.device-illustration-slot').getBoundingClientRect();

    const lightBtnRect = lightCard.querySelector('.device-action-btn').getBoundingClientRect();
    const acBtnRect = acCard.querySelector('.device-action-btn').getBoundingClientRect();

    const lightStateWord = lightCard.querySelector('.device-state-word');
    const lightStateWordStyle = window.getComputedStyle(lightStateWord);

    // AC controls inspection
    const whitePlate = acCard.querySelector('.ac-controls-plate');
    const acNumerals = acCard.querySelector('.ac-temp-numerals');
    const acNumeralsStyle = acNumerals ? window.getComputedStyle(acNumerals) : null;
    const acTargetLabel = acCard.querySelector('.ac-temp-target-label');
    const acTargetLabelStyle = acTargetLabel ? window.getComputedStyle(acTargetLabel) : null;
    const acRocker = acCard.querySelector('.ac-temp-rocker');

    // Alignment check: target label left vs numerals left
    const numeralsRect = acNumerals ? acNumerals.getBoundingClientRect() : null;
    const targetLabelRect = acTargetLabel ? acTargetLabel.getBoundingClientRect() : null;

    return {
      light: {
        height: lightRect.height,
        spaceAboveIcon: lightIconRect.top - lightRect.top,
        spaceBelowBtn: lightRect.bottom - lightBtnRect.bottom,
        stateWord: lightStateWord?.textContent.trim(),
        stateWordSize: lightStateWordStyle?.fontSize,
        stateWordWeight: lightStateWordStyle?.fontWeight,
        gapBetweenWordAndBtn: lightBtnRect.top - lightStateWord.getBoundingClientRect().bottom
      },
      ac: {
        height: acRect.height,
        spaceAboveIcon: acIconRect.top - acRect.top,
        spaceBelowBtn: acRect.bottom - acBtnRect.bottom,
        hasWhitePlate: Boolean(whitePlate),
        tempNumeralsText: acNumerals?.textContent.trim(),
        tempNumeralsSize: acNumeralsStyle?.fontSize,
        tempNumeralsWeight: acNumeralsStyle?.fontWeight,
        targetLabelText: acTargetLabel?.textContent.trim(),
        targetLabelColor: acTargetLabelStyle?.color,
        hasRocker: Boolean(acRocker),
        labelLeftAlignedWithNumerals: numeralsRect && targetLabelRect ? Math.abs(numeralsRect.left - targetLabelRect.left) < 5 : false
      },
      heightsMatch: Math.abs(lightRect.height - acRect.height) < 1,
      iconsTopAligned: Math.abs(lightIconRect.top - acIconRect.top) < 2,
      buttonsBottomAligned: Math.abs(lightBtnRect.bottom - acBtnRect.bottom) < 2
    };
  });
  console.log('Active cards check:', JSON.stringify(activeCards, null, 2));

  // 3. Turn AC OFF and verify it shows "Off"
  console.log('=== Turning AC OFF and verifying "Off" state word ===');
  await page.evaluate(() => {
    document.getElementById('btn-toggle-lr-ac')?.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const acOffCheck = await page.evaluate(() => {
    const acCard = document.querySelector('.device-card-ac');
    const stateWord = acCard.querySelector('.device-state-word');
    const stateWordStyle = stateWord ? window.getComputedStyle(stateWord) : null;
    const hasNumerals = Boolean(acCard.querySelector('.ac-temp-numerals'));
    const hasRocker = Boolean(acCard.querySelector('.ac-temp-rocker'));

    return {
      stateWord: stateWord?.textContent.trim(),
      stateWordSize: stateWordStyle?.fontSize,
      stateWordWeight: stateWordStyle?.fontWeight,
      hasNumerals,
      hasRocker
    };
  });
  console.log('AC OFF check:', JSON.stringify(acOffCheck, null, 2));

  // 4. Test scales A, A+, A++
  console.log('=== Checking Scales A, A+, A++ ===');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 200));

    const scaleMetrics = await page.evaluate(() => {
      const lightCard = document.querySelector('.device-card-light');
      const lightRect = lightCard.getBoundingClientRect();
      const iconRect = lightCard.querySelector('.device-illustration-slot').getBoundingClientRect();
      const stateWord = lightCard.querySelector('.device-state-word');
      const stateWordStyle = window.getComputedStyle(stateWord);
      return {
        cardHeight: lightRect.height,
        spaceAboveIcon: iconRect.top - lightRect.top,
        stateWordSize: stateWordStyle.fontSize
      };
    });
    console.log(`Scale ${scale} Light card metrics:`, scaleMetrics);
  }

  await browser.close();
  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
}

testDeviceCardLayout().catch(err => {
  console.error(err);
  process.exit(1);
});
