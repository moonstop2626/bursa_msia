export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get('symbols');
  if (!symbols) return new Response(JSON.stringify({ error: 'symbols required' }), { status: 400, headers: corsHeaders });

  // YOUR TWELVE DATA API KEY
  const APIKEY = '9355af9a1fb24d0d8c42aff737eb0892';

  // Convert 1155.KL → 1155:KLSE for Twelve Data
  const tdSymbols = symbols.split(',').map(s => s.replace('.KL', ':KLSE')).join(',');

  try {
    const url = `https://api.twelvedata.com/quote?symbol=${tdSymbols}&apikey=${APIKEY}&dp=2`;
    const res = await fetch(url);
    const data = await res.json();

    // Convert Twelve Data format → Yahoo Finance format so dashboard works unchanged
    const rawList = Array.isArray(data) ? data : [data];
    const result = rawList
      .filter(q => q && q.symbol && !q.code)
      .map(q => ({
        symbol: q.symbol.replace(':KLSE', '.KL'),
        shortName: q.name || q.symbol,
        regularMarketPrice: parseFloat(q.close) || null,
        regularMarketChange: parseFloat(q.change) || null,
        regularMarketChangePercent: parseFloat(q.percent_change) || null,
        regularMarketVolume: parseInt(q.volume) || null,
        fiftyTwoWeekHigh: parseFloat(q['52_week']['high']) || null,
        fiftyTwoWeekLow: parseFloat(q['52_week']['low']) || null,
        marketCap: null,
        trailingPE: null,
        trailingAnnualDividendYield: null,
      }));

    return new Response(
      JSON.stringify({ quoteResponse: { result } }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}
```

Replace `PASTE_YOUR_KEY_HERE` with your actual Twelve Data API key.

---

## Step 3 — Commit changes

Scroll down on GitHub → click **Commit changes** → Vercel auto-redeploys in 30 seconds

---

## Step 4 — Test
```
https://YOUR-URL.vercel.app/api/proxy?symbols=1155.KL
