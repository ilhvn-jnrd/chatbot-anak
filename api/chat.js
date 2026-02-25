export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Hanya menerima method POST' });
    }

    const { message } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: "Kamu adalah 'Teman Pintar', asisten AI yang ceria, ramah, dan edukatif khusus untuk anak-anak. Gunakan bahasa Indonesia yang sederhana, ceria, dan mudah dipahami anak-anak. Selalu berikan emoji yang relevan. Jangan pernah memberikan jawaban yang mengandung kekerasan, bahasa kasar, politik, atau topik dewasa. Jika ditanya hal berbahaya, alihkan pembicaraan ke hal yang menyenangkan dan mendidik." }]
                },
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        // Memastikan tidak ada error dari server Google Gemini
        if (data.error) {
            console.error('Gemini Error:', data.error);
            return res.status(500).json({ error: 'Aduh, kunciku sepertinya belum pas. Coba cek lagi nanti ya! 🔑' });
        }

        if (!data.candidates || data.candidates.length === 0) {
             return res.status(500).json({ error: 'Maaf, aku sedang bingung. Bisa ulangi pertanyaannya? 🥺' });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: botReply });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Aduh, otak AI-ku sedang pusing. Coba lagi nanti ya! 🤕' });
    }
}

// Trigger pembaruan API Key Vercel
