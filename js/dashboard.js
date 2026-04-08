// ── DALIOS Dashboard — Charts, Tabs, Demo Data ──

document.addEventListener('DOMContentLoaded', () => {
  // ── Clock ──
  function updateClock() {
    const now = new Date();
    const el = document.getElementById('dashClock');
    if (el) el.textContent = now.toLocaleTimeString('en-AU', { hour12: false });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ── Tab Switching ──
  const tabs = document.querySelectorAll('.dashboard-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // ── Chart.js Defaults ──
  Chart.defaults.color = '#64748b';
  Chart.defaults.borderColor = '#1e2a3a';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 10;

  // ── Equity Curve ──
  const equityCtx = document.getElementById('equityChart');
  if (equityCtx) {
    const labels = [];
    const data = [];
    let val = 100000;
    for (let i = 0; i < 90; i++) {
      const d = new Date(2026, 0, 1);
      d.setDate(d.getDate() + i);
      labels.push(d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }));
      val += (Math.random() - 0.38) * 800;
      data.push(Math.round(val));
    }
    new Chart(equityCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Portfolio Value',
          data,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: '#1e2a3a',
            borderWidth: 1,
            titleFont: { family: "'Orbitron', monospace", size: 10 },
            callbacks: {
              label: ctx => '$' + ctx.parsed.y.toLocaleString()
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
          y: {
            grid: { color: 'rgba(30,42,58,0.5)' },
            ticks: {
              callback: v => '$' + (v / 1000).toFixed(0) + 'K'
            }
          }
        }
      }
    });
  }

  // ── Sentiment Doughnut ──
  const sentCtx = document.getElementById('sentimentChart');
  if (sentCtx) {
    new Chart(sentCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bullish', 'Neutral', 'Bearish'],
        datasets: [{
          data: [48, 32, 20],
          backgroundColor: ['#22c55e', '#64748b', '#ef4444'],
          borderColor: '#111827',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, usePointStyle: true, pointStyle: 'circle' }
          }
        },
        cutout: '65%'
      }
    });
  }

  // ── Risk Parity Weights ──
  const weightsCtx = document.getElementById('weightsChart');
  if (weightsCtx) {
    const assets = ['BHP', 'CSL', 'FMG', 'RIO', 'WBC', 'NAB', 'Gold', 'Bonds', 'TIPS', 'EM Eq.'];
    const weights = [8.2, 7.8, 7.1, 6.9, 5.4, 5.1, 12.3, 18.5, 14.2, 14.5];
    new Chart(weightsCtx, {
      type: 'bar',
      data: {
        labels: assets,
        datasets: [{
          label: 'Weight %',
          data: weights,
          backgroundColor: weights.map((_, i) => i < 6 ? 'rgba(249,115,22,0.6)' : 'rgba(59,130,246,0.6)'),
          borderColor: weights.map((_, i) => i < 6 ? '#f97316' : '#3b82f6'),
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(30,42,58,0.5)' },
            ticks: { callback: v => v + '%' }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // ── P&L Bar Chart ──
  const pnlCtx = document.getElementById('pnlChart');
  if (pnlCtx) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const pnl = [1200, -450, 2100, 800, -320];
    new Chart(pnlCtx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Daily P&L',
          data: pnl,
          backgroundColor: pnl.map(v => v >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'),
          borderColor: pnl.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(30,42,58,0.5)' },
            ticks: { callback: v => '$' + v }
          }
        }
      }
    });
  }

  // ── Backtest Chart ──
  const btCtx = document.getElementById('backtestChart');
  if (btCtx) {
    const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
    const returns = [6.2, 4.8, 7.1, -1.3, 5.4, 3.9, 6.8, 4.1];
    const cumulative = [];
    let cum = 0;
    returns.forEach(r => { cum += r; cumulative.push(parseFloat(cum.toFixed(1))); });

    new Chart(btCtx, {
      type: 'bar',
      data: {
        labels: periods,
        datasets: [
          {
            label: 'Period Return %',
            data: returns,
            backgroundColor: returns.map(v => v >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'),
            borderColor: returns.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
            borderWidth: 1,
            borderRadius: 3,
            order: 2
          },
          {
            label: 'Cumulative %',
            data: cumulative,
            type: 'line',
            borderColor: '#f97316',
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#f97316',
            borderWidth: 2,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, usePointStyle: true }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(30,42,58,0.5)' },
            ticks: { callback: v => v + '%' }
          }
        }
      }
    });
  }

  // ── Correlation Heatmap (CSS grid) ──
  const corrGrid = document.getElementById('correlationGrid');
  if (corrGrid) {
    const tickers = ['BHP', 'CSL', 'FMG', 'RIO', 'NAB', 'WBC', 'Gold', 'Bonds'];
    const n = tickers.length;

    let html = '<div style="display:grid;grid-template-columns:60px repeat(' + n + ',1fr);gap:2px;font-family:var(--font-mono);font-size:0.6rem;">';
    // Header row
    html += '<div></div>';
    tickers.forEach(t => {
      html += '<div style="text-align:center;padding:4px;color:var(--text-muted);">' + t + '</div>';
    });

    for (let i = 0; i < n; i++) {
      html += '<div style="padding:4px 6px;color:var(--text-muted);display:flex;align-items:center;">' + tickers[i] + '</div>';
      for (let j = 0; j < n; j++) {
        let corr;
        if (i === j) {
          corr = 1.0;
        } else {
          // Deterministic pseudo-correlation
          const seed = (i + 1) * (j + 1) * 17 % 100;
          corr = parseFloat(((seed / 100) * 1.4 - 0.3).toFixed(2));
          corr = Math.max(-0.5, Math.min(0.9, corr));
        }

        let bg;
        if (corr >= 0.7) bg = 'rgba(239,68,68,0.4)';
        else if (corr >= 0.3) bg = 'rgba(234,179,8,0.25)';
        else if (corr >= 0) bg = 'rgba(100,116,139,0.15)';
        else bg = 'rgba(59,130,246,0.3)';

        const textColor = i === j ? 'var(--accent)' : 'var(--text-secondary)';
        html += '<div style="text-align:center;padding:6px 4px;background:' + bg + ';border-radius:2px;color:' + textColor + ';">' + corr.toFixed(2) + '</div>';
      }
    }
    html += '</div>';
    corrGrid.innerHTML = html;
  }

  // ── Demo alert feed animation ──
  const alerts = [
    { color: 'var(--green)', tag: 'SIGNAL', text: 'BUY CBA.AX — Confidence 79% — Banking sector rotation' },
    { color: 'var(--accent)', tag: 'REBALANCE', text: 'Portfolio weights adjusted — volatility regime shift detected' },
    { color: 'var(--blue)', tag: 'INTEL', text: 'FinBERT: Mining sentiment +0.41 (24h rolling)' },
    { color: 'var(--yellow)', tag: 'RISK', text: 'Correlation spike: BHP/RIO at 0.78 — approaching threshold' },
    { color: 'var(--green)', tag: 'SYSTEM', text: 'Walk-forward period 6 complete — Sharpe 2.14' },
    { color: 'var(--red)', tag: 'ALERT', text: 'WBC.AX stop-loss triggered at $24.10 — position closed' },
    { color: 'var(--blue)', tag: 'INTEL', text: 'RBA minutes released — dovish tone, AUD weakening' },
    { color: 'var(--green)', tag: 'SIGNAL', text: 'LONG FMG.AX — Iron ore demand cycle acceleration confirmed' },
  ];

  let alertIdx = 0;
  setInterval(() => {
    const feed = document.getElementById('alertFeed');
    if (!feed || document.getElementById('tab-command')?.classList.contains('active') === false) return;

    const a = alerts[alertIdx % alerts.length];
    const now = new Date();
    const time = now.toLocaleTimeString('en-AU', { hour12: false });

    const div = document.createElement('div');
    div.className = 'alert-item';
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s ease';
    div.innerHTML = '<span class="alert-time">' + time + '</span><span class="alert-text"><span style="color:' + a.color + ';">[' + a.tag + ']</span> ' + a.text + '</span>';

    feed.insertBefore(div, feed.firstChild);
    requestAnimationFrame(() => { div.style.opacity = '1'; });

    // Keep max 15 alerts
    while (feed.children.length > 15) {
      feed.removeChild(feed.lastChild);
    }

    alertIdx++;
  }, 5000);
});
