/* Worldbook 1.7 : en-tête de l'Atlas embelli + ouverture d'un monde demandée par Foundry */
(function(){
  var cov=document.getElementById('ws-cover'); if(!cov) return;
  var title=cov.querySelector('.cov-title');
  var au=document.createElement('div'); au.className='v17-aurora'; au.dataset.rt='1'; au.innerHTML='<i></i><i></i><i></i>'; cov.insertBefore(au,cov.firstChild);
  if(title){
    var over=document.createElement('div'); over.className='v17-over'; over.innerHTML='The Last Horizon <b>◆</b> Registre des mondes'; title.parentNode.insertBefore(over,title);
    var motto=document.createElement('div'); motto.className='v17-motto'; motto.textContent='Neuf mondes sous un même horizon. Choisissez une porte, et lisez ce que la nuit n’a pas encore effacé.';
    var orn=document.createElement('div'); orn.className='v17-orn'; orn.innerHTML='<span></span><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="16" cy="16" r="13" stroke-dasharray="3 3"/><path d="M16 3v6M16 23v6M3 16h6M23 16h6"/><path d="M16 9l2.2 4.8L23 16l-4.8 2.2L16 23l-2.2-4.8L9 16l4.8-2.2z" fill="currentColor" fill-opacity=".25"/></svg><span></span>';
    title.parentNode.insertBefore(motto,title.nextSibling); motto.parentNode.insertBefore(orn,motto.nextSibling);
  }
  var first=cov.querySelector('.cov-list .cov-ban'); if(first&&!first.querySelector('.v17-feat')){ var f=document.createElement('span'); f.className='v17-feat'; f.textContent='Monde-cœur'; first.appendChild(f); }
  window.addEventListener('message',function(ev){ var d=ev.data; if(!d||d.type!=='wb-show'||typeof show!=='function') return; if(typeof W!=='undefined'&&(W.indexOf(d.w)>=0||d.w==='cover')) show(d.w); });
})();
