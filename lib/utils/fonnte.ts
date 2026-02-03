"use client";

/**
 * Utilitas Pengiriman WhatsApp via Fonnte
 * Pastikan API Key disimpan di .env.local untuk keamanan
 */

const FONNTE_TOKEN =
  process.env.NEXT_PUBLIC_FONNTE_TOKEN || "API_KEY_ANDA_DISINI";

export const sendWhatsAppMessage = async (target: string, message: string) => {
  try {
    // Validasi nomor telepon (pastikan berformat 62...)
    const formattedTarget = target.startsWith("0")
      ? "62" + target.slice(1)
      : target;

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: new URLSearchParams({
        target: formattedTarget,
        message: message,
        countryCode: "62", // Default Indonesia
      }),
    });

    const result = await response.json();

    if (result.status) {
      return { success: true, message: "Pesan terkirim ke WhatsApp" };
    } else {
      throw new Error(result.reason || "Gagal mengirim pesan");
    }
  } catch (error: any) {
    console.error("Fonnte Error:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Template Pesan Pengingat Otomatis
 */
export const createReminderTemplate = (data: {
  nama: string;
  tanggal: string;
  jam: string;
  dokter: string;
}) => {
  return `✨ *PENGINGAT KUNJUNGAN D'AESTHETIC* ✨

Halo, Kak *${data.nama}*!

Sekadar mengingatkan jadwal perawatan Kakak hari ini:
📅 *Tanggal:* ${data.tanggal}
⏰ *Jam Sesi:* ${data.jam} WIB
👩‍⚕️ *Dokter:* dr. ${data.dokter}

Mohon hadir 15 menit sebelum sesi dimulai ya, Kak. Sampai jumpa di klinik! ✨

_Arsip Digital D'Aesthetic Intelligence_`;
};
