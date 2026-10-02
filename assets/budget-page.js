(function(){
'use strict';
var B=window.VolimetreBudget,app=document.getElementById('budget-app');if(!B||!app)return;
var tool=app.dataset.tool||'main';
function el(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function money(n){return B.money(n)}
function toast(msg){var old=document.querySelector('.budget-toast');if(old)old.remove();var t=el('div','budget-toast',msg);document.body.appendChild(t);setTimeout(function(){t.remove()},1800)}
function inputStepper(value,step,min,max,onChange,opts){
  opts=opts||{};var w=el('div','budget-step'),minus=el('button','minus','‹'),inp=document.createElement('input'),plus=el('button','plus','›');
  minus.type=plus.type='button';inp.type='number';inp.value=value;inp.step=step||1;if(min!==undefined)inp.min=min;if(max!==undefined)inp.max=max;
  function emit(v){v=Number(v)||0;if(min!==undefined)v=Math.max(min,v);if(max!==undefined)v=Math.min(max,v);inp.value=B.round(v);onChange(B.round(v))}
  minus.onclick=function(){emit((Number(inp.value)||0)-(Number(step)||1))};plus.onclick=function(){emit((Number(inp.value)||0)+(Number(step)||1))};
  inp.oninput=function(){emit(inp.value)};w.append(minus,inp,plus);return w;
}
function selectStepper(values,current,onChange){
  var w=el('div','budget-step'),minus=el('button','minus','‹'),s=document.createElement('select'),plus=el('button','plus','›');minus.type=plus.type='button';
  values.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v+' ay';if(Number(v)===Number(current))o.selected=true;s.appendChild(o)});
  function move(d){var i=Math.max(0,Math.min(s.options.length-1,s.selectedIndex+d));s.selectedIndex=i;onChange(Number(s.value))}
  minus.onclick=function(){move(-1)};plus.onclick=function(){move(1)};s.onchange=function(){onChange(Number(s.value))};w.append(minus,s,plus);return w;
}
function summaryCard(extraFree){
  var d=B.load(),t=B.totals(d),free=extraFree===undefined?t.free:extraFree,c=el('section','budget-summary');
  [['Toplam Gelir',t.income,''],['Zorunlu Giderler',-t.expenses,''],['Borç Ödemeleri',-t.debts,''],['Birikim',-t.savings,'']].forEach(function(r){var row=el('div','budget-row');row.append(el('span','',r[0]),el('strong','',money(r[1])));c.appendChild(row)});
  var total=el('div','budget-row total '+(free<0?'negative':'positive'));total.append(el('span','','Serbest Nakit'),el('strong','',money(free)));c.appendChild(total);return c;
}
function toolLinks(){
  var items=[['kredi-odeyebilir-miyim','Bu Krediyi Ödeyebilir miyim?'],['araba-alabilir-miyim','Bu Arabayı Alabilir miyim?'],['ev-kiralayabilir-miyim','Bu Evi Kiralayabilir miyim?'],['ne-kadar-kredi-odeyebilirim','Ne Kadar Kredi Kaldırabilirim?'],['borc-ne-zaman-biter','Borçlarımı Ne Zaman Bitiririm?'],['ne-kadar-biriktirebilirim','Ayda Ne Kadar Biriktirebilirim?'],['hedef-birikim','Hedef Birikim'],['nakit-mi-kredi-mi','Nakit mi Kredi mi?']];
  var box=el('div','budget-tools');items.forEach(function(x){var a=el('a','budget-tool-link');a.href='/butcem/'+x[0]+'/';a.append(el('strong','',x[1]),el('span','','Mevcut bütçenle anında simüle et.'));box.appendChild(a)});return box;
}
function renderMain(){
  app.innerHTML='';app.appendChild(summaryCard());
  var groups=[['incomes','Gelirler','Yeni gelir'],['expenses','Giderler','Yeni gider'],['debts','Borç ödemeleri','Yeni borç ödemesi'],['savings','Birikim','Yeni birikim']];
  groups.forEach(function(g){
    var d=B.load(),box=el('section','budget-group'),head=el('div','budget-group-head'),title=el('strong','',g[1]),add=el('button','budget-add','+');add.type='button';
    add.onclick=function(){B.addItem(g[0],g[2],0);renderMain()};head.append(title,add);box.appendChild(head);
    d[g[0]].forEach(function(it){
      var row=el('div','budget-item'),name=document.createElement('input'),remove=el('button','budget-remove','×');name.type='text';name.value=it.label;remove.type='button';
      name.onchange=function(){B.updateItem(g[0],it.id,{label:name.value.trim()||g[2]})};
      var step=inputStepper(it.amount,500,0,undefined,function(v){B.updateItem(g[0],it.id,{amount:v});refreshSummary()});
      remove.onclick=function(){B.removeItem(g[0],it.id);renderMain()};row.append(name,step,remove);box.appendChild(row);
    });app.appendChild(box);
  });
  var acts=el('div','budget-actions'),reset=el('button','budget-action','Sıfırla');reset.type='button';reset.onclick=function(){if(confirm('Bütçe verilerini sıfırlamak istiyor musunuz?')){B.clear();renderMain()}};
  acts.appendChild(reset);app.appendChild(acts);app.appendChild(el('p','budget-privacy','Verileriniz yalnızca bu tarayıcıdaki localStorage alanında tutulur; kişisel bütçe değerleri sunucuya gönderilmez.'));
  app.appendChild(toolLinks());
}
function refreshSummary(){
  var old=app.querySelector('.budget-summary');if(old)old.replaceWith(summaryCard());
}
function simShell(){
  app.innerHTML='';var t=B.totals(B.load());app.appendChild(summaryCard());var note=el('div','budget-context','Simülasyon mevcut bütçenizdeki '+money(t.free)+' serbest nakdi başlangıç kabul eder.');app.appendChild(note);var c=el('section','sim-card');app.appendChild(c);return {card:c,base:t}
}
function field(label,control,full){
  var f=el('div','sim-field'+(full?' full':''));f.append(el('label','',label),control);return f;
}
function metric(label,value,id){
  var m=el('div','sim-metric');m.append(el('span','',label),el('strong','',value));if(id)m.querySelector('strong').id=id;return m;
}
function addBudgetButton(label,amount,sourceKey,meta){
  var b=el('button','budget-action primary','Bütçeme Ekle');b.type='button';b.onclick=function(){B.addOrUpdateDebt({label:label,amount:amount(),sourceKey:sourceKey,meta:meta?meta():{}});toast('Bütçeye eklendi');};return b;
}
function renderCredit(){
  var s=simShell(),p=500000,r=3.49,n=36,grid=el('div','sim-grid'),res=el('div','sim-result');
  function calc(){var q=B.annuity(p,r,n),after=B.round(s.base.free-q);res.innerHTML='';res.append(el('div','sim-result-label','Aylık taksit'),el('div','sim-result-main',money(q)+'/ay'));
    var ms=el('div','sim-metrics');ms.append(metric('Toplam geri ödeme',money(q*n)),metric('Yeni serbest nakit',money(after)));res.appendChild(ms);
    var acts=el('div','budget-actions');acts.appendChild(addBudgetButton('Simüle edilen kredi taksiti',function(){return q},'budget-credit-sim',function(){return {principal:p,rate:r,term:n}}));res.appendChild(acts);
  }
  grid.append(field('Kredi tutarı',inputStepper(p,25000,0,undefined,function(v){p=v;calc()})),field('Vade',selectStepper([6,12,18,24,36,48,60],n,function(v){n=v;calc()})),field('Aylık faiz (%)',inputStepper(r,.05,0,undefined,function(v){r=v;calc()}),true));s.card.append(grid,res);calc();
}
function renderCar(){
  var s=simShell(),price=1500000,down=500000,credit=1000000,rate=3.49,term=36,fuel=4000,mtv=12000,ins=30000,maint=18000,grid=el('div','sim-grid'),res=el('div','sim-result');
  function calc(){var principal=Math.max(0,credit),loan=B.annuity(principal,rate,term),monthly=B.round(loan+fuel+(mtv+ins+maint)/12),after=B.round(s.base.free-monthly);
    res.innerHTML='';res.append(el('div','sim-result-label','Aracın yaklaşık aylık gerçek maliyeti'),el('div','sim-result-main',money(monthly)+'/ay'));
    var ms=el('div','sim-metrics');ms.append(metric('Kredi taksiti',money(loan)),metric('Kredi tutarı',money(principal)),metric('Aylık diğer giderler',money(monthly-loan)),metric('Yeni serbest nakit',money(after)));res.appendChild(ms);
    var acts=el('div','budget-actions');acts.appendChild(addBudgetButton('Araç aylık maliyeti',function(){return monthly},'budget-car-sim',function(){return {price:price,down:down,principal:principal}}));res.appendChild(acts);
  }
  grid.append(field('Araç fiyatı',inputStepper(price,50000,0,undefined,function(v){price=v;credit=Math.max(0,price-down);calc()})),field('Peşinat',inputStepper(down,25000,0,undefined,function(v){down=v;credit=Math.max(0,price-down);calc()})),field('Kredi',inputStepper(credit,25000,0,undefined,function(v){credit=v;calc()})),field('Vade',selectStepper([12,24,36,48],term,function(v){term=v;calc()})),field('Aylık faiz (%)',inputStepper(rate,.05,0,undefined,function(v){rate=v;calc()})),field('Yakıt / ay',inputStepper(fuel,500,0,undefined,function(v){fuel=v;calc()})),field('MTV / yıl',inputStepper(mtv,1000,0,undefined,function(v){mtv=v;calc()})),field('Sigorta + kasko / yıl',inputStepper(ins,2500,0,undefined,function(v){ins=v;calc()})),field('Bakım / yıl',inputStepper(maint,1000,0,undefined,function(v){maint=v;calc()})));s.card.append(grid,res);calc();
}
function findExpense(re){return B.load().expenses.filter(function(x){return re.test(x.label)}).reduce(function(a,x){return a+(Number(x.amount)||0)},0)}
function renderRent(){
  var s=simShell(),rent=30000,dues=2500,bills=5000,transport=0,grid=el('div','sim-grid'),res=el('div','sim-result');
  function calc(){var oldHousing=findExpense(/kira|konut/i)+findExpense(/fatura/i),newHousing=rent+dues+bills,after=B.round(s.base.free+oldHousing-newHousing-transport);
    res.innerHTML='';res.append(el('div','sim-result-label','Yeni konut sonrası serbest nakit'),el('div','sim-result-main',money(after)));
    var ms=el('div','sim-metrics');ms.append(metric('Yeni konut maliyeti',money(newHousing)),metric('Mevcut konut + fatura',money(oldHousing)),metric('Ulaşım farkı',money(transport)),metric('Aylık değişim',money(after-s.base.free)));res.appendChild(ms);
  }
  grid.append(field('Aylık kira',inputStepper(rent,1000,0,undefined,function(v){rent=v;calc()})),field('Aidat',inputStepper(dues,250,0,undefined,function(v){dues=v;calc()})),field('Faturalar',inputStepper(bills,500,0,undefined,function(v){bills=v;calc()})),field('Ulaşım farkı',inputStepper(transport,250,-50000,undefined,function(v){transport=v;calc()})));s.card.append(grid,res);calc();
}
function renderCapacity(){
  var s=simShell(),rate=3.49,grid=el('div','sim-grid'),res=el('div','sim-result'),pay=Math.max(0,s.base.free);
  function calc(){res.innerHTML='';res.append(el('div','sim-result-label','Teorik kullanılabilir aylık taksit'),el('div','sim-result-main',money(pay)+'/ay'));var list=el('div','capacity-list');
    [12,24,36,48,60].forEach(function(n){var row=el('div','capacity-line');row.append(el('span','',n+' ay'),el('span','',money(pay)+'/ay'),el('strong','',money(B.principalFromPayment(pay,rate,n))));list.appendChild(row)});res.appendChild(list);
    res.appendChild(el('p','budget-context','Bu değer, serbest nakdin tamamını taksite ayıran teorik üst sınırdır; güvenlik payı bırakmaz.'));
  }
  grid.append(field('Aylık faiz (%)',inputStepper(rate,.05,0,undefined,function(v){rate=v;calc()}),true));s.card.append(grid,res);calc();
}
function addMonths(d,n){var x=new Date(d);x.setMonth(x.getMonth()+n);return x}
function monthText(n){if(!isFinite(n)||n>600)return '600+ ay';var d=addMonths(new Date(),n);return n+' ay · '+d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'})}
function renderDebtPayoff(){
  var s=simShell(),KEY='volimetre:budget:payoff:v1',rows;try{rows=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!Array.isArray(rows)||!rows.length)rows=[{id:B.uid(),label:'Kredi kartı',balance:50000,rate:3.75,payment:5000}];
  function save(){localStorage.setItem(KEY,JSON.stringify(rows))}
  function months(x){var bal=Number(x.balance)||0,pay=Number(x.payment)||0,r=(Number(x.rate)||0)/100,m=0;if(pay<=bal*r)return Infinity;while(bal>.5&&m<601){bal+=bal*r;bal-=Math.min(pay,bal);m++}return m}
  function draw(){s.card.innerHTML='';var head=el('div','budget-group-head');head.append(el('strong','','Borçlar'),el('button','budget-add','+'));head.querySelector('button').onclick=function(){rows.push({id:B.uid(),label:'Yeni borç',balance:0,rate:0,payment:0});save();draw()};s.card.appendChild(head);
    rows.forEach(function(x){var e=el('div','debt-entry'),top=el('div','debt-entry-top'),name=document.createElement('input'),bal=document.createElement('input'),rate=document.createElement('input'),pay=document.createElement('input');
      name.value=x.label;bal.type=rate.type=pay.type='number';bal.value=x.balance;rate.value=x.rate;pay.value=x.payment;bal.placeholder='Borç';rate.placeholder='Aylık %';pay.placeholder='Aylık ödeme';
      [name,bal,rate,pay].forEach(function(i){i.oninput=function(){x.label=name.value;x.balance=Number(bal.value)||0;x.rate=Number(rate.value)||0;x.payment=Number(pay.value)||0;save();result.textContent=monthText(months(x))}});
      top.append(name,bal,rate);e.appendChild(top);var payRow=el('div','debt-entry-top');payRow.style.marginTop='8px';payRow.append(pay);var rm=el('button','budget-action','Sil');rm.type='button';rm.onclick=function(){rows=rows.filter(function(y){return y.id!==x.id});save();draw()};payRow.appendChild(rm);e.appendChild(payRow);
      var foot=el('div','debt-entry-result'),result=el('strong','',monthText(months(x)));foot.append(el('span','','Tahmini kapanış'),result);e.appendChild(foot);s.card.appendChild(e);
    });
  }draw();
}
function renderSavings(){
  var s=simShell(),t=s.base,potential=B.round(t.savings+Math.max(0,t.free));s.card.innerHTML='';s.card.append(el('div','sim-result-label','Aylık potansiyel birikim'),el('div','sim-result-main',money(potential)+'/ay'));
  var ms=el('div','sim-metrics');ms.append(metric('Mevcut düzenli birikim',money(t.savings)),metric('Serbest nakitten ek',money(Math.max(0,t.free))),metric('Yıllık potansiyel',money(potential*12)),metric('5 yılda (getirisiz)',money(potential*60)));s.card.appendChild(ms);
}
function renderGoal(){
  var s=simShell(),target=1000000,monthly=B.round(s.base.savings+Math.max(0,s.base.free)),grid=el('div','sim-grid'),res=el('div','sim-result');
  function calc(){var months=monthly>0?Math.ceil(target/monthly):Infinity;res.innerHTML='';res.append(el('div','sim-result-label','Hedefe tahmini süre'),el('div','sim-result-main',isFinite(months)?(months+' ay'):'—'));
    var ms=el('div','sim-metrics');ms.append(metric('Hedef',money(target)),metric('Aylık birikim',money(monthly)),metric('Yaklaşık yıl',isFinite(months)?(months/12).toFixed(1).replace('.',',')+' yıl':'—'),metric('Getiri varsayımı','%0'));res.appendChild(ms);
  }
  grid.append(field('Hedef tutar',inputStepper(target,50000,0,undefined,function(v){target=v;calc()})),field('Aylık birikim',inputStepper(monthly,1000,0,undefined,function(v){monthly=v;calc()})));s.card.append(grid,res);calc();
}
function renderCashCredit(){
  var s=simShell(),price=500000,reserve=750000,rate=3.49,term=24,grid=el('div','sim-grid'),res=el('div','sim-result');
  function calc(){var q=B.annuity(price,rate,term),total=B.round(q*term),cashLeft=B.round(reserve-price),creditFree=B.round(s.base.free-q);
    res.innerHTML='';res.append(el('div','sim-result-label','Kredi aylık taksiti'),el('div','sim-result-main',money(q)+'/ay'));var ms=el('div','sim-metrics');
    ms.append(metric('Nakit ödersen kalan birikim',money(cashLeft)),metric('Kredi toplam geri ödeme',money(total)),metric('Kredi finansman maliyeti',money(total-price)),metric('Kredi sonrası serbest nakit',money(creditFree)));res.appendChild(ms);
    var acts=el('div','budget-actions');acts.appendChild(addBudgetButton('Nakit yerine kredi taksiti',function(){return q},'budget-cash-credit',function(){return {price:price,rate:rate,term:term}}));res.appendChild(acts);
  }
  grid.append(field('Harcama tutarı',inputStepper(price,25000,0,undefined,function(v){price=v;calc()})),field('Mevcut birikim',inputStepper(reserve,25000,0,undefined,function(v){reserve=v;calc()})),field('Aylık faiz (%)',inputStepper(rate,.05,0,undefined,function(v){rate=v;calc()})),field('Vade',selectStepper([6,12,18,24,36,48],term,function(v){term=v;calc()})));s.card.append(grid,res);calc();
}
var renders={main:renderMain,credit:renderCredit,car:renderCar,rent:renderRent,capacity:renderCapacity,'debt-payoff':renderDebtPayoff,savings:renderSavings,goal:renderGoal,'cash-credit':renderCashCredit};
(renders[tool]||renderMain)();
})();