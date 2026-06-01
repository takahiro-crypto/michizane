// reference/mockup.html §4 の score(bu) を忠実移植。
// 変更点は INITS を引数で受け取る点のみ（モックではモジュールスコープに置かれていた）。

export function score(bu, INITS) {
 const g=bu.plan.growth/20, focus=bu.plan.focus;
 return INITS.map(it=>{
   const ls=bu.logs[it.log]||0;
   let leverFit, impact, side;
   if(it.lever==='rev'){leverFit=focus==='growth'?1.6:(g>=1?1.3:0.9); impact=it.baseRev*(0.6+g*0.4)*(0.7+ls*0.6); side='rev';}
   else if(it.lever==='cost'){leverFit=focus==='cost'?1.6:1.0; impact=it.baseCost*(0.8+ls*0.6)*(focus==='cost'?1.15:1.0); side='cost';}
   else{leverFit=focus==='labor'?1.5:(focus==='cost'?1.2:(focus==='growth'?1.1:1.0)); impact=it.baseCost*(0.8+ls*0.6)*(bu.plan.head.indexOf('削減')>=0?1.2:1.0); side='cost';}
   const easeF=0.7+it.ease*0.08;
   const sc=(0.5+ls)*leverFit*easeF;
   return {...it,impact,side,ls,sc};
 }).sort((a,b)=>b.sc-a.sc);
}

// モックアップ準拠：上位5件で P/L 集計、年額換算（×12）。
export function summarize(top) {
  let cost = 0, rev = 0;
  for (const it of top) {
    if (it.side === 'rev') rev += it.impact;
    else cost += it.impact;
  }
  return {
    monthlyCost: cost,
    monthlyRev: rev,
    annualCost: cost * 12,
    annualRev: rev * 12,
    annualTotal: (cost + rev) * 12,
  };
}

