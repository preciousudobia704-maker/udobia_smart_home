import puppeteer from 'puppeteer-core';

async function testLockCard() {
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

  // 1. Initial State: Door should be LOCKED
  console.log('=== Checking Initial LOCKED State ===');
  const lockedState = await page.evaluate(() => {
    const card = document.querySelector('.device-card-lock');
    const style = window.getComputedStyle(card);
    const stateWord = card.querySelector('.door-state-word');
    const stateWordStyle = window.getComputedStyle(stateWord);
    const checkIcon = card.querySelector('.door-check-icon');
    const btn = card.querySelector('.device-action-btn');
    const btnStyle = window.getComputedStyle(btn);
    const bodyRect = card.querySelector('.illustration-padlock rect');
    const bodyFill = bodyRect?.getAttribute('fill');
    const shackleG = card.querySelector('.padlock-shackle');
    const shackleStyle = window.getComputedStyle(shackleG);
    const statusText = document.querySelector('.hero-status-sentence, .hero-greeting-text, [class*="status"]')?.textContent;

    return {
      cardBg: style.backgroundColor,
      cardBorder: style.borderColor,
      cardShadow: style.boxShadow,
      stateWord: stateWord?.textContent.trim(),
      stateWordSize: stateWordStyle?.fontSize,
      stateWordWeight: stateWordStyle?.fontWeight,
      hasCheckIcon: Boolean(checkIcon),
      btnLabel: btn?.textContent.trim(),
      btnBg: btnStyle?.backgroundColor,
      btnColor: btnStyle?.color,
      btnHeight: btn?.getBoundingClientRect().height,
      bodyFill,
      shackleTransform: shackleStyle?.transform,
      statusText
    };
  });
  console.log('Locked state check:', JSON.stringify(lockedState, null, 2));

  // Screenshot locked state
  await page.screenshot({ path: 'scratch/lock_card_locked.png' });

  // 2. Click "Unlock" button to transition to UNLOCKED
  console.log('=== Clicking Unlock to change state ===');
  await page.evaluate(() => {
    document.querySelector('.device-card-lock .device-action-btn').click();
  });
  await new Promise(r => setTimeout(r, 400));

  const unlockedState = await page.evaluate(() => {
    const card = document.querySelector('.device-card-lock');
    const style = window.getComputedStyle(card);
    const stateWord = card.querySelector('.door-state-word');
    const stateWordStyle = window.getComputedStyle(stateWord);
    const checkIcon = card.querySelector('.door-check-icon');
    const btn = card.querySelector('.device-action-btn');
    const btnStyle = window.getComputedStyle(btn);
    const bodyRect = card.querySelector('.illustration-padlock rect');
    const bodyFill = bodyRect?.getAttribute('fill');
    const shackleG = card.querySelector('.padlock-shackle');
    const shackleStyle = window.getComputedStyle(shackleG);
    const toast = document.querySelector('.undo-toast, [class*="toast"]');

    return {
      cardBg: style.backgroundColor,
      cardBorder: style.borderColor,
      cardShadow: style.boxShadow,
      stateWord: stateWord?.textContent.trim(),
      stateWordSize: stateWordStyle?.fontSize,
      stateWordWeight: stateWordStyle?.fontWeight,
      hasCheckIcon: Boolean(checkIcon),
      btnLabel: btn?.textContent.trim(),
      btnBg: btnStyle?.backgroundColor,
      btnColor: btnStyle?.color,
      btnHeight: btn?.getBoundingClientRect().height,
      bodyFill,
      shackleTransform: shackleStyle?.transform,
      toastText: toast?.textContent.trim()
    };
  });
  console.log('Unlocked state check:', JSON.stringify(unlockedState, null, 2));

  // Screenshot unlocked state
  await page.screenshot({ path: 'scratch/lock_card_unlocked.png' });

  // 3. Test Undo
  console.log('=== Testing Undo ===');
  const undoBtnExists = await page.evaluate(() => {
    const undoBtn = document.querySelector('.undo-toast-btn, .undo-btn, [class*="undo-action"]');
    if (undoBtn) {
      undoBtn.click();
      return true;
    }
    return false;
  });
  console.log('Undo button found & clicked:', undoBtnExists);
  await new Promise(r => setTimeout(r, 400));

  const revertedState = await page.evaluate(() => {
    const card = document.querySelector('.device-card-lock');
    const stateWord = card.querySelector('.door-state-word');
    const btn = card.querySelector('.device-action-btn');
    return {
      stateWord: stateWord?.textContent.trim(),
      btnLabel: btn?.textContent.trim()
    };
  });
  console.log('Reverted state after Undo:', revertedState);

  // 4. Test Lock Button Click
  console.log('=== Clicking Lock again ===');
  await page.evaluate(() => {
    // If it's locked, click Unlock to make it unlocked, then Lock to test Lock button
    const card = document.querySelector('.device-card-lock');
    card.querySelector('.device-action-btn').click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    // Now click Lock
    const card = document.querySelector('.device-card-lock');
    card.querySelector('.device-action-btn').click();
  });
  await new Promise(r => setTimeout(r, 400));

  const finalLocked = await page.evaluate(() => {
    const card = document.querySelector('.device-card-lock');
    return {
      stateWord: card.querySelector('.door-state-word')?.textContent.trim(),
      btnLabel: card.querySelector('.device-action-btn')?.textContent.trim()
    };
  });
  console.log('Final state after Lock click:', finalLocked);

  // 5. Check scales A, A+, A++ for layout and contrast
  console.log('=== Testing Scales A, A+, A++ ===');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 200));

    const layout = await page.evaluate(() => {
      const card = document.querySelector('.device-card-lock');
      const inner = card.querySelector('.device-card-inner');
      const left = card.querySelector('.device-card-left');
      const right = card.querySelector('.device-card-right');
      const stateWord = card.querySelector('.door-state-word');
      const btn = card.querySelector('.device-action-btn');

      const innerStyle = window.getComputedStyle(inner);
      const stateWordStyle = window.getComputedStyle(stateWord);
      return {
        direction: innerStyle.flexDirection,
        stateWordFontSize: stateWordStyle.fontSize,
        cardWidth: card.getBoundingClientRect().width,
        leftWidth: left.getBoundingClientRect().width,
        rightWidth: right.getBoundingClientRect().width,
        btnHeight: btn.getBoundingClientRect().height
      };
    });
    console.log(`Scale ${scale} lock card layout:`, layout);
  }

  await browser.close();
  console.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

testLockCard().catch(err => {
  console.error(err);
  process.exit(1);
});
