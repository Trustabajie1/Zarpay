const fs = require('fs');
let c = fs.readFileSync('app/wallet/page.tsx', 'utf8');

console.log('Has old select:', c.includes('select value={bridgeRoute'));
console.log('Has new grid:', c.includes('gridTemplateColumns: "1fr 1fr 1fr"'));