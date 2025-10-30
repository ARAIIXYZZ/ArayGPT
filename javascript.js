// Konfigurasi Awal
let config = {
    api_key: "",
    base_url: "https://openrouter.ai/api/v1",
    model: "deepseek/deepseek-chat-v3-0324",
    language: "id",
    temperature: 0.7
};

// Elemen DOM
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsToggle = document.getElementById('settings-toggle');
const closeModal = document.getElementById('close-modal');
const saveSettings = document.getElementById('save-settings');
const resetSettings = document.getElementById('reset-settings');
const themeToggle = document.getElementById('theme-toggle');
const welcomeSection = document.querySelector('.welcome-section');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', handleKeyDown);
settingsToggle.addEventListener('click', openSettings);
closeModal.addEventListener('click', closeSettings);
saveSettings.addEventListener('click', saveSettingsHandler);
resetSettings.addEventListener('click', resetSettingsHandler);
themeToggle.addEventListener('click', toggleTheme);
suggestionBtns.forEach(btn => btn.addEventListener('click', handleSuggestion));

// Inisialisasi Aplikasi
function initApp() {
    loadConfig();
    setupMessageInput();
    applyTheme();
}

// Setup Message Input
function setupMessageInput() {
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Handle Pengiriman Pesan
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    showTypingIndicator();
    sendBtn.disabled = true;
    
    // Simulasi delay untuk efek typing
    setTimeout(() => {
        generateAIResponse(message);
    }, 1000);
}

// Handle Keyboard Shortcuts
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Tambahkan Pesan ke Chat
function addMessage(text, sender) {
    // Sembunyikan welcome section jika ada pesan pertama
    if (chatMessages.children.length === 0) {
        welcomeSection.style.display = 'none';
        chatMessages.style.display = 'flex';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${sender === 'user' ? 
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C9.34784 22 6.8043 20.9464 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15848 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            }
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format Pesan (Markdown sederhana)
function formatMessage(text) {
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Convert **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code`
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return text;
}

// Tampilkan Indikator Typing
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C9.34784 22 6.8043 20.9464 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15848 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Hapus Indikator Typing
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Generate Response AI
async function generateAIResponse(userMessage) {
    try {
        // Cek apakah API key sudah diatur
        if (!config.api_key) {
            hideTypingIndicator();
            addMessage("Silakan atur API key Anda di pengaturan terlebih dahulu.", 'ai');
            sendBtn.disabled = false;
            return;
        }
        
        // Baca system prompt dari file
        let systemPrompt = "Anda adalah asisten AI yang membantu. Berikan respons yang jelas, informatif, dan ramah.";
        
        try {
            const response = await fetch('system-prompt.txt');
            if (response.ok) {
                systemPrompt = await response.text();
            }
        } catch (error) {
            console.warn('Tidak dapat memuat system prompt, menggunakan default');
        }
        
        // Siapkan data untuk API
        const requestData = {
            model: config.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: config.temperature
        };
        
        // Kirim request ke API
        const response = await fetch(`${config.base_url}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.api_key}`
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        hideTypingIndicator();
        addMessage(aiResponse, 'ai');
        
    } catch (error) {
        console.error('Error generating AI response:', error);
        hideTypingIndicator();
        addMessage(`Maaf, terjadi kesalahan: ${error.message}. Pastikan API key Anda valid dan koneksi internet stabil.`, 'ai');
    } finally {
        sendBtn.disabled = false;
    }
}

// Handle Suggestion Buttons
function handleSuggestion(e) {
    const suggestionText = e.target.textContent;
    messageInput.value = suggestionText;
    messageInput.focus();
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
}

// Scroll ke Bawah Chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Pengaturan Modal
function openSettings() {
    document.getElementById('api-key').value = config.api_key;
    document.getElementById('model-select').value = config.model;
    document.getElementById('language-select').value = config.language;
    document.getElementById('temperature').value = config.temperature;
    document.getElementById('temp-value').textContent = config.temperature;
    
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function saveSettingsHandler() {
    config.api_key = document.getElementById('api-key').value;
    config.model = document.getElementById('model-select').value;
    config.language = document.getElementById('language-select').value;
    config.temperature = parseFloat(document.getElementById('temperature').value);
    
    saveConfig();
    closeSettings();
    
    // Tampilkan notifikasi sukses
    showNotification('Pengaturan berhasil disimpan!', 'success');
}

function resetSettingsHandler() {
    if (confirm('Apakah Anda yakin ingin mengatur ulang pengaturan ke default?')) {
        config = {
            api_key: "",
            base_url: "https://openrouter.ai/api/v1",
            model: "deepseek/deepseek-chat-v3-0324:free",
            language: "id",
            temperature: 0.7
        };
        
        saveConfig();
        openSettings(); // Refresh form dengan nilai default
        
        showNotification('Pengaturan telah direset!', 'success');
    }
}

// Toggle Tema
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('araygpt-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('araygpt-theme', 'light');
    }
    
    applyTheme();
}

function applyTheme() {
    const savedTheme = localStorage.getItem('araygpt-theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        
        // Update CSS variables untuk tema terang
        document.documentElement.style.setProperty('--primary', '#f0f0f5');
        document.documentElement.style.setProperty('--secondary', '#ffffff');
        document.documentElement.style.setProperty('--text', '#333344');
        document.documentElement.style.setProperty('--text-dim', '#666677');
        document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
        document.documentElement.style.setProperty('--border', 'rgba(106, 0, 255, 0.2)');
    } else {
        document.body.removeAttribute('data-theme');
        
        // Kembalikan ke nilai default (tema gelap)
        document.documentElement.style.setProperty('--primary', '#0a0a1a');
        document.documentElement.style.setProperty('--secondary', '#1a1a2e');
        document.documentElement.style.setProperty('--text', '#e0e0ff');
        document.documentElement.style.setProperty('--text-dim', '#a0a0c0');
        document.documentElement.style.setProperty('--card-bg', 'rgba(26, 26, 46, 0.7)');
        document.documentElement.style.setProperty('--border', 'rgba(106, 0, 255, 0.3)');
    }
}

// Konfigurasi Local Storage
function saveConfig() {
    localStorage.setItem('araygpt-config', JSON.stringify(config));
}

function loadConfig() {
    const savedConfig = localStorage.getItem('araygpt-config');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
    } else {
        // Coba muat dari file config
        fetch('ArayGPT_config.json')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Config file not found');
            })
            .then(externalConfig => {
                config = { ...config, ...externalConfig };
                saveConfig();
            })
            .catch(error => {
                console.warn('Tidak dapat memuat config file:', error);
            });
    }
}

// Notifikasi
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notifikasi
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '1001';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.transition = 'all 0.3s ease';
    
    if (type === 'success') {
        notification.style.background = 'var(--success)';
    } else if (type === 'error') {
        notification.style.background = 'var(--error)';
    } else {
        notification.style.background = 'var(--accent)';
    }
    
    document.body.appendChild(notification);
    
    // Animasi masuk
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Event listener untuk menutup modal saat klik di luar
window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// Event listener untuk update temperature value
document.getElementById('temperature').addEventListener('input', function() {
    document.getElementById('temp-value').textContent = this.value;
});
