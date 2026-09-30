export function extractEvidenceStepUploaded(payload) {
  const detail = payload.payload ?? {};
  return {
    eventId: payload.id ? String(payload.id) : undefined,
    projectId: payload.project_id ? String(payload.project_id) : undefined,
    projectCode: detail.pid,
    projectName: detail.project_name,
    stage: detail.stage,
    uploaderName: detail.uploader_name,
    uploaderRole: detail.uploader_role,
    sourceCreatedAt: payload.created_at,
    recipient: {
      nik: detail.recipient_nik,
      username: detail.recipient_username,
      name: detail.recipient_name,
      assignedRole: detail.recipient_role,
    },
  };
}

export function formatEvidenceStepUploadedMessage(event) {
  const eventTime = event.sourceCreatedAt
    ? new Date(event.sourceCreatedAt).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    : undefined;
  return [
    '📎 EVIDEN TAHAP DIUPLOAD',
    '━━━━━━━━━━━━━━━━━━━━',
    event.projectCode && `🏷️ KODE PROJECT\n${event.projectCode}`,
    event.projectName && `📁 NAMA PROJECT\n${event.projectName}`,
    event.stage && `📋 TAHAP\n${String(event.stage).toUpperCase()}`,
    event.uploaderName && `👤 DIUPLOAD OLEH\n${event.uploaderName}${event.uploaderRole ? `\nPosisi: ${String(event.uploaderRole).toUpperCase()}` : ''}`,
    '⏳ TINDAKAN DIPERLUKAN\nEviden menunggu review Anda.',
    eventTime && `🕒 WAKTU EVENT\n${eventTime} WIB`,
  ].filter(Boolean).join('\n\n');
}
