import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true, index: true },
  eventId: { type: String, unique: true, sparse: true, index: true },
  eventType: { type: String, required: true },
  title: String,
  status: String,
  assignedNik: String,
  slaDueAt: Date,
  lastSlaAlertAt: Date,
  rawPayload: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
