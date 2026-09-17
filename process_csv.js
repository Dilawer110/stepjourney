const fs = require('fs');
const readline = require('readline');

async function processCSV() {
    const fileStream = fs.createReadStream('data.csv');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isHeader = true;
    let records = [];

    for await (const line of rl) {
        if (isHeader) {
            isHeader = false;
            continue;
        }
        if (line.trim() === '') continue;
        
        // CSV columns:
        // Distributor Code, Distributor Name, OrderBooker Code, OrderBooker Name, Store Code, Store Name, Latitude, Longitude, Channel, Sub Channel, Day, PJP Code, PJP Name
        
        // Simple split since data doesn't seem to have commas in values based on the sample
        const parts = line.split(',');
        const storeCode = parts[4].replace(/'/g, "''");
        const storeName = parts[5].replace(/'/g, "''");
        const latitude = parts[6];
        const longitude = parts[7];
        const channel = parts[8].replace(/'/g, "''");
        const subChannel = parts[9].replace(/'/g, "''");
        const day = parts[10].replace(/'/g, "''");
        const pjpName = parts[12].replace(/'/g, "''");

        records.push(`('${storeCode}', '${storeName}', ${latitude}, ${longitude}, '${channel}', '${subChannel}', '${day}', '${pjpName}')`);
    }

    const sql = `
WITH data(store_code, store_name, lat, lng, channel, sub_channel, day, pjp_name) AS (
  VALUES
  ${records.join(',\n  ')}
),
inserted_routes AS (
  INSERT INTO routes (name, day, order_booker_id)
  SELECT DISTINCT pjp_name, day, (SELECT id FROM profiles LIMIT 1)
  FROM data
  WHERE NOT EXISTS (
      SELECT 1 FROM routes r WHERE r.name = data.pjp_name AND r.day = data.day
  )
  RETURNING id, name, day
),
all_routes AS (
  SELECT id, name, day FROM inserted_routes
  UNION ALL
  SELECT id, name, day FROM routes
)
INSERT INTO outlets (code, name, latitude, longitude, channel, sub_channel, day, route_id, order_booker_id)
SELECT d.store_code, d.store_name, d.lat, d.lng, d.channel, d.sub_channel, d.day, r.id, (SELECT id FROM profiles LIMIT 1)
FROM data d
JOIN all_routes r ON r.name = d.pjp_name AND r.day = d.day
ON CONFLICT (code) DO NOTHING;
    `;

    fs.writeFileSync('seed_bulk.sql', sql);
    console.log('SQL generated in seed_bulk.sql');
}

processCSV();
