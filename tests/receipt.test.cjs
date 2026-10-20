const assert=require('node:assert/strict');const fs=require('node:fs');const {ocrAmounts,extractCandidates}=require('../dist/receipt.js');
const app=fs.readFileSync('dist/app.js','utf8');eval(app.slice(app.indexOf('function parseAmount'),app.indexOf('const money')));
assert.equal(ocrAmounts('102,173,19')[0].amount,102173.19);assert.equal(ocrAmounts('68,115.46')[0].amount,68115.46);
assert.deepEqual(ocrAmounts('3,000000 -34.057,73').map(v=>v.amount),[34057.73]);
const receipt=`Total Costo Sindical: $ 22.705,16 Total Costo INSSJP
Empleador $ 11.352,58
Trabajador: S 11,352,58
Total Seguridad Social: $ 310.024,582 Total costo ART
Empleador S 185.146,48
Trabajador: S 124.878,34
Total Obra Social: $ 102,173,19 Empleade
Empleador $ 68,115.46
Trabajador: 5 34.057,73`;
const c=extractCandidates(receipt);assert.equal(c.length,3);assert.equal(c[0].kind,'total');assert.equal(c[0].amount,102173.19);assert.equal(c[0].verified,true);assert.equal(c[1].amount,34057.73);assert.equal(c[2].amount,68115.46);assert.equal(calculate(c[0].amount,15).net,86847.21);
const previous=extractCandidates('Total Obra Social: $ 128.926,41\nEmpleador: $ 85.950,94\nTrabajador: $ 42.975,47');assert(previous[0].verified);assert.equal(calculate(previous[0].amount,15).net,109587.45);
const individual=extractCandidates('0310 OBRA SOCIAL 3,000000 -34.057,73\n0302 LEY 19032 3,000000 -34.057,73');assert.equal(individual.length,1);assert.equal(individual[0].kind,'employee');assert.equal(individual[0].isTotal,false);
const withRightColumn=extractCandidates('Total Obra Social: $ 102.173,19 Total Costo SCVO: $ 424,62');assert.equal(withRightColumn[0].amount,102173.19);
assert.equal(extractCandidates('SUELDO BRUTO $ 1.268.647,65\nLey 19032 $34.057,73').length,0);
console.log('Pruebas de lectura de ambos recibos, separadores, columnas y aportes individuales: OK');
// Regression: the screenshot showed 173.19 because the leading 102 was separated.
for(const raw of ['102 173,19','102. 173,19','102,173,19','102.173,19'])assert.equal(ocrAmounts(raw)[0].amount,102173.19);
const spaced=extractCandidates('Total Obra Social: $ 102 173,19\nEmpleador: $ 68 115,46\nTrabajador: $ 34 057,73');assert(spaced[0].verified);assert.equal(spaced[0].amount,102173.19);
assert.equal(ocrAmounts('102173,190000').length,0);
const missingDecimal=extractCandidates('Total Obra Social: $ 102.173,19\n\nEmpleador: $ 6811546\n\nTrabajador: 5 34.057,73');assert(missingDecimal[0].verified);assert.equal(missingDecimal[0].amount,102173.19);
const corrupt=extractCandidates('Total Obra Social: $ 173,19\n\nEmpleador: $ 6811546\n\nTrabajador: $ 34.057,73');assert(!corrupt[0].verified);
const {extractSpatialCandidates}=require('../dist/receipt.js');
const words=[['Total',175,1858,222,1872],['Obra',231,1859,277,1873],['Social:',285,1858,349,1874],['167.924,40',456,1861,562,1879],['Empleador',256,1892,354,1909],['111.949,60',458,1895,563,1912],['rabajador',265,1922,351,1940],['55.974,80',469,1926,563,1945],['Empleador',723,1862,825,1883],['424,62',900,1862,1000,1883]].map(([text,x0,y0,x1,y1])=>({text,bbox:{x0,y0,x1,y1}}));
const spatial=extractSpatialCandidates({words},1800);assert(spatial.some(c=>c.verified&&c.amount===167924.4));assert.equal(calculate(spatial.find(c=>c.verified).amount,15).net,142735.74);
const columns=extractCandidates('Total Obra Social: $ 167.924,40 Total Costo SCVO $ 424,62\nEmpleador $ 111.949,60 Total Costo SCVO $ 424,62\nTrabajador $ 55.974,80');assert(columns[0].verified);
console.log('Tercer recibo: columnas y posiciones verificadas');
