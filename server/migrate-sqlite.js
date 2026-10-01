const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured in server/.env.");

const sourcePath = process.env.SQLITE_SOURCE || path.join(__dirname, "mysqlite.db");
const sqlite = new sqlite3.Database(sourcePath, sqlite3.OPEN_READONLY);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const readAll = (sql, params = []) => new Promise((resolve, reject) => {
  sqlite.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});
const optional = (row, key, fallback = null) => row[key] === undefined ? fallback : row[key];
const loadTable = async (name) => {
  const tables = await readAll("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?", [name]);
  return tables.length ? readAll(`SELECT * FROM "${name}"`) : [];
};

const migrations = [
  { source: "users", target: "users", sql: "INSERT INTO users (user_id, user_name, user_email, user_password, user_firstname, user_lastname, user_address) VALUES ($1,$2,$3,$4,$5,$6,$7)", values: (r) => [r.userID, r.userName, r.userEmail, r.userPassword, r.userFirstname, r.userLastname, r.userAddress] },
  { source: "items", target: "items", sql: "INSERT INTO items (item_id, seller_id, item_name, item_description, starting_price, auction_start_time, auction_end_time, current_bid_amount, item_picture, highest_price, current_bidder_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", values: (r) => [r.itemID, r.sellerID, r.itemName, r.itemDescription, r.startingPrice, r.auctionStartTime, r.auctionEndTime, optional(r, "currentBidAmount", r.startingPrice), r.itemPicture, optional(r, "highestPrice"), optional(r, "currentBidderID")] },
  { source: "bids", target: "bids", sql: "INSERT INTO bids (bid_id, bidder_id, item_id, bid_amount, bid_time) VALUES ($1,$2,$3,$4,$5)", values: (r) => [r.bidID, r.bidderID, r.itemID, r.bidAmount, r.bid_time] },
  { source: "orders", target: "orders", sql: "INSERT INTO orders (order_id, item_id, user_id, item_name, amount, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)", values: (r) => [r.orderID, r.itemID, r.userID, r.itemName, r.amount, r.status, r.createdAt] },
  { source: "contactForm", target: "contact_form", sql: "INSERT INTO contact_form (contact_id, contact_name, contact_email, contact_number, contact_message) VALUES ($1,$2,$3,$4,$5)", values: (r) => [r.contactID, r.contactName, r.contactEmail, r.contactNumber, r.contactMessage] },
  { source: "userRoles", target: "user_roles", sql: "INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)", values: (r) => [r.userID, r.roleID] },
];

const migrate = async () => {
  await require("./schema")(pool);
  const sourceRows = {};
  for (const table of migrations) sourceRows[table.source] = await loadTable(table.source);

  const targetCounts = await pool.query(`SELECT ${migrations.map(({ target }) => `(SELECT COUNT(*) FROM ${target}) AS ${target}`).join(", ")}`);
  if (Object.values(targetCounts.rows[0]).some((count) => Number(count) > 0)) {
    throw new Error("PostgreSQL is not empty. Migration stopped without changing any records.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const table of migrations) {
      for (const row of sourceRows[table.source]) {
        await client.query(table.sql, table.values(row));
      }
    }
    for (const [table, column] of [
      ["users", "user_id"], ["items", "item_id"], ["bids", "bid_id"],
      ["orders", "order_id"], ["contact_form", "contact_id"],
    ]) {
      await client.query(`SELECT setval(pg_get_serial_sequence('${table}', '${column}'), COALESCE((SELECT MAX(${column}) FROM ${table}), 1), EXISTS (SELECT 1 FROM ${table}))`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  for (const table of migrations) {
    console.log(`${table.source}: copied ${sourceRows[table.source].length} row(s)`);
  }
  console.log(`Migration complete; SQLite source left untouched: ${sourcePath}`);
};

migrate()
  .catch((error) => {
    console.error("SQLite migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqlite.close();
    await pool.end();
  });
