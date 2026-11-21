(function(){
'use strict';
function loadShell(){if(window.__volimetreShellLoading||document.querySelector('script[src="/assets/site-shell.js"]'))return;window.__volimetreShellLoading=1;var s=document.createElement('script');s.src='/assets/site-shell.js';s.defer=true;document.head.appendChild(s)}
function loadData(done){if(window.VolimetreGold){done();return}var s=document.createElement('script');s.src='/assets/gold-data.js';s.onload=done;document.head.appendChild(s)}
function init(){
 var G=window.VolimetreGold;
 function q(s,r){return (r||document).querySelector(s)} function n(s,r){var e=q(s,r);return e?Number(e.value)||0:0}
 function money(v){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)}
 function num(v,d){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d||2,maximumFractionDigits:d||2}).format(Number(v)||0)}
 function pct(v){return '%'+num(v,2)}
 function pureGram(oz,fx){return oz*fx/G.ounceGram}
 function setInput(box,s,v){var e=q(s,box);if(e&&!e.dataset.touched)e.value=Number(v).toFixed(s.indexOf('fx')>=0?4:2)}
 function metric(label,value){return '<div class="gold-metric"><span>'+label+'</span><strong>'+value+'</strong></div>'}
 function render(box,main,sub,stats){q('[data-main]',box).textContent=main;q('[data-sub]',box).textContent=sub;q('[data-metrics]',box).innerHTML=(stats||[]).map(function(x){return metric(x[0],x[1])}).join('')}
 function table(box,heads,rows){var h=q('[data-table]',box);if(!h)return;h.innerHTML='<div class="tablebox gold-live-table"><table><thead><tr>'+heads.map(function(x){return '<th>'+x+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(x){return '<td>'+x+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
 function touchInputs(box){box.querySelectorAll('input,select').forEach(function(e){e.addEventListener('input',function(){this.dataset.touched='1'});e.addEventListener('change',function(){this.dataset.touched='1'})})}
 async function live(box){
   var status=q('[data-market-status]',box),oz=G.fallback.ounceUSD,fx=G.fallback.usdTRY,ozAt='',fxAt='',ok=0;
   if(status)status.textContent='Piyasa verisi alınıyor…';
   try{var gr=await fetch(G.sources.goldApi,{cache:'no-store'});if(gr.ok){var gd=await gr.json();if(Number(gd.price)>0){oz=Number(gd.price);ozAt=gd.updatedAtReadable||gd.updatedAt||'';ok++}}}catch(e){}
   try{var fr=await fetch(G.sources.fxApi,{cache:'no-store'});if(fr.ok){var fd=await fr.json();if(Number(fd.rate)>0){fx=Number(fd.rate);fxAt=fd.date||'';ok++}}}catch(e){}
   setInput(box,'[data-oz]',oz);setInput(box,'[data-fx]',fx);
   if(status)status.textContent=ok===2?'XAU/USD canlı · USD/TRY referans · '+(ozAt||fxAt):ok===1?'Kısmi canlı veri · diğer değer referans':'21 Kasım referans verisi · alanları elle değiştirebilirsiniz';
   calc(box);
 }
 function calc(box){
  var type=box.dataset.goldTool||'gram',oz=n('[data-oz]',box)||G.fallback.ounceUSD,fx=n('[data-fx]',box)||G.fallback.usdTRY,base=pureGram(oz,fx);
  if(type==='gram'||type==='fixed-gram'){
    var grams=n('[data-grams]',box)||1,pur=Number(q('[data-purity]',box)?.value||.995),premium=n('[data-premium]',box),per=base*pur*(1+premium/100),total=per*grams;
    render(box,money(total),grams+' gram için yaklaşık teorik değer',[['Gram referansı',money(per)],['Saf gram',money(base)],['Saflık',pct(pur*100)],['Prim',pct(premium)]]);
    table(box,['Gram','Yaklaşık değer'],[1,5,10,20,50,100].map(function(g){return [g+' g',money(per*g)]}));
  }else if(type==='ounce'){
    var ounces=n('[data-ounces]',box)||1,grams2=ounces*G.ounceGram,total2=base*grams2;
    render(box,money(total2),ounces+' troy ons teorik TL değeri',[['Gram karşılığı',num(grams2,4)+' g'],['1 ons',money(base*G.ounceGram)],['1 saf gram',money(base)],['USD/TRY',num(fx,4)]]);
  }else if(type==='convert'){
    var g3=n('[data-grams]',box),ozs=g3/G.ounceGram,usd=ozs*oz,tl=usd*fx;
    render(box,num(ozs,6)+' ons',g3+' gram altının troy ons karşılığı',[['USD değeri','$'+num(usd,2)],['Teorik TL',money(tl)],['1 ons',G.ounceGram+' g'],['Ons fiyatı','$'+num(oz,2)]]);
  }else if(type==='karat'||type==='purity'){
    var w=n('[data-weight]',box),purity=Number(q('[data-karat]',box)?.value||.916),fine=w*purity,val=fine*base;
    render(box,num(fine,3)+' g saf altın',w+' gram ürünün saf altın karşılığı',[['Ayar/saflık',pct(purity*100)],['Teorik metal değeri',money(val)],['Saf gram referansı',money(base)],['Brüt ağırlık',num(w,3)+' g']]);
  }else if(type==='spread'){
    var buy=n('[data-buy]',box),sell=n('[data-sell]',box),g=n('[data-grams]',box)||1,spread=sell-buy,pctv=sell?spread/sell*100:0;
    render(box,money(spread*g),g+' gramda alış-satış makas farkı',[['Gram makası',money(spread)],['Makas oranı',pct(pctv)],['Alış toplamı',money(buy*g)],['Satış toplamı',money(sell*g)]]);
  }else if(type==='profit'){
    var cost=n('[data-cost]',box),now=n('[data-now]',box),g4=n('[data-grams]',box)||1,diff=(now-cost)*g4,pct4=cost?((now-cost)/cost*100):0;
    render(box,(diff>=0?'+':'')+money(diff),g4+' gram için yaklaşık kâr/zarar',[['Getiri',pct(pct4)],['Alış maliyeti',money(cost*g4)],['Bugünkü değer',money(now*g4)],['Gram farkı',money(now-cost)]]);
  }else if(type==='cashout'){
    var g5=n('[data-grams]',box)||1,price=n('[data-buyback]',box),ded=n('[data-deduction]',box),net=price*g5*(1-ded/100);
    render(box,money(net),g5+' gram için yaklaşık bozdurma tutarı',[['Brüt alış değeri',money(price*g5)],['Kesinti',pct(ded)],['Gram alış',money(price)],['Gram başı net',money(net/g5)]]);
  }else if(type==='coin'){
    var count=n('[data-count]',box)||1,w2=Number(box.dataset.weight),p2=Number(box.dataset.purity),gross=w2*count,fine2=gross*p2,melt=fine2*base,market=n('[data-market]',box),premium2=market?((market*count-melt)/melt*100):0;
    render(box,money(melt),count+' adet için teorik saf altın değeri',[['Toplam ağırlık',num(gross,3)+' g'],['Saf altın',num(fine2,3)+' g'],['Ayar','22 ayar / 916,6'],['Piyasa primi',market?pct(premium2):'Fiyat girin']]);
  }
 }
 document.querySelectorAll('[data-gold-tool]').forEach(function(box){touchInputs(box);box.addEventListener('input',function(){calc(box)});box.addEventListener('change',function(){calc(box)});var b=q('[data-live]',box);if(b)b.onclick=function(){box.querySelectorAll('[data-oz],[data-fx]').forEach(function(e){delete e.dataset.touched});live(box)};calc(box);if(q('[data-oz]',box)||q('[data-fx]',box))live(box)});
}
loadShell();loadData(init);
})();