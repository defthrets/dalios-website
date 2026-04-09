// ── DALIOS Website — Shared JavaScript ──

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Scroll animations (intersection observer)
  const animateEls = document.querySelectorAll('.animate-in');
  if (animateEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animateEls.forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }
});

// ── Download Tracking ──
// Set this to your Cloudflare Worker URL after deploying
const TRACKER_URL = '';

function trackDownload(platform) {
  if (!TRACKER_URL) return;
  try {
    navigator.sendBeacon(
      TRACKER_URL + '/track',
      JSON.stringify({ platform })
    );
  } catch (e) {
    // Silent fail — don't block the download
    fetch(TRACKER_URL + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
      keepalive: true,
    }).catch(() => {});
  }
}

// Load and display download stats
async function loadDownloadStats() {
  if (!TRACKER_URL) return;
  try {
    const res = await fetch(TRACKER_URL + '/stats');
    const stats = await res.json();
    const el = document.getElementById('download-count');
    if (el && stats.total) {
      el.textContent = stats.total.toLocaleString();
      el.closest('.download-stats')?.classList.add('visible');
    }
  } catch (e) {
    // Silent fail
  }
}

document.addEventListener('DOMContentLoaded', loadDownloadStats);

// ── Hero Tag Typing Animation ──
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('heroTagTyping');
  if (!el) return;
  const lines = [
    'SYSTEM ONLINE — AUTONOMOUS TRADING ACTIVATED',
    'SCANNING 1,900+ ASX TICKERS...',
    'SIGNAL ENGINE ARMED — 16 BROKERS CONNECTED',
    'ALL WEATHER PROTOCOL ENGAGED',
    'RISK MATRIX NOMINAL — CIRCUIT BREAKERS SET',
  ];
  let lineIdx = 0, charIdx = 0, deleting = false, pause = 0;
  function tick() {
    const line = lines[lineIdx];
    if (pause > 0) { pause--; requestAnimationFrame(tick); return; }
    if (!deleting) {
      el.textContent = line.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx >= line.length) { deleting = true; pause = 90; }
    } else {
      el.textContent = line.slice(0, charIdx);
      charIdx--;
      if (charIdx <= 0) { deleting = false; lineIdx = (lineIdx + 1) % lines.length; pause = 15; }
    }
    setTimeout(tick, deleting ? 20 : 45);
  }
  tick();
});

