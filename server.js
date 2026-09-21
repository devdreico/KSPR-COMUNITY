import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const ACCESS_CODES_FILE = path.join(__dirname, 'access-codes.md');
const MERCADO_PAGO_API = 'https://api.mercadopago.com';

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const PUBLIC_DIR = NODE_ENV === 'production'
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'public');
const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || '').trim();
const MP_WEBHOOK_SECRET = (process.env.MP_WEBHOOK_SECRET || '').trim();
const FORMSPREE_ENDPOINT = (
  process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mvkgojge'
).trim();
const PRODUCT_NAME = process.env.PRODUCT_NAME || 'KSPR CLI — Licencia permanente';
const LICENSE_CURRENCY = (process.env.LICENSE_CURRENCY || 'COP').toUpperCase();
const LICENSE_PRICE = Number(process.env.LICENSE_PRICE || 21000);
const LICENSE_PRICE_USD = 5;
const CONFIGURED_APP_URL = (process.env.APP_URL || '').trim().replace(/\/$/, '');
const LICENSE_RESERVATION_MINUTES = 30;

if (!Number.isFinite(LICENSE_PRICE) || LICENSE_PRICE <= 0) {
  throw new Error('LICENSE_PRICE debe ser un número mayor que cero.');
}

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, '{}\n', { mode: 0o600 });
}

function readOrders() {
  try {
    const value = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    console.error('[storage] No se pudo leer orders.json:', error.message);
    return {};
  }
}

function writeJsonAtomic(filename, value) {
  const temporaryFile = `${filename}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.renameSync(temporaryFile, filename);
}

function releaseExpiredReservations(orders) {
  const now = Date.now();
  let changed = false;
  for (const order of Object.values(orders)) {
    const reservationExpiresAt = Date.parse(order?.reservationExpiresAt || '');
    if (
      order?.licenseKey &&
      Number.isFinite(reservationExpiresAt) &&
      reservationExpiresAt <= now &&
      !['delivery_pending', 'delivered'].includes(order.status)
    ) {
      delete order.licenseKey;
      delete order.reservationExpiresAt;
      if (order.status === 'created' || order.status === 'awaiting_payment' || order.status === 'payment_pending') {
        order.status = 'reservation_expired';
      }
      order.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  return changed;
}

function readOrdersForInventory() {
  const orders = readOrders();
  if (releaseExpiredReservations(orders)) writeJsonAtomic(ORDERS_FILE, orders);
  return orders;
}

function getAppUrl(req) {
  if (CONFIGURED_APP_URL) return CONFIGURED_APP_URL;
  const protocol = req.get('x-forwarded-proto')?.split(',')[0].trim() || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

function normalizeLine(value) {
  return String(value || '')
    .trim()
    .replace(/^[-*]\s+/, '')
    .trim();
}

function readInventoryCodes() {
  const environmentCodes = (process.env.LICENSE_KEYS || '')
    .split(',')
    .map(normalizeLine)
    .filter(Boolean);

  let fileCodes = [];
  try {
    const file = fs.readFileSync(ACCESS_CODES_FILE, 'utf8');
    const start = file.indexOf('<!-- LICENSE_KEYS_START -->');
    const end = file.indexOf('<!-- LICENSE_KEYS_END -->');
    if (start !== -1 && end > start) {
      fileCodes = file
        .slice(start + '<!-- LICENSE_KEYS_START -->'.length, end)
        .split(/\r?\n/)
        .map(normalizeLine)
        .filter((line) => line && !line.startsWith('#') && !line.startsWith('<!--'));
    }
  } catch (error) {
    console.error('[inventory] No se pudo leer access-codes.md:', error.message);
  }

  return [...new Set([...environmentCodes, ...fileCodes])];
}

function getAvailableCodes(orders = readOrdersForInventory()) {
  const alreadyAssigned = new Set(
    Object.values(orders)
      .map((order) => order?.licenseKey)
      .filter(Boolean),
  );
  return readInventoryCodes().filter((code) => !alreadyAssigned.has(code));
}

function cleanName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 254);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatAmount(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: LICENSE_CURRENCY,
    maximumFractionDigits: LICENSE_CURRENCY === 'COP' ? 0 : 2,
  }).format(amount);
}

function safeTimingEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseSignatureHeader(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim().split('='))
    .filter(([key, val]) => key && val)
    .reduce((result, [key, val]) => ({ ...result, [key]: val }), {});
}

function verifyMercadoPagoSignature(req, body) {
  // Durante el desarrollo local se permite omitir el secreto para poder probar
  // la ruta manualmente. En producción sí es obligatorio.
  if (!MP_WEBHOOK_SECRET) return NODE_ENV !== 'production';

  const signature = parseSignatureHeader(req.get('x-signature'));
  const requestId = req.get('x-request-id') || '';
  const timestamp = signature.ts || '';
  const receivedHash = signature.v1 || '';
  const possibleIds = [
    body?.data?.id,
    body?.id,
    req.query['data.id'],
    req.query.id,
  ]
    .filter(Boolean)
    .map(String);

  if (!timestamp || !receivedHash || !requestId || possibleIds.length === 0) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 900) {
    return false;
  }

  return possibleIds.some((id) => {
    const manifest = `id:${id};request-id:${requestId};ts:${timestamp};`;
    const expectedHash = crypto
      .createHmac('sha256', MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');
    return safeTimingEqual(expectedHash, receivedHash);
  });
}

async function readResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function mercadoPagoRequest(endpoint, options = {}) {
  if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN no está configurado.');

  const response = await fetch(`${MERCADO_PAGO_API}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      ...(options.headers || {}),
    },
  });
  const data = await readResponse(response);
  if (!response.ok) {
    const detail = data?.message || data?.error || response.statusText;
    throw new Error(`Mercado Pago respondió ${response.status}: ${detail}`);
  }
  return data;
}

