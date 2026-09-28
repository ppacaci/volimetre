(function(){
'use strict';

var app=document.getElementById('deposit-app');
if(!app)return;

var initial={
  a:Number(app.dataset.amount)||500000,
  d:Number(app.dataset.days)||32,
  r:Number(app.dataset.rate)||40
};
var data=[initial];
var openPanel=null;

function money(n){
  return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(n));
}
function shortMoney(n){
  if(n>=1000000){
    var m=n/1000000;
    return (Number.isInteger(m)?m:m.toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',','))+' M';
  }
  return Math.round(n/1000)+' B';
}
function rateText(r){return '%'+Number(r).toFixed(2).replace('.',',');}
function btn(text,cls){var b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls||'choice';return b;}
function uniq(arr){
  return Array.from(new Set(arr.filter(function(v){return Number.isFinite(v)&&v>=0}).map(function(v){return +v.toFixed(2);}))).sort(function(a,b){return a-b;});
}
function daysInCalculationYear(){
  var y=new Date().getFullYear();
  return ((y%4===0&&y%100!==0)||y%400===0)?366:365;
}
function addMonthsClamped(date,months){
  var d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  var day=d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth()+months);
  var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  d.setDate(Math.min(day,last));
  return d;
}
function addYearsClamped(date,years){
  var d=new Date(date.getFullYear()+years,date.getMonth(),1);
  var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  d.setDate(Math.min(date.getDate(),last));
  return d;
}
function stopajRate(days){
  var start=new Date();
  start=new Date(start.getFullYear(),start.getMonth(),start.getDate());
  var maturity=new Date(start);
  maturity.setDate(maturity.getDate()+days);
  var sixMonths=addMonthsClamped(start,6);
  var oneYear=addYearsClamped(start,1);
  if(maturity<=sixMonths)return 17.5;
  if(maturity<=oneYear)return 15;
  return 10;
}
function calc(s){
  var base=daysInCalculationYear();
  var gross=s.a*(s.r/100)*s.d/base;
  var taxRate=stopajRate(s.d);
  var tax=gross*(taxRate/100);
  var net=gross-tax;
  return {gross:gross,taxRate:taxRate,tax:tax,net:net,final:s.a+net,base:base};
}
function amountChoices(v){
  var p=[10000,50000,100000,250000,500000,1000000,2000000,5000000];
  p.push(v);
  return uniq(p);
}
function dayChoices(v){
  var p=[7,30,32,45,92,181,365];
  p.push(v);
  return uniq(p).filter(function(x){return Number.isInteger(x)&&x>=1;});
}
function rateChoices(v){
  var p=[30,35,40,45,50,v];
  return uniq(p);
}
function amountStep(v,dir){
  var x=dir<0?Math.max(0,v-.001):v;
  if(x<100000)return 5000;
  if(x<500000)return 25000;
  if(x<1000000)return 50000;
  if(x<5000000)return 100000;
  return 250000;
}

function render(){
  app.innerHTML='';

  data.forEach(function(s,i){
    var cals=calc(s);
    var c=document.createElement('section');
    c.className='card '+(i?'':'main');
    c.innerHTML=(i?'<button type="button" class="remove" aria-label="Karşılaştırmayı kaldır">×</button>':'')+
      '<div class="monthly">'+money(cals.net)+' net kazanç</div>'+
      '<div class="total">Vade sonu '+money(cals.final)+'</div>'+
      '<div class="fields"></div><div class="panel"></div>';

    if(i)c.querySelector('.remove').onclick=function(){data.splice(i,1);openPanel=null;render();};

    var f=c.querySelector('.fields'),p=c.querySelector('.panel');
    var fields=[
      {k:'a',text:money(s.a),label:'Anapara',vals:amountChoices(s.a),fmt:shortMoney},
      {k:'d',text:s.d+' GÜN',label:'Vade',vals:dayChoices(s.d),fmt:function(v){return v+' GÜN';}},
      {k:'r',text:rateText(s.r),label:'Yıllık faiz',vals:rateChoices(s.r),fmt:rateText}
    ];

    fields.forEach(function(x){
      var id=i+':'+x.k;
      var split=document.createElement('div');
      split.className='fieldsplit';

      function nudge(dir){
        if(x.k==='a'){
          var st=amountStep(s.a,dir);
          s.a=Math.max(1000,s.a+dir*st);
        }else if(x.k==='d'){
          s.d=Math.max(1,s.d+dir);
        }else{
          s.r=Math.max(0,+(s.r+dir*.25).toFixed(2));
        }
        openPanel=null;
        render();
      }

      var left=btn('‹','fieldzone minus');
      left.setAttribute('aria-label',x.label+' azalt');
      left.onclick=function(e){e.stopPropagation();nudge(-1);};

      var center=btn(x.text,'fieldcenter');
      center.setAttribute('aria-label',x.label+' seçeneklerini aç');
      if(openPanel===id)center.classList.add('active');
      center.onclick=function(e){e.stopPropagation();openPanel=openPanel===id?null:id;render();};

      var right=btn('›','fieldzone plus');
      right.setAttribute('aria-label',x.label+' artır');
      right.onclick=function(e){e.stopPropagation();nudge(1);};

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

        var row=document.createElement('div');
        row.className='panel-row';
        x.vals.forEach(function(v){
          var b=btn(x.fmt(v));
          if(Math.abs(v-s[x.k])<.001)b.classList.add('selected');
          b.onclick=function(e){
            e.stopPropagation();
            s[x.k]=v;
            openPanel=null;
            render();
          };
          row.appendChild(b);
        });
        p.appendChild(row);
      }
    });

    var detail=document.createElement('details');
    detail.className='cost-estimate';
    detail.innerHTML=
      '<summary><span>Vergi detayı</span><strong>Stopaj %'+String(cals.taxRate).replace('.',',')+'</strong></summary>'+
      '<div class="cost-lines">'+
        '<div><span>Brüt faiz</span><strong>'+money(cals.gross)+'</strong></div>'+
        '<div><span>Stopaj (%'+String(cals.taxRate).replace('.',',')+')</span><strong>−'+money(cals.tax)+'</strong></div>'+
        '<div><span>Net faiz</span><strong>'+money(cals.net)+'</strong></div>'+
        '<div><span>Vade sonu</span><strong>'+money(cals.final)+'</strong></div>'+
        '<p>Brüt faiz, '+cals.base+' günlük yıl bazında hesaplanır. Stopaj oranı, bugün açılan bir TL mevduat hesabının vadesine göre otomatik seçilir.</p>'+
      '</div>';
    c.appendChild(detail);

    if(i){
      var mainCalc=calc(data[0]);
      var diff=cals.net-mainCalc.net;
      var d=document.createElement('div');
      d.className='diff';
      d.textContent='Ana hesaba göre net kazanç '+(diff>=0?'+':'−')+money(Math.abs(diff));
      d.style.color=s.a===data[0].a&&s.d===data[0].d?(diff>0?'var(--good)':diff<0?'var(--bad)':'var(--muted)'):'var(--muted)';
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
    data.push({a:main.a,d:main.d,r:main.r});
    openPanel=null;
    render();
  };
  box.appendChild(plus);
  app.appendChild(box);

  document.onclick=function(){
    if(openPanel!==null){openPanel=null;render();}
  };
}

render();
})();