(function(){
'use strict';
window.VolimetreRegulations={
  verifiedAt:'13 Kasım 2026',
  verifiedISO:'2026-11-13',
  sources:{
    bddk:{name:'BDDK',url:'https://www.bddk.org.tr/Mevzuat/Liste/56'},
    bddkCardMinimum:{name:'BDDK 11581 (01.10.2026)',url:'https://www.bddk.org.tr/Mevzuat/DokumanGetir/1349'},
    bddkConsumer:{name:'BDDK 11152 (13.02.2025)',url:'https://www.bddk.org.tr/Mevzuat/EkGetir/1210?ekId=259'},
    tcmbCard:{name:'TCMB Kredi Kartı Azami Faiz Oranları',url:'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Istatistikler/Bankacilik%2BVerileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari'},
    gibDeposit:{name:'GİB Geçici 67 / Mevduat Tevkifat Oranları',url:'https://gib.gov.tr/mevzuat/kanun/433/bkk/1237'}
  },
  cardMinimum:{threshold:100000,lowRate:20,highRate:40,decision:'11581',decisionDate:'2026-10-01'},
  cardInterest:{
    effective:'2026-11-01',
    referenceRate:3.11,
    bands:[
      {max:30000,contractual:3.25,late:3.55},
      {max:180000,contractual:3.75,late:4.05},
      {max:null,contractual:4.25,late:4.55}
    ],
    cash:{contractual:4.25,late:4.55}
  },
  consumerLoan:{
    tiers:[
      {max:125000,maxTerm:36},
      {max:250000,maxTerm:24},
      {max:null,maxTerm:12}
    ]
  },
  taxes:{
    consumer:{bsmv:15,kkdf:15},
    vehicle:{bsmv:15,kkdf:15},
    business:{bsmv:5,kkdf:0},
    allocationFeePct:0.5,
    allocationFeeBsmv:15
  },
  deposit:{
    stopaj:[
      {maxMonths:6,rate:17.5},
      {maxMonths:12,rate:15},
      {maxMonths:null,rate:10}
    ]
  },
  estimates:{
    vehiclePledge:350.92,
    mortgageAppraisal:28202,
    mortgageRegistration:3600
  }
};
})();