async function createMercadoPagoPreference({ order, baseUrl }) {
  const successUrl = `${baseUrl}/resultado?order_id=${encodeURIComponent(order.id)}&status=success`;
  const pendingUrl = `${baseUrl}/resultado?order_id=${encodeURIComponent(order.id)}&status=pending`;
  const failureUrl = `${baseUrl}/resultado?order_id=${encodeURIComponent(order.id)}&status=failure`;

  return mercadoPagoRequest('/checkout/preferences', {
    method: 'POST',
    headers: {
      'X-Idempotency-Key': order.id,
    },
    body: JSON.stringify({
      items: [
        {
          id: 'kspr-cli-permanent-license',
          title: PRODUCT_NAME,
          description: 'Licencia de uso permanente para KSPR CLI.',
          quantity: 1,
          currency_id: LICENSE_CURRENCY,
          unit_price: LICENSE_PRICE,
        },
      ],
      payer: {
        name: order.name,
        email: order.email,
      },
      external_reference: order.id,
      metadata: {
        order_id: order.id,
      },
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
    }),
  });
}

async function getMercadoPagoPayment(paymentId) {
  return mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

async function sendPaymentConfirmation(order, payment) {
  const message = [
    'CONFIRMACIÓN DE PAGO — KSPR CLI',
    '',
    `Nombre y apellido: ${order.name}`,
    `Correo electrónico: ${order.email}`,
    `KEY de uso permanente: ${order.licenseKey}`,
    '',
    `Producto: ${PRODUCT_NAME}`,
    `Monto: ${formatAmount(order.amount)}`,
    `Moneda: ${order.currency}`,
    `Estado del pago: ${payment.status}`,
    `ID de pago Mercado Pago: ${payment.id}`,
    `Referencia interna: ${order.id}`,
    `Fecha de confirmación: ${new Date().toISOString()}`,
  ].join('\n');

  const form = new URLSearchParams({
    name: order.name,
    email: order.email,
    subject: `Pago confirmado — ${PRODUCT_NAME}`,
    message,
  });

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form,
  });

  const data = await readResponse(response);
  if (!response.ok) {
    const detail = data?.error || data?.message || response.statusText;
    throw new Error(`Formspree respondió ${response.status}: ${detail}`);
  }
}

