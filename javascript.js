// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const newChatBtn = document.getElementById('new-chat-btn');
const tokenCount = document.getElementById('token-count');
const responseTime = document.getElementById('response-time');
const temperatureSlider = document.getElementById('temperature');
const tempValue = document.getElementById('temp-value');
const themeToggle = document.getElementById('theme-toggle');

// Configuration
let config = {
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2048,
    model: 'deepseek-coder'
};

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch('ArayGPT_config.json');
        const data = await response.json();
        config = { ...config, ...data };
        
        // Update UI with loaded config
        if (config.apiKey) {
            document.getElementById('api-key').value = config.apiKey;
        }
        temperatureSlider.value = config.temperature;
        tempValue.textContent = config.temperature;
        document.getElementById('max-tokens').value = config.maxTokens;
    } catch (error) {
        console.error('Error loading config:', error);
        showNotification('Failed to load configuration. Please check your config file.', 'error');
    }
}

// Create galaxy background
function createGalaxyBackground() {
    const stars = document.querySelector('.stars');
    const starsCount = 200;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3;
        
        // Random animation duration
        const duration = 3 + Math.random() * 7;
        
        // Random opacity
        const opacity = 0.3 + Math.random() * 0.7;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.opacity = opacity;
        
        // Add glow effect for some stars
        if (Math.random() > 0.8) {
            star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        }
        
        stars.appendChild(star);
    }
    
    // Add CSS for stars
    const style = document.createElement('style');
    style.textContent = `
        .star {
            position: absolute;
            background-color: white;
            border-radius: 50%;
            animation: twinkle linear infinite;
        }
        
        @keyframes twinkle {
            0% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-40px) scale(1); opacity: 0.3; }
        }
        
        .shooting-star {
            position: absolute;
            width: 2px;
            height: 2px;
            background-color: white;
            border-radius: 50%;
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
            animation: shoot 3s linear infinite;
            opacity: 0;
        }
        
        @keyframes shoot {
            0% { transform: translateX(0) translateY(0) rotate(45deg); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateX(300px) translateY(300px) rotate(45deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Create shooting stars occasionally
    setInterval(() => {
        if (Math.random() > 0.7) {
            createShootingStar();
        }
    }, 3000);
}

function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    
    // Random starting position
    const x = Math.random() * 50;
    const y = Math.random() * 50;
    
    shootingStar.style.left = `${x}%`;
    shootingStar.style.top = `${y}%`;
    
    document.querySelector('.stars').appendChild(shootingStar);
    
    // Remove after animation completes
    setTimeout(() => {
        shootingStar.remove();
    }, 3000);
}

// Send message to API
async function sendMessage(message) {
    if (!config.apiKey) {
        showNotification('Please set your API key in settings', 'error');
        return;
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are ArayGPT, a helpful AI assistant. Respond in a helpful, concise manner.' },
                    { role: 'user', content: message }
                ],
                temperature: config.temperature,
                max_tokens: config.maxTokens
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to chat
        addMessage(aiResponse, 'ai');
        
        // Update response time
        const endTime = Date.now();
        responseTime.textContent = `${endTime - startTime}ms`;
        
        // Update token count (approximate)
        const tokens = message.split(' ').length + aiResponse.split(' ').length;
        tokenCount.textContent = tokens;
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'ai');
        showNotification('Error: ' + error.message, 'error');
    }
}

// Add message to chat
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Process content for code blocks, links, etc.
    const processedContent = processMessageContent(content);
    contentDiv.innerHTML = processedContent;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Process message content for formatting
function processMessageContent(content) {
    // Convert newlines to <br>
    let processed = content.replace(/\n/g, '<br>');
    
    // Simple code block detection
    processed = processed.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
    
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Bold text
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return processed;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-message';
    typingDiv.id = 'typing-indicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingIndicator.appendChild(dot);
    }
    
    contentDiv.appendChild(typingIndicator);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Position notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '5px';
    notification.style.background = type === 'error' ? 'var(--error-color)' : 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Event Listeners
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        sendMessage(message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
    }
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
});

// Settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

saveSettingsBtn.addEventListener('click', () => {
    config.apiKey = document.getElementById('api-key').value;
    config.temperature = parseFloat(temperatureSlider.value);
    config.maxTokens = parseInt(document.getElementById('max-tokens').value);
    
    settingsModal.style.display = 'none';
    showNotification('Settings saved successfully', 'success');
});

// Temperature slider
temperatureSlider.addEventListener('input', () => {
    tempValue.textContent = temperatureSlider.value;
});

// New chat button
newChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Halo! Saya ArayGPT, asisten AI Anda. Ada yang bisa saya bantu hari ini?</p>
            </div>
        </div>
    `;
    tokenCount.textContent = '0';
    responseTime.textContent = '0ms';
});

// Theme toggle (placeholder for future implementation)
themeToggle.addEventListener('click', () => {
    showNotification('Theme toggle coming soon!', 'info');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    createGalaxyBackground();
    
    // Add CSS for code blocks
    const codeStyle = document.createElement('style');
    codeStyle.textContent = `
        .code-block {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
            padding: 1rem;
            margin: 0.5rem 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            border-left: 3px solid var(--accent-color);
        }
        
        .inline-code {
            background: rgba(0, 0, 0, 0.2);
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(codeStyle);
});
