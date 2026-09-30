export function extractProjectAssigned(payload) {
  const detail = payload.payload ?? {};
  return {
    eventId: payload.id ? String(payload.id) : undefined,
    projectId: payload.project_id ? String(payload.project_id) : undefined,
    projectCode: detail.pid,
    projectName: detail.project_name,
    isReassign: Boolean(detail.is_reassign),
    sourceCreatedAt: payload.created_at,
    recipient: {
      nik: detail.recipient_nik,
      username: detail.recipient_username,
      name: detail.recipient_name,
      assignedRole: detail.role_assigned_as,
    },
  };
}

export function formatProjectAssignedMessage(event) {
  const role = event.recipient.assignedRole?.toUpperCase();
  const eventTime = event.sourceCreatedAt
    ? new Date(event.sourceCreatedAt).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    : undefined;
  return [
    event.isReassign ? '📌 PROJECT DI-ASSIGN ULANG' : '📌 PROJECT DI-ASSIGN',
    '━━━━━━━━━━━━━━━━━━━━',
    event.projectCode && `🏷️ KODE PROJECT\n${event.projectCode}`,
    event.projectName && `📁 NAMA PROJECT\n${event.projectName}`,
    role && `👤 PENUGASAN\nPosisi: ${role}`,
    '',
    role
      ? `Anda ditugaskan sebagai ${role} untuk project ini.`
      : 'Anda ditugaskan untuk project ini.',
    eventTime && `🕒 WAKTU EVENT\n${eventTime} WIB`,
  ].filter(Boolean).join('\n\n');
}
