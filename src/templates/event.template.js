const labels = {
  ASSIGN: '📌 ASSIGN',
  REPAIR_UPDATE: '🛠️ UPDATE PERBAIKAN',
  SLA_WARNING: '⏰ PERINGATAN SLA',
  CLOSE: '✅ TIKET SELESAI',
};

export function formatEventMessage(job) {
  const label = labels[job.eventType] ?? `ℹ️ ${job.eventType}`;
  return [
    label,
    '',
    `Tiket: ${job.externalId}`,
    job.title && `Judul: ${job.title}`,
    job.status && `Status: ${job.status}`,
    job.slaDueAt && `Batas SLA: ${new Date(job.slaDueAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
  ].filter(Boolean).join('\n');
}
