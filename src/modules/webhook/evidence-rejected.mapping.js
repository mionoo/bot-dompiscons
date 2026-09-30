export function extractEvidenceRejected(payload) {
  const detail = payload.payload ?? {};
  return {
    eventId: payload.id != null ? String(payload.id) : undefined,
    projectId: payload.project_id != null ? String(payload.project_id) : undefined,
    title: typeof payload.title === 'string' ? payload.title.trim() : undefined,
    projectName: detail.project_name,
    stage: detail.stage,
    evidenceId: detail.evidence_id != null ? String(detail.evidence_id) : undefined,
    evidenceLabel: detail.evidence_label,
    evidenceType: detail.evidence_type,
    reviewNote: detail.review_note,
    isPt2: detail.is_pt2 === true,
    lopName: detail.lop_name,
    recipient: {
      nik: detail.recipient_nik,
      username: detail.recipient_username,
      name: detail.recipient_name,
      assignedRole: detail.recipient_role,
    },
  };
}

export function formatEvidenceRejectedMessage(event) {
  const title = event.title || (event.isPt2 ? 'Eviden PT2 Ditolak' : 'Eviden Ditolak');
  const evidence = event.evidenceLabel || event.evidenceType;
  const stage = event.stage && String(event.stage);
  const details = [
    event.projectName && `Project: ${event.projectName}`,
    event.lopName && `LOP: ${event.lopName}`,
    stage && `Tahap: ${stage.charAt(0).toUpperCase()}${stage.slice(1)}`,
    evidence && `Eviden: ${evidence}`,
  ].filter(Boolean).join('\n');
  return [
    `❌ ${title}`,
    details,
    event.reviewNote && `Catatan:\n${event.reviewNote}`,
  ].filter(Boolean).join('\n\n');
}
