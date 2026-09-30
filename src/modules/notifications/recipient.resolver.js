import { User } from '../users/user.model.js';

function eligibility(user, resolvedBy) {
  if (!user) return null;
  if (user.status !== 'active') return { status: 'recipientInactive', resolvedBy, user };
  if (!user.telegramChatId) return { status: 'recipientNoTelegram', resolvedBy, user };
  return { status: 'resolved', resolvedBy, user };
}

async function findExactlyOne(field, value) {
  if (!value) return { users: [] };
  const users = await User.find({ [field]: String(value).trim() }).limit(2);
  return { users };
}

// Urutan ini mengikuti data sumber webhook: NIK paling tepercaya, lalu username,
// dan nama hanya digunakan bila tidak ada kecocokan sebelumnya.
export async function resolveRecipient({ nik, username, name }) {
  const inputs = [
    ['nik', nik],
    ['username', username],
    ['name', name],
  ];

  for (const [field, value] of inputs) {
    const { users } = await findExactlyOne(field, value);
    if (!users.length) continue;
    if (users.length > 1) return { status: 'recipientAmbiguous', resolvedBy: field, users };
    return eligibility(users[0], field);
  }
  return { status: 'recipientNotFound', resolvedBy: 'none' };
}
