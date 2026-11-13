(function(){
'use strict';
if(window.__volimetreSiteShellReady)return;
window.__volimetreSiteShellReady=true;
var path=location.pathname.replace(/\/+/g,'/');
var finance=!/^\/(zaman-hesaplama|kac-gun-|kac-saat-|iki-tarih-arasi|yilbasina-|hafta-sonuna-|ayin-bitmesine-|bugun-yilin-|maasa-|dogum-gunume-|son-odeme-tarihine-|hakkimizda|hesaplama-yontemi-kaynaklar|guncelleme-politikasi|gizlilik|iletisim)/.test(path);
function title(){
  var h=document.querySelector('h1');
  return h?h.textContent.trim():(document.title.split('|')[0].split('—')[0].trim()||'Volimetre');
}
function addJson(data,id){
  if(id&&document.getElementById(id))return;
  var s=document.createElement('script');s.type='application/ld+json';if(id)s.id=id;s.textContent=JSON.stringify(data);document.head.appendChild(s);
}
function category(){
  if(path.indexOf('/kredi-karti-')===0||path.indexOf('/nakit-avans-')===0||path.indexOf('/pesin-mi-taksit-')===0)return ['Kredi Kartı Araçları','/kredi-karti-hesaplama/'];
  if(path.indexOf('/butcem')===0)return ['Bütçem','/butcem/'];
  if(/^\/(zaman-hesaplama|kac-gun-|kac-saat-|iki-tarih-arasi|yilbasina-|hafta-sonuna-|ayin-bitmesine-|bugun-yilin-|maasa-|dogum-gunume-|son-odeme-tarihine-)/.test(path))return ['Zaman Araçları','/zaman-hesaplama/'];
  if(/^\/(hakkimizda|hesaplama-yontemi-kaynaklar|guncelleme-politikasi|gizlilik|iletisim)/.test(path))return ['Volimetre','/'];
  return ['Finans Araçları','/kredi-hesaplama/'];
}
function breadcrumbs(){
  if(path==='/'||document.querySelector('.site-breadcrumb'))return;
  var cat=category(),items=[['Ana sayfa','/']];
  if(path!==cat[1])items.push(cat);
  items.push([title(),path]);
  var nav=document.createElement('nav');nav.className='site-breadcrumb';nav.setAttribute('aria-label','Sayfa yolu');
  items.forEach(function(x,i){
    if(i)nav.appendChild(document.createTextNode(' › '));
    if(i===items.length-1){var span=document.createElement('span');span.textContent=x[0];nav.appendChild(span)}
    else{var a=document.createElement('a');a.href=x[1];a.textContent=x[0];nav.appendChild(a)}
  });
  var header=document.querySelector('header');if(header)header.insertAdjacentElement('afterend',nav);
  addJson({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':items.map(function(x,i){return {'@type':'ListItem','position':i+1,'name':x[0],'item':'https://volimetre.com.tr'+x[1]}})},'volimetre-breadcrumb-schema');
}
function globalSchema(){
  addJson({'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':'https://volimetre.com.tr/#organization','name':'Volimetre','url':'https://volimetre.com.tr/','logo':'https://volimetre.com.tr/assets/logo-volimetre.png'},
    {'@type':'WebSite','@id':'https://volimetre.com.tr/#website','url':'https://volimetre.com.tr/','name':'Volimetre','publisher':{'@id':'https://volimetre.com.tr/#organization'},'inLanguage':'tr-TR'}
  ]},'volimetre-site-schema');
}
function footer(){
  var f=document.querySelector('footer');if(!f||f.dataset.trustLinks)return;f.dataset.trustLinks='1';
  f.innerHTML='volimetre · <a href="/hakkimizda/">hakkımızda</a> · <a href="/hesaplama-yontemi-kaynaklar/">yöntem ve kaynaklar</a> · <a href="/guncelleme-politikasi/">güncelleme</a> · <a href="/gizlilik/">gizlilik</a> · <a href="/iletisim/">iletişim</a> · <a href="/istatistikler/">istatistikler</a> · <a href="https://websitenyokmu.com.tr" target="_blank" rel="noopener noreferrer">websitenyokmu.com.tr</a> tarafından geliştirildi.';
}
function ensureRegs(cb){
  if(window.VolimetreRegulations){cb();return}
  var old=document.querySelector('script[src="/assets/regulations.js"]');if(old){old.addEventListener('load',cb,{once:true});return}
  var s=document.createElement('script');s.src='/assets/regulations.js';s.onload=cb;document.head.appendChild(s);
}
function sourceFor(p,R){
  var S=R.sources;
  if(p.indexOf('/kredi-karti-asgari-odeme')===0)return S.bddkCardMinimum;
  if(p.indexOf('/kredi-karti-')===0||p.indexOf('/nakit-avans-')===0)return S.tcmbCard;
  if(p.indexOf('/mevduat-faizi')===0)return S.gibDeposit;
  if(p.indexOf('/ihtiyac-kredisi')===0)return S.bddkConsumer;
  if(p.indexOf('/tasit-kredisi')===0||p.indexOf('/togg-kredi')===0)return S.bddk;
  if(p.indexOf('/konut-kredisi')===0||p.indexOf('/ipotekli-kredi')===0)return S.bddk;
  if(p.indexOf('/sicak-teklifler')===0)return {name:'Resmî banka kampanya sayfaları',url:'/sicak-teklifler/'};
  return S.bddk;
}
function trust(){
  if(!finance||document.querySelector('.source-card'))return;
  ensureRegs(function(){
    var R=window.VolimetreRegulations,src=sourceFor(path,R),box=document.createElement('section');box.className='source-card';
    box.innerHTML='<div><strong>Kaynak ve güncellik</strong><span>Son doğrulama: '+R.verifiedAt+'</span></div>'+
      '<p>Hesaplama varsayımları düzenli olarak resmî kaynaklarla kontrol edilir. Banka teklifi ve kişisel onay sonucu değildir.</p>'+
      '<div class="source-links"><a href="'+src.url+'" '+(src.url.charAt(0)==='/'?'':'target="_blank" rel="noopener noreferrer"')+'>'+src.name+'</a><a href="/hesaplama-yontemi-kaynaklar/">Hesaplama yöntemi</a><a href="/iletisim/">Hata bildir</a></div>';
    var faq=document.querySelector('.geo-faq'),f=document.querySelector('footer');(faq||f)?.insertAdjacentElement('beforebegin',box);
  });
}
var faqData={
  '/kredi-hesaplama/':[
    ['100.000 TL kredi aylık %2,99 faizle 24 ayda yaklaşık ne olur?','Vergi ve ek masraf hariç eşit taksit varsayımında yaklaşık 5.898 TL aylık taksit ve 141.561 TL toplam taksit ödemesi oluşur. Gerçek banka teklifi farklı olabilir.'],
    ['100.000 TL kredide 12 ay ile 24 ay arasındaki temel fark nedir?','Aynı %2,99 aylık faiz varsayımında 12 ay yaklaşık 10.040 TL/ay, 24 ay yaklaşık 5.898 TL/aydır; vade uzadıkça aylık yük düşerken toplam ödeme yükselir.']
  ],
  '/ihtiyac-kredisi-hesaplama/':[
    ['125.000 TL ihtiyaç kredisinde azami vade kaç ay?','BDDK 11152 kararındaki genel sınıra göre 125.000 TL ve altındaki tüketici kredilerinde azami vade 36 aydır.'],
    ['250.001 TL ihtiyaç kredisi için 24 ay seçilebilir mi?','Genel vade sınırına göre hayır. 250.000 TL üzerindeki tüketici kredilerinde azami vade 12 aydır.']
  ],
  '/kredi-karti-asgari-odeme-hesaplama/':[
    ['75.000 TL limit ve 30.000 TL dönem borcunda asgari ödeme kaç TL?','1 Ekim 2026 tarihli BDDK 11581 kararındaki 100.000 TL eşiğine göre oran %20 olur; asgari ödeme 6.000 TL’dir.'],
    ['150.000 TL limit ve 30.000 TL dönem borcunda asgari ödeme kaç TL?','Kart limiti 100.000 TL’nin üzerinde olduğu için oran %40 olur; 30.000 TL dönem borcunda asgari ödeme 12.000 TL’dir.']
  ],
  '/kredi-karti-faiz-hesaplama/':[
    ['20.000 TL dönem borcunda Kasım 2026 azami aylık akdi faiz kaç?','TCMB’nin 1 Kasım 2026 tablosunda 30.000 TL altı dönem borcu için azami aylık akdi faiz %3,25’tir. Banka daha düşük oran uygulayabilir.'],
    ['100.000 TL dönem borcunda Kasım 2026 azami aylık akdi faiz kaç?','30.000–180.000 TL aralığında azami aylık akdi faiz %3,75’tir.']
  ],
  '/kredi-karti-gecikme-faizi-hesaplama/':[
    ['20.000 TL dönem borcunda Kasım 2026 azami gecikme faizi kaç?','TCMB tablosunda 30.000 TL altı dönem borcu için azami aylık gecikme faizi %3,55’tir.'],
    ['100.000 TL dönem borcunda Kasım 2026 azami gecikme faizi kaç?','30.000–180.000 TL aralığında azami aylık gecikme faizi %4,05’tir.']
  ],
  '/kredi-karti-borc-yapilandirma-hesaplama/':[
    ['Yapılandırmada aylık faiz üst sınırı Kasım 2026’da kaç?','TCMB’ye göre ilgili yapılandırmalarda aylık akdi faiz aylık referans oranı olan %3,11’i aşamaz.'],
    ['29 Ocak 2026 kararındaki üç aylık başvuru süresi hâlâ açık mı?','Hayır. 11366 sayılı karardaki özel üç aylık başvuru penceresi sona ermiştir; yeni bir yapılandırma için bankanın güncel uygulamasını kontrol etmek gerekir.']
  ],
  '/konut-kredisi-hesaplama/':[
    ['1.000.000 TL konut kredisi aylık %2,99 ile 120 ayda yaklaşık kaç TL taksit olur?','Eşit taksit varsayımında yaklaşık 30.798 TL/ay oluşur; ekspertiz, ipotek ve sigorta gibi ek maliyetler ayrıca değerlendirilmelidir.'],
    ['60 ay mı 120 ay mı toplamda daha ucuz olur?','Aynı faiz oranında 60 ayın aylık taksiti daha yüksek, toplam faiz yükü ise genellikle daha düşüktür.']
  ],
  '/tasit-kredisi-hesaplama/':[
    ['100.000 TL taşıt kredisi aylık %3,40 ile 48 ayda yaklaşık ne olur?','Faiz üzerindeki %15 BSMV ve %15 KKDF varsayımıyla yaklaşık 5.054 TL aylık taksit ve 242.586 TL toplam taksit ödemesi oluşur.'],
    ['Araç değeri kredi tutarını neden sınırlar?','Taşıt kredilerinde azami kredi oranı ve vade araç değerine ve aracın türüne göre değişebildiği için yalnızca taksit hesabı gerçek kullanılabilir limiti göstermez.']
  ],
  '/gelirime-gore-ne-kadar-kredi-alabilirim/':[
    ['Aylık 50.000 TL net gelir tek başına kredi limitini belirler mi?','Hayır. Mevcut borçlar, zorunlu giderler, kredi notu, ürün vadesi ve bankanın politikası birlikte değerlendirilir.'],
    ['Gelir hesabında brüt mü net gelir mi kullanmalıyım?','Kişisel ödeme kapasitesini test ederken elinize geçen net gelir daha anlamlıdır.']
  ],
  '/sicak-teklifler/':[
    ['13 Kasım 2026 itibarıyla listede süresi dolmuş Ekim kampanyası var mı?','Hayır. Ekim sonunda biten DenizBank ve araç kampanyaları güncel listeden çıkarıldı; yalnızca yeniden doğrulanan teklifler gösteriliyor.'],
    ['150.000 TL faizsiz QNB fırsatı tek kredi mi?','Hayır. 25.000 TL ihtiyaç kredisi, 25.000 TL taksitli nakit avans ve 100.000 TL Taksitli Ek Hesap gibi ayrı ürünlerin üst limitlerinin toplamıdır.']
  ],
  '/mevduat-faizi-hesaplama/':[
    ['32 günlük TL mevduatta stopaj oranı kaç?','Bugün açılan 6 aya kadar vadeli TL mevduat için hesaplayıcı %17,5 stopaj varsayımını kullanır.'],
    ['1 yıla kadar TL mevduatta stopaj oranı kaç?','6 aydan uzun ve 1 yıla kadar vadeli TL mevduatta hesaplayıcı %15 stopaj uygular.']
  ],
  '/butcem/':[
    ['Aylık 60.000 TL gelir ve 45.000 TL toplam gider varsa serbest nakit kaç TL?','Basit bütçe hesabında serbest nakit 15.000 TL’dir. Yeni kredi veya hedef eklerken bu tutarın tamamını zorunlu olarak kullanılabilir kabul etmemek gerekir.'],
    ['Serbest nakit -5.000 TL çıkarsa ne anlama gelir?','Planlanan aylık gider ve borçlar geliri 5.000 TL aşıyor demektir; yeni borç eklemeden önce açığı kapatmak gerekir.']
  ]
};
function upgradeFaq(){
  var rows=faqData[path];if(!rows)return;
  var items=document.querySelectorAll('.geo-faq-list .geo-faq-item');
  rows.forEach(function(q,i){var it=items[i];if(!it)return;var s=it.querySelector('summary'),p=it.querySelector('p');if(s)s.textContent=q[0];if(p)p.textContent=q[1]});
  var schema=document.querySelector('script[data-geo-schema]');
  if(schema){try{var j=JSON.parse(schema.textContent),g=j['@graph']||[],faq=g.find(function(x){return x['@type']==='FAQPage'});if(faq&&faq.mainEntity){rows.forEach(function(q,i){if(faq.mainEntity[i])faq.mainEntity[i]={'@type':'Question','name':q[0],'acceptedAnswer':{'@type':'Answer','text':q[1]}}});schema.textContent=JSON.stringify(j)}}catch(e){}}
}
function run(){globalSchema();breadcrumbs();footer();trust();upgradeFaq()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();