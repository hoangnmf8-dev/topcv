const http = require('node:http');
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/billing/webhook/payos') {
    res.writeHead(404); return res.end('Not found');
  }
  let size = 0; const chunks = [];
  try {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 65536) { res.writeHead(413); res.end(); req.destroy(); return; }
      chunks.push(chunk);
    }
    const response = await fetch('http://127.0.0.1:3100/billing/webhook/payos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: Buffer.concat(chunks), signal: AbortSignal.timeout(10000),
    });
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(await response.text());
  } catch { res.writeHead(502); res.end('Webhook backend unavailable'); }
});
server.requestTimeout = 15000;
server.listen(3101, '127.0.0.1', () => console.log('Webhook-only proxy listening on 3101'));
