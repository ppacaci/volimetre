(function(){
'use strict';
function loadBudgetCore(){
  if(window.VolimetreBudget||document.querySelector('script[data-volimetre-budget]'))return;
  var s=document.createElement('script');s.src='/assets/budget-core.js';s.defer=true;s.dataset.volimetreBudget='1';document.head.appendChild(s);
}
loadBudgetCore();
function money(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(Number(n)||0))}
function pct(n){return '%'+(Number(n)||0).toFixed(2).replace('.',',')}
function num(id){var el=document.getElementById(id);return el?Number(el.value)||0:0}
function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v}
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
function annuity(p,r,n){
  r=Math.max(0,r)/100;n=Math.max(1,n);
  if(r===0)return p/n;
  var z=Math.pow(1+r,n);
  return p*r*z/(z-1);
}
function cardRate(debt,late){
  if(debt<30000)return late?3.55:3.25;
  if(debt<=180000)return late?4.05:3.75;
  return late?4.55:4.25;
}

if(document.getElementById('promo-new')){
  function promo(){
    var current=num('promo-current'),total=Math.max(1,num('promo-total-months')),elapsed=Math.min(total,Math.max(0,num('promo-elapsed'))),fresh=num('promo-new');
    var remaining=Math.max(0,total-elapsed),refund=current*(remaining/total),net=fresh-refund;
    set('promo-main',money(net));set('promo-refund',money(refund));set('promo-monthly',money(fresh/total)+'/ay');set('promo-remaining',remaining+' ay');set('promo-label',net>=0?'Yaklaşık net geçiş avantajı':'Yaklaşık net fark');
  }
  bind(['promo-current','promo-total-months','promo-elapsed','promo-new'],promo,'pension-promo');
}

if(document.getElementById('card-limit')){
  function minimum(){
    var limit=num('card-limit'),debt=num('card-debt'),rate=limit<=50000?20:40,min=debt*rate/100;
    set('minimum-main',money(min));set('minimum-rate','%'+rate);set('minimum-remain',money(Math.max(0,debt-min)));set('minimum-debt',money(debt));
  }
  bind(['card-limit','card-debt'],minimum,'card-minimum');
}

if(document.getElementById('card-interest-debt')){
  function interest(){
    var debt=num('card-interest-debt'),months=Math.max(1,num('card-interest-months')),rate=num('card-interest-rate');
    if(!document.getElementById('card-interest-rate').dataset.touched){rate=cardRate(debt,false);document.getElementById('card-interest-rate').value=rate.toFixed(2)}
    var totalInterest=debt*(Math.pow(1+rate/100,months)-1);
    set('card-interest-main',money(totalInterest));set('card-interest-rate-out',pct(rate));set('card-interest-total',money(debt+totalInterest));set('card-interest-months-out',months+' ay');
  }
  document.getElementById('card-interest-rate').addEventListener('input',function(){this.dataset.touched='1'});
  bind(['card-interest-debt','card-interest-months','card-interest-rate'],interest,'card-interest');
}

if(document.getElementById('late-debt')){
  function late(){
    var debt=num('late-debt'),days=Math.max(1,num('late-days')),rate=num('late-rate');
    if(!document.getElementById('late-rate').dataset.touched){rate=cardRate(debt,true);document.getElementById('late-rate').value=rate.toFixed(2)}
    var interest=debt*(rate/100)*(days/30);
    set('late-main',money(interest));set('late-rate-out',pct(rate));set('late-total',money(debt+interest));set('late-days-out',days+' gün');
  }
  document.getElementById('late-rate').addEventListener('input',function(){this.dataset.touched='1'});
  bind(['late-debt','late-days','late-rate'],late,'card-late-interest');
}

if(document.getElementById('cash-amount')){
  function cash(){
    var amount=num('cash-amount'),days=Math.max(1,num('cash-days')),rate=num('cash-rate'),fee=num('cash-fee');
    var interest=amount*(rate/100)*(days/30),total=amount+interest+fee;
    set('cash-main',money(total));set('cash-interest',money(interest));set('cash-rate-out',pct(rate));set('cash-fee-out',money(fee));
  }
  bind(['cash-amount','cash-days','cash-rate','cash-fee'],cash,'cash-advance');
}

if(document.getElementById('payoff-debt')){
  function payoff(){
    var debt=num('payoff-debt'),payment=num('payoff-payment'),rate=Math.max(0,num('payoff-rate'))/100,balance=debt,months=0,total=0;
    if(payment<=0||payment<=balance*rate){set('payoff-main','Kapanmaz');set('payoff-total','—');set('payoff-interest','—');set('payoff-note','Aylık ödeme aylık faizden yüksek olmalı.');return}
    while(balance>0.5&&months<600){
      balance+=balance*rate;
      var paid=Math.min(payment,balance);balance-=paid;total+=paid;months++;
    }
    set('payoff-main',months+' ay');set('payoff-total',money(total));set('payoff-interest',money(Math.max(0,total-debt)));set('payoff-note',months>=600?'600 aydan uzun':'Yaklaşık kapanış süresi');
  }
  bind(['payoff-debt','payoff-payment','payoff-rate'],payoff,'card-payoff');
}

