const TURSO_URL = 'https://casagaming1-casagaming.aws-eu-west-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM4MTY2MzUsImlkIjoiMDE5Y2ZmNjQtODQwMS03OTE4LTkwYWMtYzg0NDVjMmU5YTJhIiwicmlkIjoiNmY0ZmRlMDYtMmYwYy00YzcyLTkxY2EtOGVmNDFjMGIxMDllIn0.uI1magG-U9X1NVygJU0-jRincNwJhsvcvl5gBJZj3FsKARpFLFH0ORe4Vcbmz7Udhn1nmh9ePxFBT1QAHm3mDg';

const BOT_UA = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|Slackbot|Discordbot|LinkedInBot|Pinterest|Applebot|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot|Sogou|crawler|spider|bot/i;

function isBot(request) {
  const ua = request.headers.get('user-agent') || '';
  return BOT_UA.test(ua);
}

function extractIdPrefix(slug) {
  if (/^[a-f0-9]{32}$/i.test(slug)) return { id: slug, full: true };
  const parts = slug.split('-');
  return { id: parts[parts.length - 1], full: false };
}

function optimizeCloudinary(url, width = 800) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto:best,w_${width},c_limit/`);
  }
  return url;
}

async function fetchProduct(slug) {
  const { id, full } = extractIdPrefix(slug);
  const sql = full
    ? 'SELECT id, name_en, name_ar, description_en, description_ar, image_url, price FROM products WHERE id = ?'
    : 'SELECT id, name_en, name_ar, description_en, description_ar, image_url, price FROM products WHERE id LIKE ?';
  const args = full ? [{ type: 'text', value: id }] : [{ type: 'text', value: `${id}%` }];

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args } }, { type: 'close' }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const rows = data.results?.[0]?.response?.result?.rows;
  if (!rows || rows.length === 0) return null;

  const row = rows[0].map(c => (c.type === 'null' ? null : c.value));
  return {
    id: row[0],
    name_en: row[1],
    name_ar: row[2],
    description_en: row[3],
    description_ar: row[4],
    image_url: row[5],
    price: row[6],
  };
}

function buildOgHtml(product, url) {
  const name = product.name_en || 'Produit';
  const desc = (product.description_en || '').slice(0, 200);
  const image = optimizeCloudinary(product.image_url, 800);
  const price = product.price ? `${Math.round(product.price)} DZD` : '';

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${name} | Casa Gaming</title>
  <meta name="description" content="${desc}" />
  <meta property="og:title" content="${name} | Casa Gaming" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="800" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Casa Gaming" />
  <meta property="product:price:amount" content="${price}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${name} | Casa Gaming" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>
  <p>Redirecting to <a href="${url}">Casa Gaming</a>...</p>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, params } = context;
  const slug = params.slug;

  if (!isBot(request)) {
    return context.next();
  }

  try {
    const product = await fetchProduct(slug);
    if (!product) return context.next();

    const html = buildOgHtml(product, request.url);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch {
    return context.next();
  }
}
