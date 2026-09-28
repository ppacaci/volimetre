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

function money(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.round(n))}
function shortMoney(n){if(n>=1000000){var m=n/1000000;return (Number.isInteger(m)?m:m.toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',','))+' M'}return Math.round(n/1000)+' B'}
function rateText(r){return '%'+Number(r).toFixed(2).replace('.',',')}
function pay(p,r,n){var mr=r/100;if(mr===0)return p/n;var z=Math.pow(1+mr,n);return p*mr*z/(z-1)}
function btn(text,cls){var b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls||'choice';return b}
function uniq(arr){return Array.from(new Set(arr.filter(function(v){return Number.isFinite(v)&&v>0}).map(function(v){return +v.toFixed(2)}))).sort(function(a,b){return a-b})}

function amountChoices(v){
  var presets=[10000,25000,50000,75000,100000,150000,250000,500000,750000,1000000];
  presets.push(v);
  return uniq(presets).sort(function(a,b){return a-b});
}
function termChoices(v){
  var presets=[6,12,18,24,36,48,60];
  presets.push(v);
  return uniq(presets).filter(function(x){return Number.isInteger(x)&&x>=1}).sort(function(a,b){return a-b});
}
function rateChoices(v){return uniq([Math.max(0,v-.50),Math.max(0,v-.25),v,v+.25,v+.50])}

function amountStep(v,dir){
  var x=dir<0?Math.max(0,v-.001):v;
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
      {k:'t',text:s.t+' AY',label:'Vade',vals:termChoices(s.t),fmt:function(v){return v+' AY'}},
      {k:'r',text:rateText(s.r),label:'Aylık faiz',vals:rateChoices(s.r),fmt:rateText}
    ];

    fields.forEach(function(x){
      var id=i+':'+x.k;
      var split=document.createElement('div');
      split.className='fieldsplit';

      function nudge(dir){
        if(x.k==='a'){
          var st=amountStep(s.a,dir);
          s.a=Math.max(5000,s.a+dir*st);
        }else if(x.k==='t'){
          s.t=Math.max(1,s.t+dir);
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
          b.onclick=function(e){e.stopPropagation();s[x.k]=v;openPanel=null;render()};
          choiceRow.appendChild(b);
        });
        p.appendChild(choiceRow);
      }
    });

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
