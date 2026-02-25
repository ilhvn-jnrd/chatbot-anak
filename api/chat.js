export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Hanya menerima method POST' });
    }

    const { message } = req.body;

    try {
        // Pengecekan pertama: Apakah Vercel benar-benar membaca API Key?
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Vercel belum membaca API Key. Brankas kosong.' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    role: "user", 
                    parts: [{ text: "Kamu adalah 'Teman Pintar', asisten AI anak-anak yang ceria, ramah, dan edukatif. Jangan bahas topik dewasa/kasar/politik. Jawab pertanyaan berikut dengan bahasa anak-anak dan gunakan emoji: " + message }] 
                }]
            })
        });

        const data = await response.json();
        
        // Menampilkan pesan error ASLI dari Google jika terjadi kegagalan
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
