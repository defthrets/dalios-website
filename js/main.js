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
