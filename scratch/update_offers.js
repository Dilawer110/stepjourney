const fs = require('fs');
const path = require('path');

const offersMap = {
  "SKU00003": { gt: 10.0, mt: 0.0, ws: 15.0 },
  "SKU00005": { gt: 10.0, mt: 0.0, ws: 15.0 },
  "SKU00004": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00006": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00056": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00069": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00034": { gt: 2.5, mt: 0.0, ws: 0.0 },
  "SKU00031": { gt: 2.5, mt: 0.0, ws: 0.0 },
  "SKU00065": { gt: 2.5, mt: 0.0, ws: 0.0 },
  "SKU00035": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00032": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00066": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00036": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00033": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00067": { gt: 2.5, mt: 2.5, ws: 0.0 },
  "SKU00037": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00038": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00068": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00039": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00040": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00041": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00042": { gt: 9.5, mt: 0.0, ws: 0.0 },
  "SKU00064": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00058": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00059": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00060": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00061": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00062": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00063": { gt: 8.0, mt: 0.0, ws: 0.0 },
  "SKU00020": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00050": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00002": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00051": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00007": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00012": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00025": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00008": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00010": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00014": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00013": { gt: 3.0, mt: 3.0, ws: 0.0 },
  "SKU00029": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00016": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00054": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00028": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00015": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00052": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00019": { gt: 2.5, mt: 3.0, ws: 0.0 },
  "SKU00053": { gt: 2.5, mt: 3.0, ws: 0.0 }
};

const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/\{ code:\s*'([^']+)',([\s\S]+?)gtOffer:\s*([\d.]+),\s*mtOffer:\s*([\d.]+),([^}]+)\}/g, (match, code, pre, gtOffer, mtOffer, post) => {
  const custom = offersMap[code];
  let newGt = custom ? custom.gt.toFixed(1) : parseFloat(gtOffer).toFixed(1);
  let newMt = custom ? custom.mt.toFixed(1) : parseFloat(mtOffer).toFixed(1);
  let newWs = custom ? custom.ws.toFixed(1) : "0.0";
  return "{ code: '" + code + "'," + pre + "gtOffer: " + newGt + ", mtOffer: " + newMt + ", wsOffer: " + newWs + "," + post + "}";
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated trade offers in page.tsx');