const orderLocks = new Map();

async function withOrderLock(orderId, callback) {
  const previous = orderLocks.get(orderId) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  orderLocks.set(orderId, current);
  await previous;
  try {
    return await callback();
  } finally {
    release();
    if (orderLocks.get(orderId) === current) orderLocks.delete(orderId);
  }
}

async function processApprovedPayment(payment) {
  const orderId = payment.external_reference || payment.metadata?.order_id;
  if (!orderId) return { handled: false, reason: 'missing_order_reference' };

  return withOrderLock(orderId, async () => {
    const orders = readOrders();
    const order = orders[orderId];
    if (!order) return { handled: false, reason: 'order_not_found' };
    if (order.status === 'delivered' && order.licenseKey) {
      return { handled: true, delivered: true };
    }

    if (payment.status !== 'approved') {
      order.status = `payment_${payment.status || 'unknown'}`;
      order.paymentId = String(payment.id || '');
      order.paymentStatusDetail = payment.status_detail || '';
      if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status)) {
        delete order.licenseKey;
        delete order.reservationExpiresAt;
      }
      order.updatedAt = new Date().toISOString();
      writeJsonAtomic(ORDERS_FILE, orders);
      return { handled: true, delivered: false };
    }

    const amountMatches = Number(payment.transaction_amount) === Number(order.amount);
    const currencyMatches = String(payment.currency_id || '').toUpperCase() === order.currency;
    const referenceMatches = String(payment.external_reference || '') === order.id;
    if (!amountMatches || !currencyMatches || !referenceMatches) {
      order.status = 'payment_mismatch';
      order.paymentId = String(payment.id || '');
      order.updatedAt = new Date().toISOString();
      writeJsonAtomic(ORDERS_FILE, orders);
      console.error(`[payment] Pago rechazado por inconsistencia para la orden ${order.id}.`);
      return { handled: true, delivered: false, mismatch: true };
    }

    if (!order.licenseKey) {
      const availableCodes = getAvailableCodes(orders);
      if (availableCodes.length === 0) {
        order.status = 'paid_waiting_license';
        order.paymentId = String(payment.id || '');
        order.updatedAt = new Date().toISOString();
        writeJsonAtomic(ORDERS_FILE, orders);
        console.error(`[inventory] Pago aprobado sin claves disponibles para la orden ${order.id}.`);
        return { handled: true, delivered: false, waitingForLicense: true };
      }
      order.licenseKey = availableCodes[0];
    }

    order.status = 'delivery_pending';
    order.paymentId = String(payment.id || '');
    order.paymentStatusDetail = payment.status_detail || '';
    order.updatedAt = new Date().toISOString();
    writeJsonAtomic(ORDERS_FILE, orders);

    try {
      await sendPaymentConfirmation(order, payment);
    } catch (error) {
      order.lastDeliveryError = error.message;
      order.updatedAt = new Date().toISOString();
      writeJsonAtomic(ORDERS_FILE, orders);
      throw error;
    }

    order.status = 'delivered';
    order.formspreeSentAt = new Date().toISOString();
    order.deliveredAt = order.formspreeSentAt;
    delete order.lastDeliveryError;
    order.updatedAt = order.formspreeSentAt;
    writeJsonAtomic(ORDERS_FILE, orders);
    return { handled: true, delivered: true };
  });
}

const app = express();
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
// CORS for Vite dev server
if (NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}
app.use(express.json({ limit: '32kb' }));

app.get('/api/config', (req, res) => {
  const available = getAvailableCodes().length > 0;
  res.json({
    productName: PRODUCT_NAME,
    price: LICENSE_PRICE,
    currency: LICENSE_CURRENCY,
    priceUSD: LICENSE_PRICE_USD,
    canPurchase: Boolean(MP_ACCESS_TOKEN && available),
    paymentConfigured: Boolean(MP_ACCESS_TOKEN),
    inventoryAvailable: available,
  });
});

