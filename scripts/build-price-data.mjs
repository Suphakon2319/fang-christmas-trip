// Compile only the V5 price database for the restored first-published UI.
import fs from 'node:fs';
const input=new URL('../travel_research/prices.json',import.meta.url);
const output=new URL('../js/prices-v5-data.js',import.meta.url);
const prices=JSON.parse(fs.readFileSync(input,'utf8'));
const result='/* Price snapshot generated from travel_research/prices.json. */\nwindow.TripPricesV5='+JSON.stringify(prices)+';\n';
if(process.argv.includes('--check')){if(fs.readFileSync(output,'utf8')!==result)throw Error('Price snapshot is stale: node scripts/build-price-data.mjs');}
else fs.writeFileSync(output,result);
console.log('V5 prices checked: '+prices.expenses.length+' items, '+prices.expenses.reduce((n,e)=>n+e.amount,0)+' THB');
