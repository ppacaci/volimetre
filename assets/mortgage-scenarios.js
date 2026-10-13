(function(){
'use strict';
function money(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(Number(n)||0))}
function annuity(p,r,n){p=Number(p)||0;r=(Number(r)||0)/100;n=Math.max(1,Math.round(Number(n)||1));if(!r)return p/n;var z=Math.pow(1+r,n);return p*r*z/(z-1)}
function num(id){var e=document.getElementById(id);return e?Number(e.value)||0:0}
function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v}
function track(tool){var key='volimetre:tool-used:'+tool;try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch(e){}if(window.va)window.va('pageview',{path:'/__tool-use/'+tool})}
function bind(ids,fn,tool){ids.forEach(function(id){var e=document.getElementById(id);if(e){e.addEventListener('input',function(){track(tool);fn()});e.addEventListener('change',function(){track(tool);fn()})}});fn()}
function stepperize(){
  document.querySelectorAll('.tool-field input[type="number"],.tool-field select').forEach(function(el){
    if(el.parentElement&&el.parentElement.classList.contains('step-control'))return;
    var w=document.createElement('div');w.className='step-control';
    var l=document.createElement('button'),r=document.createElement('button');l.type=r.type='button';l.className='step-button minus';r.className='step-button plus';l.textContent='‹';r.textContent='›';
    el.parentNode.insertBefore(w,el);w.append(l,el,r);
    function move(d){
      if(el.tagName==='SELECT'){var i=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+d));if(i===el.selectedIndex)return;el.selectedIndex=i}
      else{try{d>0?el.stepUp():el.stepDown()}catch(e){el.value=(Number(el.value)||0)+d*(Number(el.step)||1)}}
      el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
    }
    l.onclick=function(){move(-1)};r.onclick=function(){move(1)};
  });
}
if(document.getElementById('short-principal')){
  function calcShort(){
    var p=num('short-principal'),r=num('short-rate'),oldN=Math.max(1,num('short-old-term')),newN=Math.max(1,num('short-new-term'));
    if(newN>oldN){newN=oldN;var newTerm=document.getElementById('short-new-term');if(newTerm)newTerm.value=String(newN)}
    var oldPay=annuity(p,r,oldN),newPay=annuity(p,r,newN),oldTotal=oldPay*oldN,newTotal=newPay*newN;
    set('short-main',money(newPay)+'/ay');set('short-old-pay',money(oldPay));set('short-extra',money(Math.max(0,newPay-oldPay)));set('short-saving',money(Math.max(0,oldTotal-newTotal)));set('short-months',Math.max(0,oldN-newN)+' ay');
  }
  bind(['short-principal','short-rate','short-old-term','short-new-term'],calcShort,'mortgage-term-shortening');
}
if(document.getElementById('step-principal')){
  function calcStep(){
    var p=num('step-principal'),r=num('step-rate')/100,n=Math.max(1,num('step-term')),g=num('step-growth')/100,sum=0;
    for(var m=1;m<=n;m++){var factor=Math.pow(1+g,Math.floor((m-1)/12));sum+=factor/Math.pow(1+r,m)}
    var first=sum>0?p/sum:0,total=0,last=first;
    for(var k=1;k<=n;k++){var pay=first*Math.pow(1+g,Math.floor((k-1)/12));total+=pay;last=pay}
    var fixed=annuity(p,num('step-rate'),n),fixedTotal=fixed*n;
    set('step-main',money(first)+'/ay');set('step-last',money(last));set('step-total',money(total));set('step-fixed',money(fixed));set('step-diff',money(total-fixedTotal));
  }
  bind(['step-principal','step-rate','step-term','step-growth'],calcStep,'mortgage-step-up');
}
stepperize();
})();