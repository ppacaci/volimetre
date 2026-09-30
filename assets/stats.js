(function(){
'use strict';

var pageList=document.getElementById('page-stats');
var toolList=document.getElementById('tool-stats');
var period=document.getElementById('stats-period');
var updated=document.getElementById('stats-updated');

var toolNames={
  'general-credit':'Genel kredi hesaplama',
  'mortgage':'Konut kredisi hesaplama',
  'consumer':'İhtiyaç kredisi hesaplama',
  'vehicle':'Taşıt kredisi hesaplama',
  'business':'Esnaf / ticari kredi hesaplama',
  'esnaf-kefalet':'Esnaf kefalet kredisi hesaplama',
  'togg':'TOGG kredi hesaplama',
  'deposit':'Mevduat faizi hesaplama',
  'pension-promo':'Emekli promosyon hesaplama',
  'card-minimum':'Kredi kartı asgari ödeme',
  'card-restructure':'Kredi kartı borç yapılandırma'
};

function tr(n){return new Intl.NumberFormat('tr-TR').format(Number(n)||0)}

function titleFromPath(path){
  if(path!=='/' && path.slice(-1)!=='/')path+='/';
  var known={
    '/':'Ana sayfa',
    '/kredi-hesaplama/':'Kredi Hesaplama',
    '/konut-kredisi-hesaplama/':'Konut Kredisi Hesaplama',
    '/ihtiyac-kredisi-hesaplama/':'İhtiyaç Kredisi Hesaplama',
    '/tasit-kredisi-hesaplama/':'Taşıt Kredisi Hesaplama',
    '/esnaf-kredisi-hesaplama/':'Esnaf Kredisi Hesaplama',
    '/esnaf-kefalet-kredisi-hesaplama/':'Esnaf Kefalet Kredisi Hesaplama',
    '/togg-kredi-hesaplama/':'TOGG Kredi Hesaplama',
    '/mevduat-faizi-hesaplama/':'Mevduat Faizi Hesaplama',
    '/faizsiz-kredi/':'Faizsiz Kredi',
    '/emekli-promosyon-hesaplama/':'Emekli Promosyon Hesaplama',
    '/kredi-karti-asgari-odeme-hesaplama/':'Kredi Kartı Asgari Ödeme Hesaplama',
    '/kredi-karti-borc-yapilandirma-hesaplama/':'Kredi Kartı Borç Yapılandırma Hesaplama',
    '/50-bin-tl-kredi-hesaplama/':'50 Bin TL Kredi Hesaplama',
    '/100-bin-tl-kredi-hesaplama/':'100 Bin TL Kredi Hesaplama',
    '/250-bin-tl-kredi-hesaplama/':'250 Bin TL Kredi Hesaplama',
    '/500-bin-tl-kredi-hesaplama/':'500 Bin TL Kredi Hesaplama',
    '/1-milyon-tl-kredi-hesaplama/':'1 Milyon TL Kredi Hesaplama',
    '/istatistikler/':'İstatistikler',
    '/sicak-teklifler/':'Sıcak Teklifler'
  };
  return known[path]||path;
}

function rowLink(item){
  var row=document.createElement('div');
  row.className='stats-row';
  var a=document.createElement('a');
  a.href=item.path;
  a.textContent=titleFromPath(item.path);
  var views=document.createElement('div');
  views.className='stats-value';
  views.innerHTML='<strong>'+tr(item.pageviews)+'</strong><span>görüntülenme</span>';
  var visitors=document.createElement('div');
  visitors.className='stats-value visitors';
  visitors.innerHTML='<strong>'+tr(item.visitors)+'</strong><span>ziyaretçi</span>';
  row.appendChild(a);
  row.appendChild(views);
  row.appendChild(visitors);
  return row;
}

function rowTool(item){
  var row=document.createElement('div');
  row.className='stats-row';
  var name=document.createElement('div');
  name.className='stats-name';
  name.textContent=toolNames[item.tool]||item.tool;
  var uses=document.createElement('div');
  uses.className='stats-value';
  uses.innerHTML='<strong>'+tr(item.uses)+'</strong><span>kullanım</span>';
  var visitors=document.createElement('div');
  visitors.className='stats-value visitors';
  visitors.innerHTML='<strong>'+tr(item.visitors)+'</strong><span>kullanıcı</span>';
  row.appendChild(name);
  row.appendChild(uses);
  row.appendChild(visitors);
  return row;
}

function empty(el,text){
  el.innerHTML='<div class="stats-empty">'+text+'</div>';
}

fetch('/api/stats?days=30',{headers:{'Accept':'application/json'}})
  .then(function(r){return r.json().then(function(data){if(!r.ok)throw new Error(data.message||'Veri alınamadı');return data})})
  .then(function(data){
    period.textContent='Son '+data.period.days+' gün';
    updated.textContent='Canlı Vercel Analytics';
    pageList.innerHTML='';
    toolList.innerHTML='';
    if(data.pages.length)data.pages.forEach(function(x){pageList.appendChild(rowLink(x))});
    else empty(pageList,'Bu dönem için sayfa ziyareti bulunamadı.');
    if(data.tools.length)data.tools.forEach(function(x){toolList.appendChild(rowTool(x))});
    else empty(toolList,'Henüz araç kullanım olayı kaydedilmedi.');
  })
  .catch(function(err){
    period.textContent='Son 30 gün';
    updated.textContent='Veri bağlantısı bekleniyor';
    pageList.innerHTML='<div class="stats-error">'+err.message+'</div>';
    toolList.innerHTML='<div class="stats-error">Araç kullanım verileri Vercel Analytics bağlantısı tamamlandığında burada görünecek.</div>';
  });
})();