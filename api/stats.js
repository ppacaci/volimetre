const PAGE_LIMIT = 100;
const TOOL_LIMIT = 50;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function clampDays(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 30;
  return Math.max(1, Math.min(90, Math.round(n)));
}

function qs(params) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') s.set(key, String(value));
  });
  return s.toString();
}

async function queryAnalytics(path, baseParams, token) {
  const url = 'https://api.vercel.com/v1/query/web-analytics/' + path + '?' + qs(baseParams);
  const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || body?.message || ('Vercel Analytics API ' + response.status);
    throw new Error(message);
  }
  return body;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.VOLIMETRE_VERCEL_TOKEN;
  const projectId = process.env.VOLIMETRE_VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID;
  const teamRef = process.env.VOLIMETRE_VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return res.status(503).json({
      error: 'analytics_not_configured',
      message: 'Vercel Analytics API bağlantısı için VOLIMETRE_VERCEL_TOKEN ve VOLIMETRE_VERCEL_PROJECT_ID gerekli.'
    });
  }

  const days = clampDays(req.query?.days);
  const untilDate = new Date();
  const sinceDate = new Date(untilDate);
  sinceDate.setUTCDate(sinceDate.getUTCDate() - (days - 1));

  const common = {
    projectId,
    since: isoDate(sinceDate),
    until: isoDate(untilDate)
  };
  if (teamRef) {
    if (String(teamRef).startsWith('team_')) common.teamId = teamRef;
    else common.slug = teamRef;
  }

  try {
    const visits = await queryAnalytics(
      'visits/aggregate',
      { ...common, by: 'requestPath', limit: PAGE_LIMIT },
      token
    );

    const rows = Array.isArray(visits.data) ? visits.data : [];
    const pages = [];
    const toolRows = [];

    rows.forEach(row => {
      const path = row.requestPath || row.path || '/';
      const pageviews = Number(row.pageviews) || Number(row.count) || 0;
      const visitors = Number(row.visitors) || 0;

      if (path.startsWith('/__tool-use/')) {
        toolRows.push({
          tool: path.slice('/__tool-use/'.length) || 'unknown',
          uses: pageviews,
          visitors
        });
      } else {
        pages.push({ path, pageviews, visitors });
      }
    });

    pages.sort((a, b) => b.pageviews - a.pageviews);
    toolRows.sort((a, b) => b.uses - a.uses);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({
      period: { days, since: common.since, until: common.until },
      pages,
      tools: toolRows
    });
  } catch (error) {
    return res.status(502).json({
      error: 'analytics_query_failed',
      message: error && error.message ? error.message : 'Vercel Analytics verileri alınamadı.'
    });
  }
};