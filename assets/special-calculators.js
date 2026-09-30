(function(){
'use strict';
function money(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(Number(n)||0))}
function num(id){return Number(document.getElementById(id).value)||0}
function track(tool){
  var key='volimetre:tool-used:'+tool;
  try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch(e){}
  if(window.va)window.va('pageview',{path:'/__tool-use/'+tool});
}
function bind(ids,fn,tool){
  ids.forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    el.addEventListener('input',function(){track(tool);fn()});
    el.addEventListener('change',function(){track(tool);fn()});
  });
  fn();
}

if(document.getElementById('promo-new')){
  function promo(){
    var current=num('promo-current');
    var total=Math.max(1,num('promo-total-months'));
    var elapsed=Math.min(total,Math.max(0,num('promo-elapsed')));
    var fresh=num('promo-new');
    var remaining=Math.max(0,total-elapsed);
    var refund=current*(remaining/total);
    var net=fresh-refund;
    document.getElementById('promo-main').textContent=money(net);
    document.getElementById('promo-refund').textContent=money(refund);
    document.getElementById('promo-monthly').textContent=money(fresh/total)+'/ay';
    document.getElementById('promo-remaining').textContent=remaining+' ay';
    document.getElementById('promo-label').textContent=net>=0?'Yaklaşık net geçiş avantajı':'Yaklaşık net fark';
  }
  bind(['promo-current','promo-total-months','promo-elapsed','promo-new'],promo,'pension-promo');
}

if(document.getElementById('card-limit')){
  function minimum(){
    var limit=num('card-limit');
    var debt=num('card-debt');
    var rate=limit<=50000?20:40;
    var min=debt*rate/100;
    var remain=Math.max(0,debt-min);
    document.getElementById('minimum-main').textContent=money(min);
    document.getElementById('minimum-rate').textContent='%'+rate;
    document.getElementById('minimum-remain').textContent=money(remain);
    document.getElementById('minimum-debt').textContent=money(debt);
  }
  bind(['card-limit','card-debt'],minimum,'card-minimum');
}

if(document.getElementById('restruct-debt')){
  function restruct(){
    var p=num('restruct-debt');
    var n=Math.max(1,num('restruct-term'));
    var r=Math.max(0,num('restruct-rate'))/100;
    var monthly=r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    var total=monthly*n;
    document.getElementById('restruct-main').textContent=money(monthly)+'/ay';
    document.getElementById('restruct-total').textContent=money(total);
    document.getElementById('restruct-cost').textContent=money(total-p);
    document.getElementById('restruct-term-out').textContent=n+' ay';
  }
  bind(['restruct-debt','restruct-term','restruct-rate'],restruct,'card-restructure');
}
})();