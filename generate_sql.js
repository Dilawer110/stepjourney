const xlsx = require('xlsx');
const fs = require('fs');

const EXCEL_PATH = 'C:/Users/13162/.gemini/antigravity/brain/1f398e62-525c-4159-856d-f4833d0d53e5/.user_uploaded/media_1790214595654.xlsx';
const SQL_PATH = 'C:/Users/13162/Downloads/Compressed/outlet-visit-app-project/outlet-visit-app/supabase_master_data.sql';

const wb = xlsx.readFile(EXCEL_PATH);
let sql = '';

function escapeSql(val) {
  if (val === null || val === undefined || val === 'NULL' || val === '') return 'NULL';
  if (typeof val === 'number') return val;
  // Escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. Products
sql += `-- =========================================\n-- TABLE: products\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS products (
  sku_code VARCHAR PRIMARY KEY,
  sku_description VARCHAR,
  category VARCHAR,
  sub_category VARCHAR,
  grams NUMERIC,
  units_per_carton INTEGER,
  retail_price_incl NUMERIC,
  tp_incl NUMERIC,
  tp_excl NUMERIC,
  retail_price_excl NUMERIC
);\n`;
sql += `TRUNCATE TABLE products CASCADE;\n`;
const products = xlsx.utils.sheet_to_json(wb.Sheets['Products']);
products.forEach(p => {
  sql += `INSERT INTO products (sku_code, sku_description, category, sub_category, grams, units_per_carton, retail_price_incl, tp_incl, tp_excl, retail_price_excl) VALUES (` +
    `${escapeSql(p['SKU Code'])}, ${escapeSql(p['SKU Description'])}, ${escapeSql(p['Category'])}, ${escapeSql(p['Sub Category'])}, ${escapeSql(p['Grams'])}, ${escapeSql(p['Units/Carton'])}, ${escapeSql(p['RETAIL PRICE (Incl.)'])}, ${escapeSql(p['TP INCL.'])}, ${escapeSql(p['TP EXCL.'])}, ${escapeSql(p['RETAIL PRICE (Excl.)'])}) ON CONFLICT DO NOTHING;\n`;
});
sql += `\n`;

// 2. Distributors
sql += `-- =========================================\n-- TABLE: distributors\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS distributors (
  distributor_code VARCHAR PRIMARY KEY,
  distribution_name VARCHAR,
  town VARCHAR,
  zone VARCHAR,
  tier VARCHAR
);\n`;
sql += `TRUNCATE TABLE distributors CASCADE;\n`;
const distributors = xlsx.utils.sheet_to_json(wb.Sheets['Distributors']);
distributors.forEach(d => {
  sql += `INSERT INTO distributors (distributor_code, distribution_name, town, zone, tier) VALUES (` +
    `${escapeSql(d['Distributor Code'])}, ${escapeSql(d['Distribution Name'])}, ${escapeSql(d['Town'])}, ${escapeSql(d['Zone'])}, ${escapeSql(d['Tier'])}) ON CONFLICT DO NOTHING;\n`;
});
sql += `\n`;

// 3. Channels
sql += `-- =========================================\n-- TABLE: channels\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  system_channel VARCHAR,
  corrected_channel VARCHAR,
  short_channel_name_for_display VARCHAR,
  sub_channel VARCHAR,
  full_name VARCHAR
);\n`;
sql += `TRUNCATE TABLE channels CASCADE;\n`;
const channels = xlsx.utils.sheet_to_json(wb.Sheets['Channels']);
channels.forEach(c => {
  sql += `INSERT INTO channels (system_channel, corrected_channel, short_channel_name_for_display, sub_channel, full_name) VALUES (` +
    `${escapeSql(c['System Channel'])}, ${escapeSql(c['Corrected Channel'])}, ${escapeSql(c['Short Channel Name for Display'])}, ${escapeSql(c['Sub Channel'])}, ${escapeSql(c['Full Name'])});\n`;
});
sql += `\n`;

// 4. Discount Slabs
sql += `-- =========================================\n-- TABLE: discount_slabs\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS discount_slabs (
  id SERIAL PRIMARY KEY,
  tier VARCHAR,
  category VARCHAR,
  channel VARCHAR,
  slab VARCHAR,
  min_gross_amount NUMERIC,
  max_gross_amount NUMERIC,
  discount_pct NUMERIC
);\n`;
sql += `TRUNCATE TABLE discount_slabs CASCADE;\n`;
const slabs = xlsx.utils.sheet_to_json(wb.Sheets['Discount Slabs']);
slabs.forEach(s => {
  if (s['Tier'] && s['Tier'].trim() !== '') {
    sql += `INSERT INTO discount_slabs (tier, category, channel, slab, min_gross_amount, max_gross_amount, discount_pct) VALUES (` +
      `${escapeSql(s['Tier'])}, ${escapeSql(s['Category'])}, ${escapeSql(s['Channel'])}, ${escapeSql(s['Slab'])}, ${escapeSql(s['Min Gross Amount'])}, ${escapeSql(s['Max Gross Amount'])}, ${escapeSql(s['Discount %'])});\n`;
  }
});
sql += `\n`;

// 5. Trade Offer Discount
sql += `-- =========================================\n-- TABLE: trade_offer_discount\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS trade_offer_discount (
  sku_code VARCHAR PRIMARY KEY,
  product_description VARCHAR,
  gm NUMERIC,
  units_per_case INTEGER,
  gt NUMERIC,
  lmt NUMERIC,
  ws NUMERIC
);\n`;
sql += `TRUNCATE TABLE trade_offer_discount CASCADE;\n`;
const trade = xlsx.utils.sheet_to_json(wb.Sheets['Trade Offer Discount']);
trade.forEach(t => {
  if (t['SKU Code']) {
    sql += `INSERT INTO trade_offer_discount (sku_code, product_description, gm, units_per_case, gt, lmt, ws) VALUES (` +
      `${escapeSql(t['SKU Code'])}, ${escapeSql(t['Product Description'])}, ${escapeSql(t['GM'])}, ${escapeSql(t['Units Per Case'])}, ${escapeSql(t['GT'])}, ${escapeSql(t['LMT'])}, ${escapeSql(t['WS'])}) ON CONFLICT DO NOTHING;\n`;
  }
});
sql += `\n`;

// 6. AppUsers
sql += `-- =========================================\n-- TABLE: app_users\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS app_users (
  order_booker_code VARCHAR PRIMARY KEY,
  order_booker_name VARCHAR,
  distributor_code VARCHAR,
  distributor_name VARCHAR,
  town_name VARCHAR,
  tse_supervisor VARCHAR,
  zone VARCHAR,
  asm VARCHAR,
  region VARCHAR,
  rsm VARCHAR
);\n`;
sql += `TRUNCATE TABLE app_users CASCADE;\n`;
const users = xlsx.utils.sheet_to_json(wb.Sheets['AppUsers']);
users.forEach(u => {
  if (u['Order Booker Code']) {
    sql += `INSERT INTO app_users (order_booker_code, order_booker_name, distributor_code, distributor_name, town_name, tse_supervisor, zone, asm, region, rsm) VALUES (` +
      `${escapeSql(u['Order Booker Code'])}, ${escapeSql(u['Order Booker Name'])}, ${escapeSql(u['Distributor Code'])}, ${escapeSql(u['Distributor Name'])}, ${escapeSql(u['Town Name'])}, ${escapeSql(u['TSE (Supervisor)'])}, ${escapeSql(u['Zone'])}, ${escapeSql(u['ASM'])}, ${escapeSql(u['Region'])}, ${escapeSql(u['RSM'])}) ON CONFLICT DO NOTHING;\n`;
  }
});
sql += `\n`;

// 7. PJP_List
sql += `-- =========================================\n-- TABLE: pjp_list\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS pjp_list (
  id SERIAL PRIMARY KEY,
  pjp_code VARCHAR,
  pjp_name VARCHAR,
  order_booker_code VARCHAR,
  order_booker_name VARCHAR,
  day VARCHAR,
  distributor_code VARCHAR,
  distributor_name VARCHAR
);\n`;
sql += `TRUNCATE TABLE pjp_list CASCADE;\n`;
const pjps = xlsx.utils.sheet_to_json(wb.Sheets['PJP_List']);
pjps.forEach(p => {
  if (p['PJP Code']) {
    sql += `INSERT INTO pjp_list (pjp_code, pjp_name, order_booker_code, order_booker_name, day, distributor_code, distributor_name) VALUES (` +
      `${escapeSql(p['PJP Code'])}, ${escapeSql(p['PJP Name'])}, ${escapeSql(p['OrderBooker Code'])}, ${escapeSql(p['OrderBooker Name'])}, ${escapeSql(p['Day'])}, ${escapeSql(p['Distributor Code'])}, ${escapeSql(p['Distributor Name'])});\n`;
  }
});
sql += `\n`;

// 8. Outlets & Outlet Visit Schedule
sql += `-- =========================================\n-- TABLE: outlets & outlet_visit_schedule\n-- =========================================\n`;
sql += `CREATE TABLE IF NOT EXISTS outlets (
  store_code VARCHAR PRIMARY KEY,
  store_name VARCHAR,
  latitude NUMERIC,
  longitude NUMERIC,
  channel VARCHAR,
  sub_channel VARCHAR
);\n`;
sql += `CREATE TABLE IF NOT EXISTS outlet_visit_schedule (
  id SERIAL PRIMARY KEY,
  store_code VARCHAR,
  pjp_code VARCHAR,
  pjp_name VARCHAR,
  day VARCHAR,
  order_booker_code VARCHAR,
  order_booker_name VARCHAR
);\n`;
sql += `TRUNCATE TABLE outlets CASCADE;\n`;
sql += `TRUNCATE TABLE outlet_visit_schedule CASCADE;\n`;

const outletsRaw = xlsx.utils.sheet_to_json(wb.Sheets['Outlets']);
const uniqueOutlets = new Set();

// Write inserts in batches for outlets to avoid giant strings
let outletBatch = [];
let schedBatch = [];

outletsRaw.forEach(o => {
  const storeCode = String(o['Store Code']);
  if (!uniqueOutlets.has(storeCode)) {
    uniqueOutlets.add(storeCode);
    outletBatch.push(`(${escapeSql(storeCode)}, ${escapeSql(o['Store Name'])}, ${escapeSql(o['Latitude'])}, ${escapeSql(o['Longitude'])}, ${escapeSql(o['Channel'])}, ${escapeSql(o['Sub Channel'])})`);
  }
  schedBatch.push(`(${escapeSql(storeCode)}, ${escapeSql(o['PJP Code'])}, ${escapeSql(o['PJP Name'])}, ${escapeSql(o['Day'])}, ${escapeSql(o['OrderBooker Code'])}, ${escapeSql(o['OrderBooker Name'])})`);
});

const chunkSize = 1000;
for (let i = 0; i < outletBatch.length; i += chunkSize) {
  sql += `INSERT INTO outlets (store_code, store_name, latitude, longitude, channel, sub_channel) VALUES\n` + outletBatch.slice(i, i + chunkSize).join(',\n') + ` ON CONFLICT DO NOTHING;\n`;
}
sql += `\n`;
for (let i = 0; i < schedBatch.length; i += chunkSize) {
  sql += `INSERT INTO outlet_visit_schedule (store_code, pjp_code, pjp_name, day, order_booker_code, order_booker_name) VALUES\n` + schedBatch.slice(i, i + chunkSize).join(',\n') + `;\n`;
}

fs.writeFileSync(SQL_PATH, sql);
console.log('Successfully generated SQL:', SQL_PATH);
