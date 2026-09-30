import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nik: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  username: { type: String, index: true, sparse: true },
  branch: String,
  role: String,
  telegramChatId: { type: String, unique: true, sparse: true },
  telegramUsername: String,
  // Nilai lama, mis. "not", dibiarkan tetap valid. Data register baru memakai needConfirm.
  status: { type: String, default: 'needConfirm', index: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
