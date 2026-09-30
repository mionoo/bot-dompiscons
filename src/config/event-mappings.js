// Mapping baru dimulai sebagai draft. Ubah status menjadi "active" hanya setelah
// format webhook telah diverifikasi dan siap mengirim notifikasi.
export const EVENT_MAPPINGS = {
  project_assigned: {
    internalType: 'PROJECT_ASSIGNED',
    // status: 'draft',
    status: 'active',
    description: 'Penugasan atau penugasan ulang project kepada user.',
  },
  evidence_step_uploaded: {
    internalType: 'EVIDENCE_STEP_UPLOADED',
    // status: 'draft',
    status: 'active',
    description: 'Eviden tahap project telah diunggah dan menunggu review penerima.',
  },
  evidence_rejected: {
    internalType: 'EVIDENCE_REJECTED',
    status: 'active',
    description: 'Eviden ditolak; kirim catatan review kepada penerima.',
  },
};

export function getEventMapping(eventType) {
  return EVENT_MAPPINGS[String(eventType ?? '').toLowerCase()];
}
