// Adds a demo seller and a few auctions: npm run seed
const bcrypt = require("bcrypt");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured in server/.env.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  await require("./schema")(pool);
  const hash = await bcrypt.hash("Demo!1234", 10);
  const hours = (h) => new Date(Date.now() + h * 3600e3).toISOString();
  const items = [
    ["Vintage film camera", "35mm rangefinder in working order, with leather case.", 80, 30],
    ["Mid-century desk lamp", "Brass and teak, rewired and safe to use.", 45, 6],
    ["First-edition hardcover", "Good condition with original dust jacket.", 120, 72],
    ["Mechanical keyboard", "Hot-swappable 75% board with lubed switches.", 60, 2],
  ];
  const user = await pool.query(
    `INSERT INTO users (user_name, user_email, user_password, user_firstname, user_lastname, user_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_name) DO UPDATE SET user_name = EXCLUDED.user_name
     RETURNING user_id`,
    ["demo", "demo@example.com", hash, "Demo", "Seller", "1 Main St"]
  );
  const sellerID = user.rows[0].user_id;
  for (const [index, [name, description, price, endHours]] of items.entries()) {
    await pool.query(
      `INSERT INTO items
        (seller_id, item_name, item_description, starting_price, auction_start_time,
         auction_end_time, current_bid_amount, item_picture)
       SELECT $1, $2, $3, $4, $5, $6, $4, $7
       WHERE NOT EXISTS (SELECT 1 FROM items WHERE seller_id = $1 AND item_name = $2)`,
      [sellerID, name, description, price, hours(-1), hours(endHours), `https://picsum.photos/seed/bb${index}/800/600`]
    );
  }
  console.log("Seeded. Log in as demo / Demo!1234, or register another account to place bids.");
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