app.post('/api/checkout', async (req, res) => {
  const name = cleanName(req.body?.name);
  const email = cleanEmail(req.body?.email);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Escribe tu nombre y apellido.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Escribe un correo electrónico válido.' });
  }
  if (!MP_ACCESS_TOKEN) {
    return res.status(503).json({ error: 'El checkout todavía no está configurado.' });
  }
  try {
    const result = await withOrderLock('inventory', async () => {
      const orders = readOrdersForInventory();
      const availableCodes = getAvailableCodes(orders);
      if (availableCodes.length === 0) {
        const error = new Error('NO_LICENSES_AVAILABLE');
        error.statusCode = 503;
        throw error;
      }

      const order = {
        id: crypto.randomUUID(),
        name,
        email,
        amount: LICENSE_PRICE,
        currency: LICENSE_CURRENCY,
        product: PRODUCT_NAME,
        status: 'created',
        licenseKey: availableCodes[0],
        reservationExpiresAt: new Date(Date.now() + LICENSE_RESERVATION_MINUTES * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      orders[order.id] = order;
      writeJsonAtomic(ORDERS_FILE, orders);

      try {
        const preference = await createMercadoPagoPreference({
          order,
          baseUrl: getAppUrl(req),
        });
        order.preferenceId = String(preference.id || '');
        order.status = 'awaiting_payment';
        order.updatedAt = new Date().toISOString();
        orders[order.id] = order;
        writeJsonAtomic(ORDERS_FILE, orders);

        const checkoutUrl = preference.init_point || preference.sandbox_init_point;
        if (!checkoutUrl) throw new Error('Mercado Pago no devolvió una URL de checkout.');
        return { orderId: order.id, checkoutUrl };
      } catch (error) {
        delete orders[order.id];
        writeJsonAtomic(ORDERS_FILE, orders);
        throw error;
      }
    });
    return res.json(result);
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({ error: 'En este momento no hay licencias disponibles.' });
    }
    console.error('[checkout] No se pudo crear la preferencia:', error.message);
    return res.status(502).json({ error: 'No pudimos iniciar el pago. Inténtalo de nuevo.' });
  }
});

app.get('/api/orders/:orderId/status', (req, res) => {
  const orderId = String(req.params.orderId || '');
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return res.status(400).json({ error: 'Referencia de orden inválida.' });
  }

  const order = readOrders()[orderId];
  if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });

  return res.json({
    orderId: order.id,
    status: order.status,
    delivered: order.status === 'delivered',
    licenseKey: order.status === 'delivered' ? order.licenseKey : undefined,
  });
});

app.post('/api/webhooks/mercadopago', async (req, res) => {
  if (!verifyMercadoPagoSignature(req, req.body)) {
    return res.status(401).json({ error: 'Firma de webhook inválida.' });
  }

  const notificationType = req.body?.type || req.query.type;
  const paymentId = req.body?.data?.id || req.query['data.id'] || req.query.id;
  if (notificationType !== 'payment' || !paymentId) {
    return res.status(200).json({ received: true, ignored: true });
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId);
    const result = await processApprovedPayment(payment);
    if (result.waitingForLicense) {
      return res.status(503).json({ received: true, retry: true });
    }
    return res.status(200).json({ received: true, ...result });
  } catch (error) {
    console.error(`[webhook] No se pudo procesar el pago ${paymentId}:`, error.message);
    return res.status(503).json({ received: false, retry: true });
  }
});

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
// In production, serve the Vite SPA for all non-API routes
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  const inventoryCount = getAvailableCodes().length;
  console.log(`KSPR CLI checkout escuchando en http://localhost:${PORT}`);
  console.log(`Licencias disponibles: ${inventoryCount}`);
  if (!MP_ACCESS_TOKEN) console.warn('MP_ACCESS_TOKEN no está configurado.');
  if (NODE_ENV === 'production' && !MP_WEBHOOK_SECRET) {
    console.warn('MP_WEBHOOK_SECRET es obligatorio en producción para aceptar webhooks.');
  }
});
