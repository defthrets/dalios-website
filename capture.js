const puppeteer = require('puppeteer');
const path = require('path');

const TABS = [
  { name: 'command-center', idx: 0, wait: 5000 },
  { name: 'live-trading', idx: 1, wait: 5000 },
  { name: 'signal-ops', idx: 2, wait: 5000, action: 'scan' },
  { name: 'intel-center', idx: 3, wait: 5000, action: 'refresh' },
  { name: 'holy-grail', idx: 4, wait: 5000, action: 'refresh' },
  { name: 'risk-matrix', idx: 5, wait: 5000 },
  { name: 'backtest-lab', idx: 6, wait: 5000 },
  { name: 'asx', idx: 7, wait: 8000, action: 'refresh' },
  { name: 'commodities', idx: 8, wait: 8000, action: 'refresh' },
  { name: 'paper-trading', idx: 9, wait: 5000 },
  { name: 'settings', idx: 10, wait: 3000 },
];

// Crop regions for focused detail shots (left, top, right, bottom)
const CROPS = {
  'signal-ops':    [0, 60, 1920, 660],
  'intel-center':  [0, 60, 1920, 560],
  'holy-grail':    [0, 60, 1920, 600],
  'commodities':   [0, 60, 1920, 700],
  'risk-matrix':   [0, 60, 1920, 500],
  'backtest-lab':  [0, 60, 1920, 600],
  'paper-trading': [0, 60, 1920, 580],
  'live-trading':  [0, 60, 1920, 560],
  'settings':      [0, 60, 1920, 500],
  'asx':           [0, 60, 1920, 700],
};

(async () => {
  // Connect to existing Chrome if available, else launch new
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Inject CSS to hide tutorials/mascot/tooltips before anything loads
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());

  await page.goto('http://localhost:8000', { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for initial data
  await new Promise(r => setTimeout(r, 8000));

  // Global hide of tutorials/mascot
  const hideOverlays = async () => {
    await page.addStyleTag({ content: `
      [class*="tutorial"], [class*="mascot"], [class*="tut-"],
      [class*="speech"], [class*="bubble"], [class*="welcome"],
      .spot-mascot, .welcome-mascot, .welcome-overlay
      { display: none !important; visibility: hidden !important; opacity: 0 !important; }
    `});
    await page.evaluate(() => {
      // Click all Done/Skip buttons
      document.querySelectorAll('button').forEach(btn => {
        const t = btn.textContent.trim().toLowerCase();
        if (t.includes('done') || t === 'skip' || t === '×') btn.click();
      });
      // Remove elements
      document.querySelectorAll('[class*="tutorial"], [class*="mascot"], [class*="tut-"], [class*="speech"], [class*="bubble"], [class*="welcome"], .spot-mascot').forEach(el => el.remove());
    });
  };

  await hideOverlays();

  for (const tab of TABS) {
    try {
      const tabBtns = await page.$$('.tab-btn');
      if (tabBtns[tab.idx]) {
        await tabBtns[tab.idx].click();
        await new Promise(r => setTimeout(r, 2000));
      }

      // Trigger data loading actions
      if (tab.action === 'scan' || tab.action === 'refresh') {
        await page.evaluate(() => {
          document.querySelectorAll('button').forEach(btn => {
            const t = btn.textContent.trim().toUpperCase();
            if (t.includes('REFRESH') || t.includes('SCAN NOW') || t.includes('RUN CYCLE') || t.includes('ANALYSE')) {
              btn.click();
            }
          });
        });
      }

      await new Promise(r => setTimeout(r, tab.wait));
      await hideOverlays();
      await new Promise(r => setTimeout(r, 500));

      // Full screenshot
      const fullPath = path.join(__dirname, 'assets', 'screenshots', tab.name + '.jpg');
      await page.screenshot({ path: fullPath, type: 'jpeg', quality: 88 });
      console.log('Full: ' + tab.name);

      // Cropped screenshot
      if (CROPS[tab.name]) {
        const [x, y, x2, y2] = CROPS[tab.name];
        const croppedPath = path.join(__dirname, 'assets', 'screenshots', 'cropped', tab.name + '.jpg');
        await page.screenshot({
          path: croppedPath,
          type: 'jpeg',
          quality: 88,
          clip: { x, y, width: x2 - x, height: y2 - y }
        });
        console.log('Crop: ' + tab.name);
      }

    } catch (e) {
      console.log('Error ' + tab.name + ': ' + e.message);
    }
  }

  await browser.close();
  console.log('All done!');
})();
