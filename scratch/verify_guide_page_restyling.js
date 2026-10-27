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

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return [0, 0, 0, 1];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), match[4] !== undefined ? parseFloat(match[4]) : 1];
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

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

  console.log('Navigating to Guide page (http://localhost:5174/help)...');
  await page.goto('http://localhost:5174/help', { waitUntil: 'networkidle0' });

  // 1. CHECK SECTION SPACING (56px)
  console.log('\n=== 1. SECTION SPACING (TARGET: 56px) ===');
  const sectionSpacing = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.guide-section'));
    const gaps = [];
    for (let i = 0; i < sections.length - 1; i++) {
      const rect1 = sections[i].getBoundingClientRect();
      const rect2 = sections[i + 1].getBoundingClientRect();
      gaps.push(Math.round(rect2.top - rect1.bottom));
    }
    return { sectionCount: sections.length, gaps };
  });
  console.log(`Number of guide sections: ${sectionSpacing.sectionCount}`);
  console.log('Gaps between consecutive sections:', sectionSpacing.gaps, 'px');
  const all56px = sectionSpacing.gaps.every(g => g === 56);
  console.log('All section gaps are 56px:', all56px);

  // 2. CHECK TRUSTED CONTACT PLATE
  console.log('\n=== 2. TRUSTED CONTACT PLATE ===');
  const plateInfo = await page.evaluate(() => {
    const plate = document.querySelector('.guide-contact-plate');
    const nameEl = plate?.querySelector('.contact-plate-name');
    const phoneEl = plate?.querySelector('.contact-plate-phone');
    const noteEl = document.querySelector('.guide-contact-note');
    const changeBtn = plate?.querySelector('button');
    const oldWhiteBox = document.querySelector('.guide-contact-display');

    const plateCs = plate ? window.getComputedStyle(plate) : null;
    const nameCs = nameEl ? window.getComputedStyle(nameEl) : null;
    const phoneCs = phoneEl ? window.getComputedStyle(phoneEl) : null;
    const noteCs = noteEl ? window.getComputedStyle(noteEl) : null;

    const plateRect = plate?.getBoundingClientRect();
    const noteRect = noteEl?.getBoundingClientRect();

    return {
      plateExists: Boolean(plate),
      oldWhiteBoxExists: Boolean(oldWhiteBox),
      plateClasses: plate?.className,
      plateBgColor: plateCs?.backgroundColor,
      plateBorderRadius: plateCs?.borderRadius,
      plateBoxShadow: plateCs?.boxShadow,
      nameText: nameEl?.textContent.trim(),
      nameFontWeight: nameCs?.fontWeight,
      nameFontSize: nameCs?.fontSize,
      phoneText: phoneEl?.textContent.trim().replace(/\s+/g, ' '),
      phoneFontWeight: phoneCs?.fontWeight,
      phoneFontSize: phoneCs?.fontSize,
      phoneTabularNums: phoneCs?.fontVariantNumeric,
      isReadOnly: !changeBtn,
      noteUnderPlate: noteRect && plateRect ? noteRect.top >= plateRect.bottom : false,
      noteText: noteEl?.textContent.trim(),
      noteFontWeight: noteCs?.fontWeight,
      noteFontSize: noteCs?.fontSize,
      noteColor: noteCs?.color
    };
  });
  console.log('Plate exists:', plateInfo.plateExists);
  console.log('Old white box removed:', !plateInfo.oldWhiteBoxExists);
  console.log('Plate background:', plateInfo.plateBgColor);
  console.log('Plate border-radius (20px):', plateInfo.plateBorderRadius);
  console.log('Contact name:', plateInfo.nameText);
  console.log('Contact name weight (expected 700):', plateInfo.nameFontWeight);
  console.log('Contact name font size (~28px):', plateInfo.nameFontSize);
  console.log('Contact phone:', plateInfo.phoneText);
  console.log('Contact phone tabular-nums:', plateInfo.phoneTabularNums);
  console.log('Contact phone font size:', plateInfo.phoneFontSize);
  console.log('Plate is read-only (no button):', plateInfo.isReadOnly);
  console.log('Note is positioned under plate:', plateInfo.noteUnderPlate);
  console.log('Note text:', plateInfo.noteText);
  console.log('Note font weight (expected 500):', plateInfo.noteFontWeight);

  // 3. CHECK "OPEN EMERGENCY HELP SCREEN" BUTTON
  console.log('\n=== 3. "OPEN EMERGENCY HELP SCREEN" BUTTON ===');
  const btnInfo = await page.evaluate(() => {
    const btn = document.querySelector('.guide-emergency-btn');
    const icon = btn?.querySelector('svg');
    const cs = btn ? window.getComputedStyle(btn) : null;
    const rect = btn?.getBoundingClientRect();
    const controls = document.querySelector('.guide-contact-controls');
    const controlsRect = controls?.getBoundingClientRect();

    return {
      exists: Boolean(btn),
      text: btn?.textContent.trim(),
      bgColor: cs?.backgroundColor,
      color: cs?.color,
      borderRadius: cs?.borderRadius,
      height: Math.round(rect?.height),
      boxShadow: cs?.boxShadow,
      iconTag: icon?.tagName,
      iconClass: icon?.getAttribute('class') || '',
      isLeftAligned: rect && controlsRect ? Math.abs(rect.left - controlsRect.left) < 5 : false
    };
  });
  console.log('Button exists:', btnInfo.exists);
  console.log('Button text:', btnInfo.text);
  console.log('Button background (coral rgb(255, 133, 112)):', btnInfo.bgColor);
  console.log('Button text color (Ink #0c101d):', btnInfo.color);
  console.log('Button border-radius (pill 9999px):', btnInfo.borderRadius);
  console.log('Button height (expected 64px):', btnInfo.height);
  console.log('Button box-shadow (soft shadow):', btnInfo.boxShadow);
  console.log('Button icon class (LifeBuoy):', btnInfo.iconClass);
  console.log('Button left-aligned:', btnInfo.isLeftAligned);

  // Contrast calculation
  const coralRgb = parseRgb(btnInfo.bgColor).slice(0, 3);
  const inkRgb = parseRgb(btnInfo.color).slice(0, 3);
  const contrast = getContrastRatio(coralRgb, inkRgb);
  console.log(`\nButton text contrast ratio: ${contrast.toFixed(2)}:1 (Passes >= 7:1 ? ${contrast >= 7.0})`);

  // 4. TEST SCALING AT A, A+, A++ WITH NO OVERLAP
  console.log('\n=== 4. TEXT SCALING (A, A+, A++) & OVERLAP CHECKS ===');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 200));

    const scaleData = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.guide-section'));
      const plate = document.querySelector('.guide-contact-plate');
      const nameEl = plate?.querySelector('.contact-plate-name');
      const phoneEl = plate?.querySelector('.contact-plate-phone');
      const noteEl = document.querySelector('.guide-contact-note');
      const btn = document.querySelector('.guide-emergency-btn');

      const plateRect = plate?.getBoundingClientRect();
      const noteRect = noteEl?.getBoundingClientRect();
      const btnRect = btn?.getBoundingClientRect();

      // Check vertical overlaps in contact controls
      const plateOverlapsNote = !(plateRect.bottom <= noteRect.top);
      const noteOverlapsBtn = !(noteRect.bottom <= btnRect.top);

      return {
        nameFontSize: window.getComputedStyle(nameEl).fontSize,
        phoneFontSize: window.getComputedStyle(phoneEl).fontSize,
        btnHeight: Math.round(btnRect.height),
        btnFontSize: window.getComputedStyle(btn).fontSize,
        plateOverlapsNote,
        noteOverlapsBtn
      };
    });

    console.log(`Scale ${scale}:`, scaleData);
    await page.screenshot({ path: `scratch/guide_page_${scale}.png`, fullPage: true });
    console.log(`  Saved screenshot to scratch/guide_page_${scale}.png`);
  }

  // Restore normal scale
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'normal');
  });

  await browser.close();
  console.log('\n=== ALL GUIDE PAGE VERIFICATION TESTS COMPLETE! ===');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
