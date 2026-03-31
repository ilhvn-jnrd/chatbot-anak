export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Hanya menerima method POST' });
    }

    // Mengambil 'history' (seluruh riwayat chat) dari frontend
    const { history } = req.body;

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Vercel belum membaca API Key. Brankas kosong.' });
        }

        // Menyusun ulang history agar sesuai dengan format yang diminta Google Gemini
        const formattedContents = history.map((msg, index) => {
            let text = msg.text;
            // Menyuntikkan karakter "Teman Pintar" secara gaib hanya pada pesan pertama
            if (index === 0 && msg.role === 'user') {
                text = "Kamu adalah 'Teman Pintar', asisten AI anak-anak yang ceria, ramah, dan edukatif. Jangan bahas topik dewasa/kasar/politik. Jawab pertanyaan berikut dengan bahasa anak-anak dan gunakan emoji: \n\n" + text;
            }
            return {
                role: msg.role,
                parts: [{ text: text }]
            };
        });

        // PERUBAHAN DI SINI: Menggunakan versi terbaru gemini-2.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: formattedContents // Memasukkan buku riwayat yang sudah disusun
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: `🚨 Error dari Google: ${data.error.message}` });
        }

        if (!data.candidates || data.candidates.length === 0) {
             return res.status(500).json({ error: 'AI tidak mengembalikan jawaban.' });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: botReply });
    } catch (error) {
        return res.status(500).json({ error: `🚨 Error Sistem: ${error.message}` });
    }
}
