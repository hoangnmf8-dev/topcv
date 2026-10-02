require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });
const { PayOS } = require('@payos/node');
const fs = require('node:fs');
const path = require('node:path');
const logs = fs.readFileSync(path.join(__dirname, '../../.tools/tunnel.err.log'), 'utf8');
const base = logs.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)?.[0];
if (!base) throw new Error('Tunnel URL not ready');
const webhookUrl = base + '/billing/webhook/payos';
const client = new PayOS({ clientId: process.env.PAYOS_CLIENT_ID, apiKey: process.env.PAYOS_API_KEY, checksumKey: process.env.PAYOS_CHECKSUM_KEY, timeout: 20000, maxRetries: 0 });
client.webhooks.confirm(webhookUrl).then(() => {
  fs.writeFileSync(path.join(__dirname, '../../.tools/webhook-url.txt'), webhookUrl);
  console.log('payOS webhook confirmed: ' + webhookUrl);
}).catch(() => { console.error('payOS webhook registration failed; credentials were not logged.'); process.exitCode = 1; });
