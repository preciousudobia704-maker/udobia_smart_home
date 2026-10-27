import puppeteer from 'puppeteer-core';

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  console.log('--- Navigating to http://localhost:5174/ ---');
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
  console.log('Current URL:', page.url());

  // 1. Verify Room Order in Standard View
  const standardRooms = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('.room-section-title span')).map(el => el.textContent.trim());
    return titles;
  });
  console.log('Standard View Room Order:', standardRooms);
  const expectedOrder = ['Entrance', 'Living Room', 'Kitchen', 'Bedroom'];
  const orderMatches = JSON.stringify(standardRooms) === JSON.stringify(expectedOrder);
  console.log('Standard Room Order matches expected:', orderMatches);

  // 2. Verify Room Order in Simple View
  // Turn on Simple mode via preferences in localStorage
  await page.evaluate(() => {
    const prefStr = localStorage.getItem('smart_home_user_preferences');
    const pref = prefStr ? JSON.parse(prefStr) : {};
    pref.active_mode = 'SIMPLE';
    localStorage.setItem('smart_home_user_preferences', JSON.stringify(pref));
    window.location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  const simpleRooms = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('.room-section-title span')).map(el => el.textContent.trim());
    return titles;
  });
  console.log('Simple View Room Order:', simpleRooms);
  const simpleOrderMatches = JSON.stringify(simpleRooms) === JSON.stringify(expectedOrder);
  console.log('Simple Room Order matches expected:', simpleOrderMatches);

  // Revert back to Standard mode for remaining tests
  await page.evaluate(() => {
    const prefStr = localStorage.getItem('smart_home_user_preferences');
    const pref = prefStr ? JSON.parse(prefStr) : {};
    pref.active_mode = 'STANDARD';
    localStorage.setItem('smart_home_user_preferences', JSON.stringify(pref));
    window.location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // 3. Spacing test before first room heading at A, A+, A++
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('.hero-band');
      const firstSection = document.querySelector('.room-group-section');
      const heroStyle = window.getComputedStyle(hero);
      const heroRect = hero.getBoundingClientRect();
      const firstSectionRect = firstSection.getBoundingClientRect();
      return {
        heroMarginBottom: heroStyle.marginBottom,
        visualGap: firstSectionRect.top - heroRect.bottom
      };
    });
    console.log(`Scale ${scale} hero spacing:`, metrics);
  }

  // Set back to normal
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-text-scale', 'normal');
  });

  // 4. Test Device Card On-State Colors and Off-State
  // Toggle all devices ON to check styling
  console.log('--- Testing Device On-State Styling ---');
  await page.evaluate(() => {
    // Click Turn On buttons
    const buttons = Array.from(document.querySelectorAll('.device-action-btn'));
    buttons.forEach(btn => {
      if (btn.textContent.includes('Turn On') || btn.textContent.includes('Unlock Door')) {
        btn.click();
      }
    });
  });
  await new Promise(r => setTimeout(r, 600));

  const deviceStyles = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.device-card'));
    return cards.map(c => {
      const title = c.querySelector('.device-title')?.textContent.trim();
      const style = window.getComputedStyle(c);
      const isAc = c.classList.contains('device-card-ac');
      const acPlate = c.querySelector('.ac-controls-plate');
      const acPlateStyle = acPlate ? window.getComputedStyle(acPlate) : null;
      const acTempLabel = c.querySelector('.ac-temp-label');
      const acTempLabelStyle = acTempLabel ? window.getComputedStyle(acTempLabel) : null;
      const acTempNum = c.querySelector('.ac-temp-value-fraunces');
      const acTempNumStyle = acTempNum ? window.getComputedStyle(acTempNum) : null;
      const caption = c.querySelector('.device-caption');
      const captionStyle = caption ? window.getComputedStyle(caption) : null;

      return {
        title,
        bg: style.backgroundColor,
        border: style.borderColor,
        borderWidth: style.borderWidth,
        shadow: style.boxShadow,
        isAc,
        acPlateBg: acPlateStyle?.backgroundColor,
        acPlateBorder: acPlateStyle?.borderColor,
        acTempLabelColor: acTempLabelStyle?.color,
        acTempNumColor: acTempNumStyle?.color,
        captionColor: captionStyle?.color
      };
    });
  });

  console.log('Device on-state styles:', JSON.stringify(deviceStyles, null, 2));

  // 5. Test Heights in Living Room (Light vs AC)
  console.log('--- Checking Card Heights in Living Room ---');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 300));

    const heights = await page.evaluate(() => {
      const lightCard = document.querySelector('.device-card-light');
      const acCard = document.querySelector('.device-card-ac');
      const lightRect = lightCard.getBoundingClientRect();
      const acRect = acCard.getBoundingClientRect();
      const lightInner = lightCard.querySelector('.device-card-inner');
      const lightInnerStyle = window.getComputedStyle(lightInner);
      return {
        lightHeight: lightRect.height,
        acHeight: acRect.height,
        diff: Math.abs(lightRect.height - acRect.height),
        lightJustifyContent: lightInnerStyle.justifyContent
      };
    });
    console.log(`Scale ${scale} Living Room card heights:`, heights);
  }

  // 6. Test Word Break on Device Titles
  console.log('--- Checking Word Wrapping on Device Titles ---');
  for (const scale of ['normal', 'large', 'xlarge']) {
    await page.evaluate((sc) => {
      document.documentElement.setAttribute('data-text-scale', sc);
    }, scale);
    await new Promise(r => setTimeout(r, 300));

    const titleMetrics = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll('.device-title'));
      return titles.map(t => {
        const style = window.getComputedStyle(t);
        return {
          text: t.textContent.trim(),
          wordBreak: style.wordBreak,
          overflowWrap: style.overflowWrap,
          hyphens: style.hyphens,
          scrollWidth: t.scrollWidth,
          clientWidth: t.clientWidth,
          isOverflowing: t.scrollWidth > t.clientWidth
        };
      });
    });
    console.log(`Scale ${scale} title word wrapping:`, titleMetrics);
  }

  // 7. Verify illustrations amber fill & ink stroke
  const illustrations = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('.device-illustration'));
    return svgs.map(s => {
      const cls = s.getAttribute('class');
      const paths = Array.from(s.querySelectorAll('path, rect, circle, line')).map(p => ({
        tag: p.tagName,
        fill: p.getAttribute('fill'),
        stroke: p.getAttribute('stroke')
      }));
      return { cls, pathsCount: paths.length };
    });
  });
  console.log('Illustrations found:', illustrations.length);

  await page.screenshot({ path: 'scratch/home_screen_verified.png' });
  console.log('Screenshot saved to scratch/home_screen_verified.png');

  await browser.close();
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
