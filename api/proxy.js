export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get('symbols');
  if (!symbols) {
    return new Response(JSON.stringify({ error: 'symbols param required' }), { status: 400, headers: corsHeaders });
  }

  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com',
    'Origin': 'https://finance.yahoo.com',
  };

  try {
    // Step 1 — get cookies from Yahoo Finance homepage
    const homeRes = await fetch('https://finance.yahoo.com', { headers: browserHeaders });
    const cookies = homeRes.headers.get('set-cookie') || '';

    // Step 2 — get crumb using those cookies
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { ...browserHeaders, 'Cookie': cookies }
    });
    const crumb = await crumbRes.text();

    if (!crumb || crumb.includes('<')) {
      return new Response(JSON.stringify({ error: 'Could not get crumb' }), { status: 500, headers: corsHeaders });
    }

    // Step 3 — fetch quote data with crumb
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbols}&crumb=${encodeURIComponent(crumb)}&formatted=false&region=MY&lang=en-US`;
    const quoteRes = await fetch(quoteUrl, {
      headers: { ...browserHeaders, 'Cookie': cookies }
    });

    if (!quoteRes.ok) {
      return new Response(JSON.stringify({ error: 'Yahoo returned ' + quoteRes.status }), { status: 500, headers: corsHeaders });
    }

    const data = await quoteRes.json();
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
```

**Step 2 — Commit changes** on GitHub

**Step 3 — Wait for Vercel to redeploy** (~30 seconds)

**Step 4 — Test in browser:**
```
https://YOUR-URL.vercel.app/api/proxy?symbols=1155.KL
