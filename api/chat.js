export default async function handler(req, res) {
    // Memastikan hanya menerima permintaan pengiriman pesan
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Hanya menerima method POST' });
    }

    const { message } = req.body;

    try {
        // Menghubungi API Gemini menggunakan kunci rahasia dari Vercel
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
                // Catatan: Keamanan anak-anak dan kepribadian bot akan kita tambahkan di sini pada Fase 4!
            })
        });

        const data = await response.json();
        
        // Mengambil teks balasan dari AI
        const botReply = data.candidates[0].content.parts[0].text;
        
        // Mengirimkan balasan kembali ke website kita
        return res.status(200).json({ reply: botReply });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Aduh, otak AI-ku sedang pusing. Coba lagi nanti ya!' });
    }
}
