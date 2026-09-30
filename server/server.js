const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors());

const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "mysqlite.db"), (err) =>
  console.log(err ? err.message : "Connected to the database.")
);
require("./schema")(db); // creates the tables on first run

// Small promise wrappers so route code stays flat
const get = (sql, p = []) => new Promise((ok, no) => db.get(sql, p, (e, r) => (e ? no(e) : ok(r))));
const all = (sql, p = []) => new Promise((ok, no) => db.all(sql, p, (e, r) => (e ? no(e) : ok(r))));
const run = (sql, p = []) =>
  new Promise((ok, no) => db.run(sql, p, function (e) { e ? no(e) : ok(this); }));

// Wrap async handlers so errors become a 500 instead of a hung request
const h = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

const toISO = (v) => { const d = new Date(v); return isNaN(d) ? null : d.toISOString(); };
const safeUser = ({ userPassword, ...rest }) => rest; // never send the hash to the client

app.post("/register", h(async (req, res) => {
  const { userName, userEmail, userPassword, userFirstname, userLastname, userAddress } = req.body;
  if (!userName || !userEmail || !userPassword || userPassword.length < 8)
    return res.status(400).json({ error: "Username, email and a password of 8+ characters are required." });
  if (await get("SELECT 1 FROM users WHERE userName = ?", [userName]))
    return res.status(409).json({ error: "Username already exists." });
  const hash = await bcrypt.hash(userPassword, 10);
  await run(
    "INSERT INTO users (userName, userEmail, userPassword, userFirstname, userLastname, userAddress) VALUES (?, ?, ?, ?, ?, ?)",
    [userName, userEmail, hash, userFirstname, userLastname, userAddress]
  );
  res.json({ message: "User registered successfully." });
}));

app.post("/login", h(async (req, res) => {
  const { userName, userPassword } = req.body;
  const row = await get("SELECT * FROM users WHERE userName = ?", [userName]);
  if (!row || !(await bcrypt.compare(userPassword || "", row.userPassword)))
    return res.status(401).json({ error: "Invalid credentials." });
  res.json({ message: "User logged in successfully.", user: safeUser(row) });
}));

app.get("/auctions", h(async (req, res) => {
  res.json({ auctions: await all("SELECT * FROM items ORDER BY auctionEndTime DESC") });
}));

app.post("/add-auction", h(async (req, res) => {
  const { sellerID, itemName, itemDescription, startingPrice, itemPicture } = req.body;
  const start = toISO(req.body.auctionStartTime);
  const end = toISO(req.body.auctionEndTime);
  if (!sellerID || !itemName || !(Number(startingPrice) > 0) || !start || !end)
    return res.status(400).json({ error: "Please fill in every field with valid values." });
  if (new Date(end) <= new Date(start))
    return res.status(400).json({ error: "The end time must be after the start time." });
  await run(
    "INSERT INTO items (sellerID, itemName, itemDescription, startingPrice, auctionStartTime, auctionEndTime, currentBidAmount, itemPicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [sellerID, itemName, itemDescription, startingPrice, start, end, startingPrice, itemPicture]
  );
  res.json({ message: "Auction added successfully." });
}));

// NOTE: still unauthenticated, see "next steps". Switched to DELETE, the correct verb.
app.delete("/delete-auction/:itemID", h(async (req, res) => {
  await run("DELETE FROM bids WHERE itemID = ?", [req.params.itemID]);
  await run("DELETE FROM items WHERE itemID = ?", [req.params.itemID]);
  res.json({ message: "Auction deleted successfully." });
}));

// All bid rules are enforced here, not just in the browser.
app.post("/add-bid", h(async (req, res) => {
  const { bidderID, itemID } = req.body;
  const amount = Number(req.body.bidAmount);
  const item = await get("SELECT * FROM items WHERE itemID = ?", [itemID]);
  const now = new Date();
  if (!item) return res.status(404).json({ error: "Auction not found." });
  if (!bidderID || !(amount > 0)) return res.status(400).json({ error: "Enter a valid bid amount." });
  if (item.sellerID === bidderID) return res.status(403).json({ error: "You can't bid on your own auction." });
  if (now < new Date(item.auctionStartTime)) return res.status(409).json({ error: "This auction hasn't started yet." });
  if (now >= new Date(item.auctionEndTime)) return res.status(409).json({ error: "This auction has ended." });

  // Single conditional UPDATE = atomic, so two simultaneous bids can't both win.
  const upd = await run(
    `UPDATE items SET highestPrice = ?, currentBidderID = ?
     WHERE itemID = ? AND ? >= startingPrice AND (highestPrice IS NULL OR ? > highestPrice)`,
    [amount, bidderID, itemID, amount, amount]
  );
  if (upd.changes === 0) {
    const cur = await get("SELECT startingPrice, highestPrice FROM items WHERE itemID = ?", [itemID]);
    return res.status(409).json({
      error: cur.highestPrice
        ? `Someone bid higher. The current bid is $${cur.highestPrice}.`
        : `The minimum bid is $${cur.startingPrice}.`,
      highestPrice: cur.highestPrice,
    });
  }
  await run("INSERT INTO bids (bidderID, itemID, bidAmount, bid_time) VALUES (?, ?, ?, ?)", [
    bidderID, itemID, amount, now.toISOString(), // ISO time sorts correctly, unlike toLocaleString()
  ]);
  res.json({ message: "Bid added successfully.", highestPrice: amount });
}));

app.get("/latest-bids/:itemID", h(async (req, res) => {
  const bids = await all(
    `SELECT b.rowid AS id, b.bidderID, u.userName, b.bidAmount, b.bid_time
     FROM bids b LEFT JOIN users u ON u.userID = b.bidderID
     WHERE b.itemID = ? ORDER BY b.rowid DESC LIMIT 10`,
    [req.params.itemID]
  );
  res.json({ bids });
}));

app.get("/won-auctions/:userID", h(async (req, res) => {
  const rows = await all(
    "SELECT itemID, itemPicture, itemName, itemDescription, highestPrice, auctionEndTime FROM items WHERE currentBidderID = ?",
    [req.params.userID]
  );
  const now = new Date();
  res.json({ auctions: rows.filter((r) => new Date(r.auctionEndTime) <= now) });
}));

app.post("/add-contact", h(async (req, res) => {
  const { contactName, contactEmail, contactNumber, contactMessage } = req.body;
  await run(
    "INSERT INTO contactForm (contactName, contactEmail, contactNumber, contactMessage) VALUES (?, ?, ?, ?)",
    [contactName, contactEmail, contactNumber, contactMessage]
  );
  res.json({ message: "Message received." }); // previously never responded
}));

app.get("/contact-requests", h(async (req, res) => {
  res.json({ requests: await all("SELECT * FROM contactForm") }); // previously never responded
}));

app.get("/user-role/:userID", h(async (req, res) => {
  res.json({ roles: await all("SELECT roleID FROM userRoles WHERE userID = ?", [req.params.userID]) });
}));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port ${port}.`));
