(()=>{
function loadSiteShell(){if(window.__volimetreShellLoading||document.querySelector('script[src="/assets/site-shell.js"]'))return;window.__volimetreShellLoading=1;const s=document.createElement('script');s.src='/assets/site-shell.js';s.defer=true;document.head.appendChild(s)}
loadSiteShell();
const DAY=86400000;
const qs=(s,r=document)=>r.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const localISO=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const atMidnight=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const parseDate=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmt=d=>new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'}).format(d);
const wholeDays=(a,b)=>Math.round((atMidnight(b)-atMidnight(a))/DAY);
const set=(el,text)=>{if(el)el.textContent=text};
const render=(box,main,sub,stats=[])=>{
 set(qs('[data-result-main]',box),main);set(qs('[data-result-sub]',box),sub);
 const grid=qs('[data-result-grid]',box);if(grid){grid.innerHTML=stats.map(x=>'<div class="time-stat"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')}
};
const untilStats=(from,to)=>{
 const d=wholeDays(from,to),abs=Math.abs(d);
 return [[abs,'gün'],[Math.floor(abs/7),'tam hafta'],[abs*24,'saat']];
};
const nextDateForDay=(day)=>{
 const now=new Date();let y=now.getFullYear(),m=now.getMonth();
 const mk=()=>new Date(y,m,Math.min(day,new Date(y,m+1,0).getDate()));
 let d=mk();if(atMidnight(d)<=atMidnight(now)){m++;if(m>11){m=0;y++}d=mk()}return d;
};
function countdown(box){
 const input=qs('[data-target-date]',box),name=qs('[data-event-name]',box);
 const run=()=>{const t=parseDate(input.value);if(!t)return render(box,'Tarih seçin','Hedef tarihi seçtiğinizde sonuç anında görünür.');
 const now=new Date(),d=wholeDays(now,t),n=(name&&name.value.trim())||'Hedef tarih';
 if(d>=0)render(box,d+' gün kaldı',n+': '+fmt(t),untilStats(now,t));
 else render(box,Math.abs(d)+' gün geçti',n+' '+fmt(t)+' tarihindeydi.',untilStats(t,now));
 };
 input.addEventListener('change',run);if(name)name.addEventListener('input',run);
 qs('[data-run]',box)?.addEventListener('click',run);
 const p=new URLSearchParams(location.search);if(p.get('t'))input.value=p.get('t');if(name&&p.get('n'))name.value=p.get('n');run();
}
function since(box){
 const input=qs('[data-start-date]',box),run=()=>{const t=parseDate(input.value);if(!t)return render(box,'Tarih seçin','Başlangıç tarihini seçin.');
 const now=new Date(),d=wholeDays(t,now);if(d<0)return render(box,Math.abs(d)+' gün kaldı',fmt(t)+' henüz gelmedi.',untilStats(now,t));
 render(box,d+' gün oldu',fmt(t)+' tarihinden bugüne.',[[d,'gün'],[Math.floor(d/7),'tam hafta'],[d*24,'saat']]);};
 input.addEventListener('change',run);qs('[data-run]',box)?.addEventListener('click',run);run();
}
function between(box){
 const a=qs('[data-date-a]',box),b=qs('[data-date-b]',box),inclusive=qs('[data-inclusive]',box);
 const run=()=>{const da=parseDate(a.value),db=parseDate(b.value);if(!da||!db)return render(box,'İki tarih seçin','Başlangıç ve bitiş tarihini girin.');
 let d=Math.abs(wholeDays(da,db));if(inclusive?.checked)d+=1;
 render(box,d+' gün',fmt(da)+' ile '+fmt(db)+' arası.',[[d,'gün'],[Math.floor(d/7),'tam hafta'],[d%7,'artan gün']]);};
 [a,b,inclusive].forEach(x=>x?.addEventListener('change',run));qs('[data-run]',box)?.addEventListener('click',run);run();
}
function hours(box){
 const input=qs('[data-target-datetime]',box),run=()=>{if(!input.value)return render(box,'Tarih ve saat seçin','Hedef anı seçtiğinizde kalan süre görünür.');
 const t=new Date(input.value),now=new Date(),ms=t-now,abs=Math.abs(ms),h=Math.floor(abs/3600000),m=Math.floor((abs%3600000)/60000),days=Math.floor(h/24);
 render(box,h+' saat '+m+' dk '+(ms>=0?'kaldı':'geçti'),fmt(t)+' · '+pad(t.getHours())+':'+pad(t.getMinutes()),[[days,'tam gün'],[h,'toplam saat'],[Math.floor(abs/60000),'dakika']]);};
 input.addEventListener('input',run);qs('[data-run]',box)?.addEventListener('click',run);run();setInterval(run,60000);
}
function newyear(box){
 const now=new Date();let y=now.getFullYear()+1,t=new Date(y,0,1);const d=wholeDays(now,t);
 render(box,d+' gün kaldı',y+' yılı '+fmt(t)+' başlıyor.',[[d,'gün'],[Math.floor(d/7),'tam hafta'],[d*24,'saat']]);
}
function weekend(box){
 const now=atMidnight(new Date()),dow=now.getDay();let add=(dow===0||dow===6)?0:6-dow;const t=new Date(now);t.setDate(t.getDate()+add);
 if(add===0)render(box,'Bugün hafta sonu',dow===0?'Bugün Pazar.':'Bugün Cumartesi.',[[0,'gün'],[0,'saat'],[1,'hafta sonu günü']]);
 else render(box,add+' gün kaldı','Cumartesi: '+fmt(t),[[add,'gün'],[add*24,'saat'],[Math.max(0,5-dow),'iş günü']]);
}
function monthend(box){
 const now=new Date(),t=new Date(now.getFullYear(),now.getMonth()+1,1),d=wholeDays(now,t);
 render(box,d+' gün kaldı','Yeni ay '+fmt(t)+' başlıyor.',[[d,'gün'],[Math.floor(d/7),'tam hafta'],[new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),'bu ayın gün sayısı']]);
}
function dayofyear(box){
 const now=new Date(),start=new Date(now.getFullYear(),0,1),next=new Date(now.getFullYear()+1,0,1);
 const ordinal=wholeDays(start,now)+1,total=wholeDays(start,next),left=total-ordinal,pct=(ordinal/total*100);
 render(box,ordinal+'. gün','Bugün '+now.getFullYear()+' yılının '+ordinal+'. günü.',[[left,'yılın kalan günü'],[total,'yıldaki gün'],[pct.toFixed(1)+'%','yılın geçen kısmı']]);
 const bar=qs('[data-progress]',box);if(bar)bar.style.width=pct+'%';
}
function salary(box){
 const input=qs('[data-salary-day]',box);const saved=localStorage.getItem('volimetre_salary_day');if(saved)input.value=saved;
 const run=()=>{const day=Math.min(31,Math.max(1,Number(input.value)||1));localStorage.setItem('volimetre_salary_day',day);const now=new Date(),t=nextDateForDay(day),d=wholeDays(now,t);
 render(box,d+' gün kaldı','Sıradaki maaş günü: '+fmt(t),[[d,'gün'],[Math.floor(d/7),'tam hafta'],[d*24,'saat']]);};
 input.addEventListener('input',run);qs('[data-run]',box)?.addEventListener('click',run);run();
}
function birthday(box){
 const input=qs('[data-birthday]',box),run=()=>{const d=parseDate(input.value);if(!d)return render(box,'Doğum tarihinizi seçin','Yıl yalnızca yaş hesabında kullanılır.');
 const now=new Date();let t=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(atMidnight(t)<atMidnight(now))t=new Date(now.getFullYear()+1,d.getMonth(),d.getDate());
 const left=wholeDays(now,t),age=t.getFullYear()-d.getFullYear();
 render(box,left===0?'Bugün doğum gününüz!':left+' gün kaldı',left===0?age+'. yaşınıza bugün girdiniz.':age+'. yaş gününüz: '+fmt(t),[[left,'gün'],[Math.floor(left/7),'tam hafta'],[age,'olacağınız yaş']]);};
 input.addEventListener('change',run);qs('[data-run]',box)?.addEventListener('click',run);run();
}
document.querySelectorAll('[data-time-tool]').forEach(box=>{
 const type=box.dataset.timeTool;
 ({countdown,since,between,hours,newyear,weekend,monthend,dayofyear,salary,birthday}[type]||(()=>{}))(box);
});
})();