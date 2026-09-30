import { Router } from 'express';
import { webhookRouter } from '../modules/webhook/webhook.route.js';

export const router = Router();
router.use('/webhook', webhookRouter);
router.get('/health', (_req, res) => res.json({ ok: true, service: 'bot-dompiscons', mode: 'capture-only' }));
