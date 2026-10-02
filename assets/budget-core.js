(function(w){
'use strict';
var KEY='volimetre:budget:v1';
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function round(n){return Math.round((Number(n)||0)*100)/100}
function item(label,amount){return {id:uid(),label:label,amount:round(amount||0)}}
function defaults(){return {
  incomes:[item('Aylık net gelir',0),item('Ek gelir',0)],
  expenses:[item('Kira / konut gideri',0),item('Faturalar',0),item('Market / yaşam giderleri',0),item('Ulaşım',0),item('Araç giderleri',0),item('Diğer düzenli giderler',0)],
  debts:[item('Kredi taksitleri',0),item('Kredi kartı ödemeleri',0),item('KMH ödemeleri',0)],
  savings:[item('Düzenli birikim',0)]
}}
function load(){
  try{
    var raw=localStorage.getItem(KEY),d=raw?JSON.parse(raw):null;
    if(!d||!Array.isArray(d.incomes)||!Array.isArray(d.expenses)||!Array.isArray(d.debts)||!Array.isArray(d.savings))return defaults();
    return d;
  }catch(e){return defaults()}
}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}}
function sum(arr){return round((arr||[]).reduce(function(a,x){return a+(Number(x.amount)||0)},0))}
function totals(d){
  var income=sum(d.incomes),expenses=sum(d.expenses),debts=sum(d.debts),savings=sum(d.savings);
  return {income:income,expenses:expenses,debts:debts,savings:savings,free:round(income-expenses-debts-savings)}
}function money(n){
  var sign=Number(n)<0?'-':'';
  return sign+new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Math.abs(round(n)));
}
function annuity(principal,monthlyRate,months){
  principal=round(principal);monthlyRate=Number(monthlyRate)||0;months=Math.max(1,Math.round(Number(months)||1));
  var r=monthlyRate/100;if(!r)return round(principal/months);
  var z=Math.pow(1+r,months);return round(principal*r*z/(z-1));
}
function principalFromPayment(payment,monthlyRate,months){
  payment=round(payment);monthlyRate=Number(monthlyRate)||0;months=Math.max(1,Math.round(Number(months)||1));
  var r=monthlyRate/100;if(!r)return round(payment*months);
  return round(payment*(1-Math.pow(1+r,-months))/r);
}
function addOrUpdateDebt(entry){
  var d=load(),key=entry.sourceKey||'',found=key?d.debts.find(function(x){return x.sourceKey===key}):null;
  if(found){found.label=entry.label||found.label;found.amount=round(entry.amount);found.meta=entry.meta||found.meta}
  else d.debts.push({id:uid(),label:entry.label||'Yeni borç ödemesi',amount:round(entry.amount),sourceKey:key,meta:entry.meta||{}});
  save(d);return d;
}
function addItem(group,label,amount){
  var d=load();if(!d[group])return d;d[group].push(item(label||'Yeni kalem',amount||0));save(d);return d;
}
function updateItem(group,id,patch){
  var d=load(),x=(d[group]||[]).find(function(v){return v.id===id});if(!x)return d;
  if(patch.label!==undefined)x.label=patch.label;if(patch.amount!==undefined)x.amount=round(patch.amount);save(d);return d;
}
function removeItem(group,id){var d=load();d[group]=(d[group]||[]).filter(function(x){return x.id!==id});save(d);return d}
function clear(){var d=defaults();save(d);return d}
w.VolimetreBudget={KEY:KEY,load:load,save:save,totals:totals,money:money,round:round,annuity:annuity,principalFromPayment:principalFromPayment,addOrUpdateDebt:addOrUpdateDebt,addItem:addItem,updateItem:updateItem,removeItem:removeItem,clear:clear,uid:uid};
})(window);