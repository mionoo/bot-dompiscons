const EVENT_LABELS = {
  stage_review_requested: { icon: '🔍', title: 'Review Tahap Project', message: 'Mohon lakukan review tahap project.' },
  sdi_verification_requested: { icon: '📋', title: 'Verifikasi Golive', message: 'Mohon upload eviden UIM agar project segera Golive.' },
  project_golive: { icon: '✅', title: 'Project Sudah Golive', message: 'Project yang Anda kerjakan sudah berhasil Golive.' },
};

function textValue(value) {
  return typeof value === 'string' ? value.trim() : undefined;
}

export function extractProjectWorkflow(payload, eventType) {
  const detail = payload.payload ?? {};
  return {
    eventType,
    eventId: payload.id != null ? String(payload.id) : undefined,
    projectId: payload.project_id != null ? String(payload.project_id) : undefined,
    title: textValue(payload.title),
    message: textValue(payload.message),
    projectCode: detail.pid,
    projectName: detail.project_name,
    lopName: detail.lop_name,
    stageLabel: textValue(detail.stage_label),
    stageCode: textValue(detail.stage_code),
    recipientType: payload.recipient_type,
    recipientRole: payload.recipient_role,
    recipient: {
      nik: detail.recipient_nik,
      username: detail.recipient_username,
      name: detail.recipient_name,
      assignedRole: detail.recipient_role,
    },
  };
}

export function formatProjectWorkflowMessage(event) {
  const label = EVENT_LABELS[event.eventType];
  if (!label) throw new Error(`Format pesan tidak tersedia untuk ${event.eventType}`);
  const stage = event.stageLabel || event.stageCode;
  const details = [
    event.projectCode && `PID: ${event.projectCode}`,
    event.projectName && `Project: ${event.projectName}`,
    event.lopName && `LOP: ${event.lopName}`,
    stage && `Tahap: ${stage}`,
  ].filter(Boolean).join('\n');
  return [
    `${label.icon} ${event.title || label.title}`,
    details,
    event.message || label.message,
  ].filter(Boolean).join('\n\n');
}
