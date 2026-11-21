(function(){
'use strict';
function loadShell(){if(window.__volimetreShellLoading||document.querySelector('script[src="/assets/site-shell.js"]'))return;window.__volimetreShellLoading=1;var s=document.createElement('script');s.src='/assets/site-shell.js';s.defer=true;document.head.appendChild(s)}
function loadRegs(done){if(window.VolimetreRegulations){done();return}var s=document.createElement('script');s.src='/assets/regulations.js';s.onload=done;document.head.appendChild(s)}
function init(){
 var C=(window.VolimetreRegulations&&window.VolimetreRegulations.creditScore)||{weights:{payment:45,debt:32,intensity:18,newProducts:5}};
 function q(s,r){return (r||document).querySelector(s)} function n(s,r){var e=q(s,r);return e?Number(e.value)||0:0}
 function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
 function band(score){if(score<=969)return 'Kritik';if(score<=1149)return 'Gelişime Açık';if(score<=1469)return 'Dengeli';if(score<=1719)return 'Güvenli';return 'Prestijli'}
 function utilScore(u){if(u<=10)return 100;if(u<=30)return 90;if(u<=50)return 75;if(u<=70)return 55;if(u<=90)return 30;if(u<=100)return 15;return 5}
 function lateCountScore(x){return x<=0?100:x===1?82:x===2?65:x===3?48:x===4?30:15}
 function delayScore(d){return d<=0?100:d<=7?90:d<=30?70:d<=60?45:d<=90?20:0}
 function historyScore(m){return m<=0?30:m<6?45:m<12?60:m<24?75:m<60?90:100}
 function productScore(p){return p<=0?35:p===1?75:p<=4?100:p<=6?85:70}
 function newScore(x){return x<=0?100:x===1?75:x===2?50:x===3?25:0}
 function estimate(v){
   var payment=lateCountScore(v.lateCount)*.55+delayScore(v.delayDays)*.45;
   if(v.overdue)payment*=.70;
   var util=v.limit>0?v.balance/v.limit*100:(v.balance>0?110:0);
   var debt=utilScore(util);if(v.overdue)debt*=.60;
   var intensity=historyScore(v.historyMonths)*.70+productScore(v.products)*.30;
   var np=newScore(v.newProducts);
   var total=payment*.45+debt*.32+intensity*.18+np*.05;
   var score=Math.round(1+clamp(total,0,100)/100*1899);
   if(v.delayDays>90)score=Math.min(score,969);
   else if(v.delayDays>60)score=Math.min(score,1149);
   else if(v.delayDays>30)score=Math.min(score,1469);
   if(v.overdue)score=Math.min(score,1469);
   return {score:clamp(score,1,1900),band:band(score),payment:payment,debt:debt,intensity:intensity,newProducts:np,util:util};
 }
 function profile(box,prefix){
   prefix=prefix||'';
   return {lateCount:n('['+prefix+'data-late-count]',box),delayDays:n('['+prefix+'data-delay]',box),overdue:n('['+prefix+'data-overdue]',box)>0,limit:n('['+prefix+'data-limit]',box),balance:n('['+prefix+'data-balance]',box),products:n('['+prefix+'data-products]',box),historyMonths:n('['+prefix+'data-history]',box),newProducts:n('['+prefix+'data-new-products]',box)};
 }
 function bar(label,value,weight){return '<div class="risk-bar"><div class="risk-bar-head"><span>'+label+' · %'+weight+'</span><strong>'+Math.round(value)+'/100</strong></div><div class="risk-track"><div class="risk-fill" style="width:'+clamp(value,0,100)+'%"></div></div></div>'}
 function renderEstimate(box,res){
   q('[data-score]',box).textContent=res.score;
   q('[data-band]',box).textContent=res.band;
   q('[data-summary]',box).textContent='Tahmini risk skoru · 1–1900 ölçeği';
   q('[data-bars]',box).innerHTML=bar('Ödeme alışkanlıkları',res.payment,45)+bar('Mevcut hesap ve borç',res.debt,32)+bar('Kredi kullanım yoğunluğu',res.intensity,18)+bar('Yeni kredili ürünler',res.newProducts,5);
   var tips=[];if(res.util>70)tips.push('Kart/KMH limit kullanım oranı yüksek ('+Math.round(res.util)+'%).');if(res.payment<70)tips.push('Gecikme geçmişi tahmini skoru en çok baskılayan alan.');if(res.newProducts<75)tips.push('Yakın dönemde yeni ürün açılışları risk tahminini aşağı çekiyor.');if(!tips.length)tips.push('Girilen profile göre belirgin bir risk baskısı görünmüyor.');
   q('[data-tips]',box).innerHTML=tips.map(function(x){return '<div>• '+x+'</div>'}).join('');
 }
 document.querySelectorAll('[data-risk-tool]').forEach(function(box){
  var type=box.dataset.riskTool;
  function bind(run){box.querySelectorAll('input,select').forEach(function(e){e.addEventListener('input',run);e.addEventListener('change',run)});run()}
  if(type==='estimate'){bind(function(){renderEstimate(box,estimate(profile(box,'')))})}
  else if(type==='band'){bind(function(){var s=clamp(n('[data-input-score]',box),1,1900);q('[data-score]',box).textContent=s;q('[data-band]',box).textContent=band(s);q('[data-summary]',box).textContent=s+' puan · '+band(s)+' risk grubu'})}
  else if(type==='simulator'){bind(function(){
    var current=estimate(profile(box,'current-')),target=estimate(profile(box,'target-')),diff=target.score-current.score;
    q('[data-current-score]',box).textContent=current.score+' · '+current.band;
    q('[data-target-score]',box).textContent=target.score+' · '+target.band;
    q('[data-diff]',box).textContent=(diff>=0?'+':'')+diff+' puan tahmini fark';
    q('[data-diff-note]',box).textContent='Bu fark resmi Findeks değişimi değildir; aynı Volimetre tahmin modelinin iki senaryosu arasındaki farktır.';
  })}
  else if(type==='capacity'){bind(function(){
    var score=clamp(n('[data-input-score]',box),1,1900),income=n('[data-income]',box),existing=n('[data-existing]',box),ratio=clamp(n('[data-ratio]',box),0,100)/100,rate=n('[data-rate]',box)*1.30/100,term=Math.max(1,n('[data-term]',box)),payment=Math.max(0,income*ratio-existing),principal=rate===0?payment*term:payment*(1-Math.pow(1+rate,-term))/rate;
    q('[data-score-band]',box).textContent=score+' · '+band(score);
    q('[data-payment-cap]',box).textContent=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(payment);
    q('[data-principal]',box).textContent=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(principal);
  })}
 });
}
loadShell();loadRegs(init);
})();