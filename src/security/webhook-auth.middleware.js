import { env } from '../config/env.js';

export function internalWebhookOnly(req, res, next) {
  if (!env.allowedWebhookIps.length) return next();
  const sourceIp = req.ip.replace('::ffff:', '');
  if (!env.allowedWebhookIps.includes(sourceIp)) return res.status(403).json({ ok: false, error: 'IP pengirim tidak diizinkan' });
  next();
}
