export function describeIncomingWebhook(payload, sourceIp) {
  const rawEventType = payload.event_type ?? payload.eventType ?? 'UNKNOWN';
  const sourceCreatedAt = payload.created_at ?? payload.createdAt;
  const date = sourceCreatedAt ? new Date(sourceCreatedAt) : undefined;

  return {
    sourceIp,
    eventTypeRaw: String(rawEventType),
    externalEventId: payload.id ? String(payload.id) : undefined,
    externalProjectId: payload.project_id ? String(payload.project_id) : undefined,
    sourceCreatedAt: date instanceof Date && !Number.isNaN(date.valueOf()) ? date : undefined,
    payload,
  };
}
