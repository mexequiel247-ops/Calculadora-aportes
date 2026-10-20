function ocrAmounts(text) {
  // Preserve spaces used in place of thousands separators, without matching token suffixes.
  const matches = text.match(/(?<![\d.,])(?:\d{1,3}(?:[., \u00a0]+\d{3})+|\d+)[.,]\s*\d{2}(?![\d.,])/g) || [];
  return matches.map(raw => ({raw, amount:Number(raw.replace(/\D/g,''))/100}))
    .filter(value => Number.isFinite(value.amount) && value.amount > 0);
}
function normalizeLabel(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[|_]/g,' ').replace(/0(?=[a-z])/gi,'o').toLowerCase();
}
function detailAmounts(row) {
  const amounts = ocrAmounts(row);
  if (amounts.length) return amounts;
  // A lost decimal separator is usable only when the total validates the component sum.
  const raw = row.match(/(?:\$|\b[S5])\s*(\d{4,12})(?![\d.,])/);
  return raw ? [{amount:Number(raw[1])/100}] : [];
}
function extractCandidates(text) {
  const rows=text.split(/\n/).filter(row=>row.trim()), out=[];
  for (let i=0;i<rows.length;i++) {
    const row=rows[i], label=normalizeLabel(row);
    const social=/(?:obra\s*social|o\.?\s*s\.?\s*s\.?|oo\.?\s*ss\.?)/i.exec(label);
    if (!social) continue;
    const isTotal=/\b(?:total|otal)\s*obra\s*social/.test(label);
    const kind=isTotal?'total':/contrib/.test(label)?'employer':'employee';
    let amounts=ocrAmounts(row.slice(social.index+social[0].length));
    if (!amounts.length && isTotal && i+1<rows.length && !/[a-z]/i.test(rows[i+1])) amounts=ocrAmounts(rows[i+1]);
    const value=isTotal?amounts[0]:amounts[amounts.length-1];
    const candidate=value?{label:row.trim(),amount:value.amount,kind,isTotal}:null;
    if (candidate) out.push(candidate);
    if (!isTotal) continue;
    let employee, employer;
    for (let j=i+1;j<Math.min(rows.length,i+5);j++) {
      const line=normalizeLabel(rows[j]);
      // A different column may mention another total on this same row.
      if (/^\W*(?:total|otal|obra\s*social)\b/.test(line)) break;
      const values=detailAmounts(rows[j]);
      if (/empleador/.test(line) && values[0]) employer=values[0].amount;
      if (/\b(?:trabajador|rabajador)\b/.test(line) && values[0]) employee=values[0].amount;
    }
    if (employee && employer) {
      out.push({label:'Detalle de obra social: trabajador',amount:employee,kind:'employee',isTotal:false},
        {label:'Detalle de obra social: empleador',amount:employer,kind:'employer',isTotal:false});
      if (candidate && Math.abs(employee+employer-candidate.amount)<.025) candidate.verified=true;
    }
  }
  return out;
}
function spatialReceiptText(words, width, rightFraction) {
  const selected=(words||[]).filter(word=>word.text?.trim() && word.bbox && word.bbox.x1<=width*rightFraction)
    .map(word=>({...word,cy:(word.bbox.y0+word.bbox.y1)/2,height:word.bbox.y1-word.bbox.y0}))
    .sort((a,b)=>a.cy-b.cy);
  const rows=[];
  for (const word of selected) {
    const previous=rows[rows.length-1];
    if (previous && Math.abs(word.cy-previous.cy)<=Math.max(word.height,previous.height)*.85) {
      previous.words.push(word);
      previous.cy=previous.words.reduce((sum,w)=>sum+w.cy,0)/previous.words.length;
      previous.height=Math.max(previous.height,word.height);
    } else rows.push({words:[word],cy:word.cy,height:word.height});
  }
  return rows.map(row=>row.words.sort((a,b)=>a.bbox.x0-b.bbox.x0).map(word=>word.text).join(' ')).join('\n');
}
function extractSpatialCandidates(data,width) {
  return [.42,.5].flatMap(fraction=>extractCandidates(spatialReceiptText(data.words,width,fraction)));
}
if (typeof module!=='undefined') module.exports={ocrAmounts,extractCandidates,extractSpatialCandidates,spatialReceiptText};
