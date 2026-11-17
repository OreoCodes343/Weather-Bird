import http from 'node:http';

const PORT = Number(process.env.PORT || 3001);
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR-API-KEY-HERE';

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: response.status,
      data: { message: text || 'Failed to parse response from OpenWeatherMap.' }
    };
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true, message: 'Weather Bird API is running.' });
    return;
  }

  if (url.pathname === '/api/geo' || url.pathname === '/api/weather') {
    const cityName = url.searchParams.get('city') || url.searchParams.get('q');

    if (!cityName) {
      sendJson(res, 400, { message: 'A city name is required.' });
      return;
    }

    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const result = await fetchJson(apiUrl);

    if (!result.ok) {
      sendJson(res, result.status >= 400 ? result.status : 500, {
        message: 'Unable to fetch city coordinates.',
        details: result.data
      });
      return;
    }

    sendJson(res, 200, result.data);
    return;
  }

  if (url.pathname === '/api/forecast') {
    const latitude = url.searchParams.get('lat');
    const longitude = url.searchParams.get('lon');

    if (!latitude || !longitude) {
      sendJson(res, 400, { message: 'Latitude and longitude are required.' });
      return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
    const result = await fetchJson(apiUrl);

    if (!result.ok) {
      sendJson(res, result.status >= 400 ? result.status : 500, {
        message: 'Unable to fetch weather forecast.',
        details: result.data
      });
      return;
    }

    sendJson(res, 200, result.data);
    return;
  }

  if (url.pathname === '/api/reverse-geocode') {
    const latitude = url.searchParams.get('lat');
    const longitude = url.searchParams.get('lon');

    if (!latitude || !longitude) {
      sendJson(res, 400, { message: 'Latitude and longitude are required.' });
      return;
    }

    const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const result = await fetchJson(apiUrl);

    if (!result.ok) {
      sendJson(res, result.status >= 400 ? result.status : 500, {
        message: 'Unable to resolve the city name from coordinates.',
        details: result.data
      });
      return;
    }

    sendJson(res, 200, result.data);
    return;
  }

  sendJson(res, 404, { message: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`Weather Bird API is listening on http://localhost:${PORT}`);
});
