// netlify/functions/firefighter-news.mjs
export default async (req, context) => {
  const { url } = req;
  const u = new URL(url);
  const freshness = u.searchParams.get('freshness') || 'Day'; // Hour | Day | Week
  const q = 'evansville firefighter';

  const key = process.env.BING_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'BING_API_KEY not set', articles: [] }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }

  const endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';
  const params = new URLSearchParams({
    q,
    mkt: 'en-US',
    sortBy: 'Date',
    freshness, // Hour | Day | Week
    count: '20',
    safeSearch: 'Off',
    textFormat: 'Raw'
  });

  try {
    const resp = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { 'Ocp-Apim-Subscription-Key': key }
    });
    if (!resp.ok) throw new Error('Upstream ' + resp.status);
    const data = await resp.json();
    const articles = (data.value || []).map(x => ({
      name: x.name,
      url: x.url,
      description: x.description,
      datePublished: x.datePublished,
      provider: (x.provider && x.provider[0] && x.provider[0].name) || ''
    }));
    return new Response(JSON.stringify({ articles }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, articles: [] }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }
};
