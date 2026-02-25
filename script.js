const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    // Membaca baris baru dengan benar
    messageElement.innerHTML = message.replace(/\n/g, '<br>');
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSend() {
    const text = userInput.value.trim();
    if (text !== '') {
        addMessage(text, true);
        userInput.value = '';
        
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
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            // Hapus indikator loading
            document.getElementById(loadingId).remove();

            if (data.reply) {
                addMessage(data.reply, false);
            } else {
                addMessage(data.error || "Maaf, terjadi kesalahan. 😔", false);
            }
        } catch (error) {
            document.getElementById(loadingId).remove();
            addMessage("Aduh, koneksi terputus. Coba lagi ya! 🔌", false);
        }
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSend();
    }
});
