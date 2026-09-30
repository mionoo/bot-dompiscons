import { Router } from 'express';
import { internalWebhookOnly } from '../../security/webhook-auth.middleware.js';
import { receiveWebhook } from './webhook.controller.js';

export const webhookRouter = Router();
webhookRouter.post('/events', internalWebhookOnly, receiveWebhook);