// ── Legal Modal ──
const _LEGAL_CONTENT = {
  privacy: {
    title: 'PRIVACY POLICY',
    html: `
      <h2>Information We Collect</h2>
      <p>DaliosATF operates entirely on your local machine. We do not collect, store, or transmit any personal data to external servers. All trading data, portfolio information, and configuration settings remain on your device.</p>
      <h2>Broker API Credentials</h2>
      <p>API keys and secrets you provide for broker connections are stored locally on your device using basic encryption. They are never transmitted to DaliosATF servers or any third party. Credentials are used solely to communicate directly between your device and your chosen broker.</p>
      <h2>Market Data</h2>
      <p>Market data is fetched from public APIs (Yahoo Finance) directly from your device. These services may log your IP address per their own privacy policies. We recommend reviewing their terms independently.</p>
      <h2>Notifications</h2>
      <p>If you configure Discord webhooks or Telegram bot tokens, messages are sent directly from your device to those services. DaliosATF does not proxy or store notification content.</p>
      <h2>Analytics &amp; Telemetry</h2>
      <p>DaliosATF does not include any analytics, telemetry, tracking pixels, or third-party scripts. No usage data leaves your machine.</p>
      <h2>Data Retention</h2>
      <p>All data is stored in local SQLite databases and JSON files within the application directory. You can delete all data at any time by removing the <code>data/</code> folder.</p>
      <h2>Contact</h2>
      <p>For privacy-related inquiries, please open an issue on the project repository.</p>
    `
  },
  terms: {
    title: 'TERMS & CONDITIONS',
    html: `
      <h2>Acceptance of Terms</h2>
      <p>By using DaliosATF ("the Software"), you agree to these terms. If you do not agree, do not use the Software.</p>
      <h2>Nature of the Software</h2>
      <p>DaliosATF is an experimental, open-source trading analysis and automation tool. It is provided for educational and research purposes only. It is not a registered financial advisor, broker-dealer, or investment service.</p>
      <h2>No Financial Advice</h2>
      <p>Nothing in this Software constitutes financial, investment, tax, or legal advice. All signals, recommendations, and analysis generated by DaliosATF are algorithmic outputs and should not be treated as professional advice. Always consult a qualified financial advisor before making investment decisions.</p>
      <h2>Risk Disclosure</h2>
      <ul>
        <li>Trading stocks and commodities involves substantial risk of loss.</li>
        <li>Past performance of any algorithm does not guarantee future results.</li>
        <li>You may lose some or all of your invested capital.</li>
        <li>Automated trading systems can malfunction, execute unintended trades, or fail to execute intended trades.</li>
        <li>Market conditions can change rapidly and unpredictably.</li>
      </ul>
      <h2>Limitation of Liability</h2>
      <p>The authors and contributors of DaliosATF are not liable for any financial losses, damages, or other consequences arising from the use of this Software. You use DaliosATF entirely at your own risk.</p>
      <h2>No Warranty</h2>
      <p>The Software is provided "AS IS" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
      <h2>Your Responsibilities</h2>
      <ul>
        <li>You are solely responsible for all trading decisions and their outcomes.</li>
        <li>You must comply with all applicable laws and regulations in your jurisdiction.</li>
        <li>You are responsible for securing your API credentials and trading accounts.</li>
        <li>You should thoroughly test any strategy in paper mode before risking real capital.</li>
      </ul>
      <h2>Modifications</h2>
      <p>These terms may be updated at any time. Continued use of the Software constitutes acceptance of any changes.</p>
    `
  },
  transparency: {
    title: 'TRANSPARENCY REPORT',
    html: `
      <h2>How DaliosATF Works</h2>
      <p>DaliosATF is an open-source algorithmic trading framework inspired by Ray Dalio's All Weather investment principles. It analyses market conditions and generates trade signals using a combination of technical indicators, market regime classification, and portfolio optimisation.</p>
      <h2>Signal Generation</h2>
      <p>Trade signals are generated using:</p>
      <ul>
        <li><strong>RSI (Relative Strength Index)</strong> — measures momentum and overbought/oversold conditions.</li>
        <li><strong>Moving averages</strong> — 20-day and 50-day crossovers for trend detection.</li>
        <li><strong>Market quadrant classification</strong> — categorises the macro environment (growth/inflation rising/falling) to select appropriate asset allocations.</li>
        <li><strong>Confidence scoring</strong> — composite score from indicator agreement, with minimum thresholds for signal emission.</li>
      </ul>
      <h2>Data Sources</h2>
      <ul>
        <li><strong>Yahoo Finance</strong> — ASX stock and commodity price data (delayed).</li>
      </ul>
      <h2>Limitations</h2>
      <ul>
        <li>Price data may be delayed up to 15 minutes for ASX stocks.</li>
        <li>Signal confidence scores are statistical estimates, not certainties.</li>
        <li>The system does not account for all market risks (liquidity, geopolitical, regulatory).</li>
        <li>Backtested performance uses paper trading simulation and may not reflect real-world execution.</li>
      </ul>
      <h2>Open Source</h2>
      <p>DaliosATF is fully open source. All signal logic, scoring algorithms, and trading rules are visible in the source code. There are no hidden fees, proprietary black boxes, or undisclosed affiliate arrangements.</p>
      <h2>Conflicts of Interest</h2>
      <p>DaliosATF has no commercial relationships with any broker, exchange, or data provider. The Software does not receive commissions, referral fees, or payment-for-order-flow from any party.</p>
    `
  }
};

function openLegalModal(type) {
  const content = _LEGAL_CONTENT[type];
  if (!content) return;
  document.getElementById('legalModalTitle').textContent = content.title;
  document.getElementById('legalModalBody').innerHTML = content.html;
  document.getElementById('legalModalOverlay').classList.remove('hidden');
}

function closeLegalModal() {
  document.getElementById('legalModalOverlay').classList.add('hidden');
}

// Copy code button
function copyCode(btn) {
  const codeBlock = btn.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = '#22c55e';
    btn.style.borderColor = '#22c55e';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  });
}
