(function(){
'use strict';
window.VolimetreGold={
  verifiedAt:'21 Kasım 2026',
  verifiedISO:'2026-11-21',
  ounceGram:31.1034768,
  fallback:{ounceUSD:3539.00,usdTRY:50.725,asOf:'21 Kasım 2026 referansı'},
  purity:{'24':1,'22':0.916,'21':0.875,'18':0.750,'14':0.583,'995':0.995,'9999':0.9999},
  coins:{
    quarter:{name:'Çeyrek Ziynet Altın',weight:1.754,purity:0.9166},
    half:{name:'Yarım Ziynet Altın',weight:3.508,purity:0.9166},
    full:{name:'Tam Ziynet Altın',weight:7.016,purity:0.9166},
    republic:{name:'Cumhuriyet Altını (Sikke Birlik)',weight:7.216,purity:0.9166}
  },
  sources:{
    goldApi:'https://api.gold-api.com/price/XAU',
    fxApi:'https://api.frankfurter.dev/v2/rate/USD/TRY',
    bist:'https://www.borsaistanbul.com/piyasalar/kiymetli-madenler-ve-kiymetli-taslar-piyasasi/kiymetli-madenler-piyasasi',
    mint:'https://www.darphane.gov.tr/cumhuriyet-altini-uretimi'
  }
};
})();