/**
 * DALIOS Download Tracker — Cloudflare Worker
 *
 * Tracks downloads per platform, sends Telegram notifications,
 * and serves download stats via API.
 *
 * Setup:
 * 1. Create a Cloudflare account at https://dash.cloudflare.com
 * 2. Install Wrangler: npm install -g wrangler
 * 3. Login: wrangler login
 * 4. Create KV namespace: wrangler kv namespace create "DOWNLOADS"
 * 5. Copy the KV ID into wrangler.toml
 * 6. Set secrets:
 *    wrangler secret put TELEGRAM_BOT_TOKEN
 *    wrangler secret put TELEGRAM_CHAT_ID
 * 7. Deploy: wrangler deploy
 */

const PLATFORMS = ['windows', 'macos', 'linux', 'android', 'ios', 'source'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /stats — return download counts
    if (url.pathname === '/stats') {
      const stats = {};
      let total = 0;
      for (const platform of PLATFORMS) {
        const count = parseInt(await env.DOWNLOADS.get(platform) || '0');
        stats[platform] = count;
        total += count;
      }
      stats.total = total;
      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /track — record a download and notify via Telegram
    if (url.pathname === '/track' && request.method === 'POST') {
      try {
        const body = await request.json();
        const platform = body.platform?.toLowerCase();

        if (!platform || !PLATFORMS.includes(platform)) {
          return new Response(JSON.stringify({ error: 'Invalid platform' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Increment counter
        const current = parseInt(await env.DOWNLOADS.get(platform) || '0');
        const newCount = current + 1;
        await env.DOWNLOADS.put(platform, newCount.toString());

        // Get total
        let total = 0;
        for (const p of PLATFORMS) {
          total += parseInt(await env.DOWNLOADS.get(p) || '0');
        }
        if (platform !== 'source') total = total; // already counted

        // Get visitor info
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const country = request.headers.get('CF-IPCountry') || 'unknown';
        const userAgent = request.headers.get('User-Agent') || 'unknown';
        const timestamp = new Date().toISOString();

        // Send Telegram notification
        const platformEmoji = {
          windows: '🪟', macos: '🍎', linux: '🐧',
          android: '📱', ios: '📱', source: '💻'
        };

        const message = [
          `${platformEmoji[platform] || '📦'} *DALIOS Download*`,
          ``,
          `*Platform:* ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          `*Country:* ${country}`,
          `*Time:* ${timestamp}`,
          ``,
          `*${platform} total:* ${newCount}`,
          `*All platforms:* ${total}`,
        ].join('\n');

        await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: 'Markdown',
            }),
          }
        );

        return new Response(JSON.stringify({ ok: true, count: newCount, total }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('DALIOS Download Tracker', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  },
};
