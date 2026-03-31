const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// INI KUNCI PERMANENNYA: Mengambil memori dari brankas browser (localStorage) jika ada.
let conversationHistory = JSON.parse(localStorage.getItem('temanPintarHistory')) || [];

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    // Membaca baris baru dengan benar
    messageElement.innerHTML = message.replace(/\n/g, '<br>');
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// FUNGSI BARU: Memuat ulang riwayat lama ke layar saat web pertama kali dibuka/di-refresh
function loadHistory() {
    chatBox.innerHTML = ''; // Kosongkan layar sementara
    if (conversationHistory.length === 0) {
        // Jika tidak ada memori, tampilkan sapaan awal
        chatBox.innerHTML = '<div class="message bot-message">Halo! Aku Teman Pintar. Ada yang ingin kamu tanyakan hari ini? 🌟</div>';
    } else {
        // Jika ada memori, susun ulang semua obrolan sebelumnya
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.text, true);
            } else if (msg.role === 'model') {
                addMessage(msg.text, false);
            }
        });
    }
}

async function handleSend() {
    const text = userInput.value.trim();
    if (text !== '') {
        addMessage(text, true);
        userInput.value = '';
        
        // Simpan pesan user ke dalam memori riwayat
        conversationHistory.push({ role: "user", text: text });
        localStorage.setItem('temanPintarHistory', JSON.stringify(conversationHistory));
        
        // Menampilkan indikator loading untuk anak-anak
        const loadingId = 'loading-' + Date.now();
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'bot-message');
        loadingElement.id = loadingId;
        loadingElement.textContent = 'Mengetik... ✍️';
        chatBox.appendChild(loadingElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // Memanggil API Vercel kita
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // PERUBAHAN DI SINI: Kirim seluruh buku memori ke Vercel
                body: JSON.stringify({ history: conversationHistory })
            });

            const data = await response.json();
            
            // Hapus indikator loading
            document.getElementById(loadingId).remove();

            if (data.reply) {
                addMessage(data.reply, false);
                // Simpan balasan bot ke memori
                conversationHistory.push({ role: "model", text: data.reply });
                localStorage.setItem('temanPintarHistory', JSON.stringify(conversationHistory));
            } else {
                addMessage(data.error || "Maaf, terjadi kesalahan. 😔", false);
                // Batalkan pesan terakhir dari memori jika error
                conversationHistory.pop();
                localStorage.setItem('temanPintarHistory', JSON.stringify(conversationHistory));
            }
        } catch (error) {
            document.getElementById(loadingId).remove();
            addMessage("Aduh, koneksi terputus. Coba lagi ya! 🔌", false);
            // Batalkan pesan terakhir dari memori jika error
            conversationHistory.pop();
            localStorage.setItem('temanPintarHistory', JSON.stringify(conversationHistory));
        }
    }
}

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// PERUBAHAN DI SINI: Membersihkan layar DAN brankas memori browser
document.getElementById('clear-btn').addEventListener('click', () => {
    conversationHistory = [];
    localStorage.removeItem('temanPintarHistory');
    loadHistory(); 
});

// Panggil fungsi pemuat riwayat saat halaman web selesai dimuat
loadHistory();