if(document.getElementById('target-debt')){
  function target(){
    var debt=num('target-debt'),months=Math.max(1,num('target-months')),rate=num('target-rate'),payment=annuity(debt,rate,months),total=payment*months;
    set('target-main',money(payment)+'/ay');set('target-total',money(total));set('target-interest',money(Math.max(0,total-debt)));set('target-months-out',months+' ay');
  }
  bind(['target-debt','target-months','target-rate'],target,'card-payment-target');
}

if(document.getElementById('restruct-debt')){
  function restruct(){
    var p=num('restruct-debt'),n=Math.max(1,num('restruct-term')),r=Math.max(0,num('restruct-rate')),monthly=annuity(p,r,n),total=monthly*n;
    set('restruct-main',money(monthly)+'/ay');set('restruct-total',money(total));set('restruct-cost',money(total-p));set('restruct-term-out',n+' ay');
  }
  bind(['restruct-debt','restruct-term','restruct-rate'],restruct,'card-restructure');
}

if(document.getElementById('cash-price')){
  function installment(){
    var cashPrice=num('cash-price'),installmentTotal=num('installment-total'),months=Math.max(1,num('installment-months'));
    var diff=installmentTotal-cashPrice,pctDiff=cashPrice>0?diff/cashPrice*100:0,monthly=installmentTotal/months;
    set('installment-main',diff>0?money(diff)+' daha pahalı':diff<0?money(Math.abs(diff))+' daha ucuz':'Aynı maliyet');
    set('installment-monthly',money(monthly)+'/ay');set('installment-diff',money(diff));set('installment-pct',(pctDiff>=0?'+':'')+pctDiff.toFixed(1).replace('.',',')+'%');
  }
  bind(['cash-price','installment-total','installment-months'],installment,'cash-vs-installment');
}

function attachBudgetAction(){
  var cfg=null;
  if(document.getElementById('card-limit'))cfg={label:'Kredi kartı ödemesi',key:'card-minimum',amount:function(){var limit=num('card-limit'),debt=num('card-debt');return debt*(limit<=50000?20:40)/100}};
  if(document.getElementById('restruct-debt'))cfg={label:'Kart yapılandırma taksiti',key:'card-restructure',amount:function(){return annuity(num('restruct-debt'),num('restruct-rate'),Math.max(1,num('restruct-term')))}};
  if(document.getElementById('payoff-debt'))cfg={label:'Kredi kartı aylık ödeme planı',key:'card-payoff',amount:function(){return num('payoff-payment')}};
  if(document.getElementById('target-debt'))cfg={label:'Kredi kartı hedef aylık ödeme',key:'card-payment-target',amount:function(){return annuity(num('target-debt'),num('target-rate'),Math.max(1,num('target-months')))}};
  if(!cfg)return;
  var host=document.querySelector('.tool-result');if(!host||host.querySelector('.budget-add-inline'))return;
  var box=document.createElement('div');box.className='budget-add-inline';var b=document.createElement('button');b.type='button';b.className='budget-add-button';b.textContent='Bütçeme Ekle';
  b.onclick=function(){
    if(!window.VolimetreBudget){b.textContent='Tekrar deneyin';return}
    window.VolimetreBudget.addOrUpdateDebt({label:cfg.label,amount:cfg.amount(),sourceKey:'special:'+cfg.key+':'+location.pathname});
    b.textContent='Bütçeye eklendi';setTimeout(function(){b.textContent='Bütçeme Ekle'},1600);
  };
  box.appendChild(b);host.appendChild(box);
}
attachBudgetAction();

function enhanceSteppers(){
  document.querySelectorAll('.tool-field input[type="number"],.tool-field select').forEach(function(el){
    if(el.parentElement&&el.parentElement.classList.contains('step-control'))return;
    var wrap=document.createElement('div');
    wrap.className='step-control';
    var minus=document.createElement('button');
    minus.type='button';minus.className='step-button minus';minus.textContent='‹';minus.setAttribute('aria-label','Azalt');
    var plus=document.createElement('button');
    plus.type='button';plus.className='step-button plus';plus.textContent='›';plus.setAttribute('aria-label','Artır');
    el.parentNode.insertBefore(wrap,el);
    wrap.appendChild(minus);wrap.appendChild(el);wrap.appendChild(plus);

    function move(dir){
      if(el.tagName==='SELECT'){
        var next=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+dir));
        if(next===el.selectedIndex)return;
        el.selectedIndex=next;
      }else{
        try{dir>0?el.stepUp():el.stepDown()}catch(e){
          var step=Number(el.step)||1,current=Number(el.value)||0;
          var next=current+dir*step,min=el.min===''?-Infinity:Number(el.min),max=el.max===''?Infinity:Number(el.max);
          el.value=Math.max(min,Math.min(max,next));
        }
      }
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }
    minus.addEventListener('click',function(){move(-1)});
    plus.addEventListener('click',function(){move(1)});
  });
}
enhanceSteppers();
})();