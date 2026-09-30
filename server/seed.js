// Adds a demo seller and a few auctions:  npm run seed
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "mysqlite.db"));
require("./schema")(db);

(async () => {
  const hash = await bcrypt.hash("Demo!1234", 10);
  const hours = (h) => new Date(Date.now() + h * 3600e3).toISOString();
  const items = [
    ["Vintage film camera", "35mm rangefinder in working order, with leather case.", 80, 30],
    ["Mid-century desk lamp", "Brass and teak, rewired and safe to use.", 45, 6],
    ["First-edition hardcover", "Good condition with original dust jacket.", 120, 72],
    ["Mechanical keyboard", "Hot-swappable 75% board with lubed switches.", 60, 2],
  ];
  db.run("INSERT OR IGNORE INTO users (userName,userEmail,userPassword,userFirstname,userLastname,userAddress) VALUES (?,?,?,?,?,?)",
    ["demo", "demo@example.com", hash, "Demo", "Seller", "1 Main St"], () => {
      db.get("SELECT userID FROM users WHERE userName='demo'", (e, u) => {
        items.forEach(([n, d, p, h], i) =>
          db.run("INSERT INTO items (sellerID,itemName,itemDescription,startingPrice,auctionStartTime,auctionEndTime,currentBidAmount,itemPicture) VALUES (?,?,?,?,?,?,?,?)",
            [u.userID, n, d, p, hours(-1), hours(h), p, `https://picsum.photos/seed/bb${i}/800/600`]));
        console.log("Seeded. Log in as demo / Demo!1234, or register your own account to place bids.");
      });
    });
})();
