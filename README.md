# bot-dompiscons

Bot Telegram satu-instance untuk menerima webhook internal, menghubungkan NIK ke Telegram, registrasi pengguna, pembaruan akun, dan pengingat SLA.

Semua payload JSON webhook disimpan utuh ke koleksi MongoDB `incoming_webhooks`. Event dengan mapping aktif diproses untuk mengirim notifikasi Telegram; event lainnya tetap disimpan sebagai `unmapped`/`captured`.

`project_assigned` memiliki mapping **aktif** untuk notifikasi penugasan project. Penerima dicari berdasarkan NIK, username, lalu nama. Hasil pencarian penerima dan setiap usaha kirim dicatat di koleksi `notifications`.

`evidence_step_uploaded` memiliki mapping **aktif** untuk notifikasi eviden yang menunggu review.

`evidence_rejected` memiliki mapping **aktif** untuk notifikasi penolakan eviden. Judul menggunakan `title` dari event webhook; jika kosong, gunakan “Eviden PT2 Ditolak” ketika `payload.is_pt2 === true`, atau “Eviden Ditolak”. Pesan memuat project, tahap, label eviden (atau tipe jika label tidak tersedia), catatan review, dan LOP jika tersedia. Penerima mengikuti pencarian NIK, username, lalu nama. Mapping ini berlaku untuk webhook baru dan tidak memproses ulang arsip secara otomatis.

Pengiriman Telegram mengulang maksimal tiga kali untuk gangguan koneksi sementara, dengan jeda 2, 5, lalu 10 detik. Respons flood-control Telegram mengikuti waktu tunggu yang diberikan Telegram. Error permanen tetap langsung dicatat sebagai gagal.

## Persiapan

1. Salin `.env.example` menjadi `.env`, lalu isi token bot dan koneksi MongoDB.
2. Isi `WEBHOOK_ALLOWED_IPS` dengan alamat IP CT pengirim webhook.
3. Jalankan `npm install`, kemudian `npm run dev`.

Endpoint webhook internal: `POST /api/webhook/events`.

Contoh payload:

```json
{ "eventId": "evt-001", "eventType": "assign", "ticketId": "INC-001", "assignedNik": "1234567890" }
```

Setiap dokumen webhook juga menyimpan IP pengirim, waktu diterima, `event_type` asli, ID event/project bila tersedia, dan status `unmapped`/`captured`.

## Command bot

- `/start` — hubungkan akun Telegram dengan NIK atau username yang telah ada dan ubah statusnya menjadi `active`. Jika branch belum terisi, bot meminta pengguna memilih branch.
- `/register` — registrasi NIK, nama, branch, dan role dengan konfirmasi tombol. Data baru disimpan berstatus `needConfirm`.
- `/akun` — tampilkan data akun yang telah dihubungkan.
- `/cancel` — batalkan proses aktif.
- `/cekconfirm` — khusus superadmin, tampilkan daftar akun berstatus `needConfirm`. Alias: `/cekacc`.
- `/acc_nik_telegramId` — khusus superadmin, ubah akun `needConfirm` menjadi `active`; contoh: `/acc_19930270_68619032`.

Semua command dan tombol pengelolaan akun hanya dapat digunakan melalui chat pribadi dengan bot, bukan dalam grup, supergrup, atau channel.

Daftar branch dan role berada di `src/config/user-options.js`; tambahkan nilai baru pada file tersebut bila dibutuhkan.
