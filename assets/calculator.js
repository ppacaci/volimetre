(function(){
'use strict';

var app=document.getElementById('app');
if(!app)return;

var initial={
  a:Number(app.dataset.amount)||100000,
  t:Number(app.dataset.term)||24,
  r:Number(app.dataset.rate)||2.99
};
var data=[initial];
var openPanel=null;
var lockAmount=app.dataset.lockAmount==='true';
var mode=app.dataset.mode||'default';

function money(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(n))}
function shortMoney(n){if(n>=1000000){var m=n/1000000;return (Number.isInteger(m)?m:m.toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',','))+' M'}return Math.round(n/1000)+' B'}
function rateText(r){return '%'+Number(r).toFixed(2).replace('.',',')}
function pay(p,r,n){
  var mr=r/100;
  if(mode==='consumer'||mode==='vehicle'||mode==='togg')mr*=1.30;
  else if(mode==='business')mr*=1.05;
  if(mr===0)return p/n;
  var z=Math.pow(1+mr,n);
  return p*mr*z/(z-1);
}
function consumerMaxTerm(a){
  if(a<=125000)return 36;
  if(a<=250000)return 24;
  return 12;
}
function consumerCosts(a){
  var allocation=a*.005;
  var allocationTax=allocation*.15;
  return {allocation:allocation,allocationTax:allocationTax,total:allocation+allocationTax};
}
function vehicleCosts(a){
  var allocation=a*.005;
  var allocationTax=allocation*.15;
  var pledge=350.92;
  return {allocation:allocation,allocationTax:allocationTax,pledge:pledge,total:allocation+allocationTax+pledge};
}
function businessCosts(a){
  var service=a*.005;
  var serviceTax=service*.05;
  return {service:service,serviceTax:serviceTax,total:service+serviceTax};
}
function mortgageCosts(a){
  var allocation=a*.005;
  var appraisal=28202;
  var mortgage=3600;
  return {allocation:allocation,appraisal:appraisal,mortgage:mortgage,total:allocation+appraisal+mortgage};
}
function btn(text,cls){var b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls||'choice';return b}
function uniq(arr){return Array.from(new Set(arr.filter(function(v){return Number.isFinite(v)&&v>0}).map(function(v){return +v.toFixed(2)}))).sort(function(a,b){return a-b})}

function amountChoices(v){
  var presets=mode==='mortgage'
    ?[500000,750000,1000000,1500000,2000000,2500000,3000000,5000000,7500000,10000000]
    :mode==='consumer'
      ?[10000,25000,50000,75000,100000,125000,150000,200000,250000,300000,500000]
      :mode==='vehicle'
        ?[25000,50000,75000,100000,150000,200000,250000,300000,500000]
        :mode==='togg'
          ?[500000,600000,700000,800000,900000,1300000,1500000,1700000,2325000,3050000]
          :mode==='business'||mode==='esnaf-kefalet'
            ?[50000,100000,250000,500000,750000,1000000,1500000]
            :[10000,25000,50000,75000,100000,150000,250000,500000,750000,1000000];
  presets.push(v);
  return uniq(presets).sort(function(a,b){return a-b});
}
function termChoices(v,a){
  var presets=mode==='mortgage'?[12,24,36,48,60,84,120]
    :mode==='consumer'?[6,12,18,24,36]
    :mode==='vehicle'?[12,24,36,48]
    :mode==='togg'?[10,12,24,36,48]
    :mode==='esnaf-kefalet'?[12,24,36,48]
    :mode==='business'?[6,12,18,24,36,48,60]
    :[6,12,18,24,36,48,60];
  if(mode==='consumer')presets=presets.filter(function(x){return x<=consumerMaxTerm(a)});
  presets.push(v);
  return uniq(presets).filter(function(x){return Number.isInteger(x)&&x>=1&&(mode!=='consumer'||x<=consumerMaxTerm(a))}).sort(function(a,b){return a-b});
}
function rateChoices(v){return uniq([Math.max(0,v-.50),Math.max(0,v-.25),v,v+.25,v+.50])}

function amountStep(v,dir){
  var x=dir<0?Math.max(0,v-.001):v;
  if(mode==='mortgage'||mode==='business'||mode==='esnaf-kefalet'||mode==='togg'){
    if(x<1000000)return 50000;
    if(x<5000000)return 100000;
    return 250000;
  }
  if(x<10000)return 500;
  if(x<25000)return 1000;
  if(x<50000)return 2500;
  if(x<100000)return 5000;
  if(x<250000)return 10000;
  return 25000;
}

function render(){
  app.innerHTML='';

  data.forEach(function(s,i){
    var q=pay(s.a,s.r,s.t),total=q*s.t;
    var c=document.createElement('section');
    c.className='card '+(i?'':'main');
    c.innerHTML=(i?'<button type="button" class="remove" aria-label="Karşılaştırmayı kaldır">×</button>':'')+
      '<div class="monthly">'+money(q)+' / ay</div>'+
      '<div class="total">Toplam '+money(total)+'</div>'+
      '<div class="fields"></div><div class="panel"></div>';

    if(i)c.querySelector('.remove').onclick=function(){data.splice(i,1);openPanel=null;render()};

    var f=c.querySelector('.fields'),p=c.querySelector('.panel');
    var fields=[
      {k:'a',text:money(s.a),label:'Tutar',vals:amountChoices(s.a),fmt:shortMoney},
      {k:'t',text:s.t+' AY',label:'Vade',vals:termChoices(s.t,s.a),fmt:function(v){return v+' AY'}},
      {k:'r',text:rateText(s.r),label:'Aylık faiz',vals:rateChoices(s.r),fmt:rateText}
    ];

    fields.forEach(function(x){
      var id=i+':'+x.k;

      if(lockAmount && x.k==='a'){
        var locked=document.createElement('div');
        locked.className='fieldlocked';
        locked.textContent=x.text;
        locked.setAttribute('aria-label','Tutar sabit: '+x.text);
        f.appendChild(locked);
        return;
      }

      var split=document.createElement('div');
      split.className='fieldsplit';

      function nudge(dir){
        if(x.k==='a'){
          var st=amountStep(s.a,dir);
          s.a=Math.max(5000,s.a+dir*st);
          if(mode==='consumer')s.t=Math.min(s.t,consumerMaxTerm(s.a));
        }else if(x.k==='t'){
          var maxTerm=mode==='mortgage'?120
            :mode==='consumer'?consumerMaxTerm(s.a)
            :(mode==='vehicle'||mode==='togg'||mode==='esnaf-kefalet')?48
            :999;
          s.t=Math.max(1,Math.min(maxTerm,s.t+dir));
        }else{
          s.r=Math.max(0,+(s.r+dir*.05).toFixed(2));
        }
        openPanel=null;
        render();
      }

      var left=btn('‹','fieldzone minus');
      left.setAttribute('aria-label',x.label+' azalt');
      left.title=x.label+' azalt';
      left.onclick=function(e){e.stopPropagation();nudge(-1)};

      var center=btn(x.text,'fieldcenter');
      center.setAttribute('aria-label',x.label+' seçeneklerini aç');
      if(openPanel===id)center.classList.add('active');
      center.onclick=function(e){e.stopPropagation();openPanel=openPanel===id?null:id;render()};

      var right=btn('›','fieldzone plus');
      right.setAttribute('aria-label',x.label+' artır');
      right.title=x.label+' artır';
      right.onclick=function(e){e.stopPropagation();nudge(1)};

      split.appendChild(left);
      split.appendChild(center);
      split.appendChild(right);
      f.appendChild(split);

      if(openPanel===id){
        p.classList.add('open');
        var title=document.createElement('div');
        title.className='panel-title';
        title.textContent=x.label;
        p.appendChild(title);

        var choiceRow=document.createElement('div');
        choiceRow.className='panel-row';
        x.vals.forEach(function(v){
          var b=btn(x.fmt(v));
          if(Math.abs(v-s[x.k])<.001)b.classList.add('selected');
          b.onclick=function(e){
            e.stopPropagation();
            s[x.k]=v;
            if(mode==='consumer'&&x.k==='a')s.t=Math.min(s.t,consumerMaxTerm(s.a));
            openPanel=null;
            render();
          };
          choiceRow.appendChild(b);
        });
        p.appendChild(choiceRow);
      }
    });

    if(mode==='business' && i===0){
      var bc=businessCosts(s.a);
      var businessCostsBox=document.createElement('details');
      businessCostsBox.className='cost-estimate';
      businessCostsBox.innerHTML=
        '<summary><span>Tahmini banka masrafı</span><strong>~'+money(bc.total)+'</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Örnek kullandırım (~%0,5)</span><strong>'+money(bc.service)+'</strong></div>'+
          '<div><span>Ücret BSMV (%5)</span><strong>'+money(bc.serviceTax)+'</strong></div>'+
          '<p>Bu oran yalnızca yaklaşık karşılaştırma içindir. Ticari kredi tahsis/kullandırım ücretleri bankaya ve ürüne göre değişebilir. TL ticari kredi faiz hesabında %5 BSMV dikkate alınır, KKDF uygulanmaz.</p>'+
        '</div>';
      c.appendChild(businessCostsBox);
    }

    if(mode==='esnaf-kefalet' && i===0){
      var kefaletCostsBox=document.createElement('details');
      kefaletCostsBox.className='cost-estimate';
      kefaletCostsBox.innerHTML=
        '<summary><span>Kooperatif kesintileri</span><strong>Değişken</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Bloke sermaye</span><strong>Kooperatife göre</strong></div>'+
          '<div><span>Yıllık masraf karşılığı</span><strong>Kooperatife göre</strong></div>'+
          '<div><span>Risk fonu</span><strong>Kooperatife göre</strong></div>'+
          '<div><span>Üst kuruluş katılım payı</span><strong>Kooperatife göre</strong></div>'+
          '<p>ESKKK kefaletli Halkbank kredileri BSMV istisnası kapsamındadır. Kesinti tutarları kooperatif ve kredi dosyasına göre değişebildiği için toplam rakam verilmez.</p>'+
        '</div>';
      c.appendChild(kefaletCostsBox);
    }

    if(mode==='togg' && i===0){
      var tc=vehicleCosts(s.a);
      var toggCostsBox=document.createElement('details');
      toggCostsBox.className='cost-estimate';
      toggCostsBox.innerHTML=
        '<summary><span>Tahmini ek masraf</span><strong>~'+money(tc.total)+'</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Tahsis (~%0,5)</span><strong>'+money(tc.allocation)+'</strong></div>'+
          '<div><span>Tahsis BSMV (%15)</span><strong>'+money(tc.allocationTax)+'</strong></div>'+
          '<div><span>Rehin tesis (referans)</span><strong>'+money(tc.pledge)+'</strong></div>'+
          '<p>Kampanya bankasına göre ücretler değişebilir veya bazı kalemler alınmayabilir. Kasko, trafik ve hayat sigortası dahil değildir.</p>'+
        '</div>';
      c.appendChild(toggCostsBox);
    }

    if(mode==='consumer' && i===0){
      var cc=consumerCosts(s.a);
      var consumerCostsBox=document.createElement('details');
      consumerCostsBox.className='cost-estimate';
      consumerCostsBox.innerHTML=
        '<summary><span>Tahmini ek masraf</span><strong>~'+money(cc.total)+'</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Tahsis (%0,5)</span><strong>'+money(cc.allocation)+'</strong></div>'+
          '<div><span>Tahsis BSMV (%15)</span><strong>'+money(cc.allocationTax)+'</strong></div>'+
          '<p>Aylık taksit hesabında faiz üzerinden %15 BSMV ve %15 KKDF dikkate alınır. Hayat sigortası dahil değildir.</p>'+
        '</div>';
      c.appendChild(consumerCostsBox);
    }

    if(mode==='vehicle' && i===0){
      var vc=vehicleCosts(s.a);
      var vehicleCostsBox=document.createElement('details');
      vehicleCostsBox.className='cost-estimate';
      vehicleCostsBox.innerHTML=
        '<summary><span>Tahmini ek masraf</span><strong>~'+money(vc.total)+'</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Tahsis (%0,5)</span><strong>'+money(vc.allocation)+'</strong></div>'+
          '<div><span>Tahsis BSMV (%15)</span><strong>'+money(vc.allocationTax)+'</strong></div>'+
          '<div><span>Rehin tesis (referans)</span><strong>'+money(vc.pledge)+'</strong></div>'+
          '<p>Aylık taksit hesabında faiz üzerinden %15 BSMV ve %15 KKDF dikkate alınır. Kasko, trafik ve hayat sigortası dahil değildir.</p>'+
        '</div>';
      c.appendChild(vehicleCostsBox);
    }

    if(mode==='mortgage' && i===0){
      var mc=mortgageCosts(s.a);
      var costs=document.createElement('details');
      costs.className='cost-estimate';
      costs.innerHTML=
        '<summary><span>Tahmini ek masraf</span><strong>~'+money(mc.total)+'</strong></summary>'+
        '<div class="cost-lines">'+
          '<div><span>Tahsis (~%0,5)</span><strong>'+money(mc.allocation)+'</strong></div>'+
          '<div><span>Ekspertiz (referans)</span><strong>'+money(mc.appraisal)+'</strong></div>'+
          '<div><span>İpotek tesis (referans)</span><strong>'+money(mc.mortgage)+'</strong></div>'+
          '<p>Sigorta, tapu harcı ve duruma göre uygulanabilecek vergiler dahil değildir. Ekspertiz ve ipotek tutarları örnek referanstır.</p>'+
        '</div>';
      c.appendChild(costs);
    }

    if(i){
      var m=data[0],mq=pay(m.a,m.r,m.t),mt=mq*m.t;
      var md=q-mq,td=total-mt,d=document.createElement('div');
      d.className='diff';
      d.textContent='Ana hesaba göre: aylık '+(md>=0?'+':'−')+money(Math.abs(md))+' · toplam '+(td>=0?'+':'−')+money(Math.abs(td));
      d.style.color=s.a===m.a?(td<0?'var(--good)':td>0?'var(--bad)':'var(--muted)'):'var(--muted)';
      c.appendChild(d);
    }

    app.appendChild(c);
  });

  var main=data[0];
  var box=document.createElement('div');
  box.className='addbox';

  var plus=btn('+','add');
  plus.setAttribute('aria-label','Karşılaştırma ekle');
  plus.onclick=function(e){
    e.stopPropagation();
    data.push({a:main.a,t:main.t,r:main.r});
    openPanel=null;
    render();
  };

  box.appendChild(plus);
  app.appendChild(box);

  document.onclick=function(){
    if(openPanel!==null){
      openPanel=null;
      render();
    }
  };
}

render();
})();
