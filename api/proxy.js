export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols param required' });

  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbols}&formatted=false&region=MY`,
    `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${symbols}&formatted=false&region=MY`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://finance.yahoo.com/quote/' + symbols.split(',')[0],
    'Origin': 'https://finance.yahoo.com',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
  };

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) continue;
      const data = await response.json();
      if (data?.quoteResponse?.result?.length > 0) {
        return res.status(200).json(data);
      }
    } catch(e) { continue; }
  }

  return res.status(500).json({ error: 'All Yahoo endpoints failed' });
}
