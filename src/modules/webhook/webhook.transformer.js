const eventMap = {
  assign: 'ASSIGN',
  repair: 'REPAIR_UPDATE',
  repair_update: 'REPAIR_UPDATE',
  close: 'CLOSE',
};

export function normalizeWebhook(payload) {
  return {
    eventId: payload.eventId ?? payload.id,
    eventType: eventMap[String(payload.eventType).toLowerCase()] ?? String(payload.eventType).toUpperCase(),
    ticketId: payload.ticketId ?? payload.ticket_id,
    title: payload.title ?? payload.subject,
    status: payload.status,
    assignedNik: payload.assignedNik ?? payload.assigned_nik,
    slaDueAt: payload.slaDueAt ?? payload.sla_due_at,
    rawPayload: payload,
  };
}
