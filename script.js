const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Fungsi untuk menambahkan pesan ke layar
function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll ke bawah
}

// Fungsi utama saat tombol kirim ditekan
function handleSend() {
    const text = userInput.value.trim();
    if (text !== '') {
        // Tampilkan pesan user
        addMessage(text, true);
        userInput.value = '';
        
        // Simulasi balasan bot (Ini akan kita ganti dengan AI sungguhan di Fase 4)
        setTimeout(() => {
            addMessage("Wah, menarik sekali! Nanti aku akan bisa membalas ini setelah otak AI-ku terpasang di Fase 4. 🧠✨", false);
        }, 1000);
    }
}

// Trigger untuk klik tombol dan tekan tombol "Enter" di keyboard
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSend();
    }
});
