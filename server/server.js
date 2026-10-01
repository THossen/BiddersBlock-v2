const express = require("express");
const cors = require("cors");
const http = require("http");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
let io;
app.use(express.json({ limit: "1mb" }));
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === clientOrigin) return true;
  return !isProduction && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be configured in production.");
}
if (!process.env.SESSION_SECRET) {
  console.warn("Using the demo session secret. Set SESSION_SECRET in server/.env outside local development.");
}

app.use(cors({
  origin: (origin, callback) => callback(null, allowedOrigin(origin)),
  credentials: true,
}));
app.use(session({
  name: "biddersblock.sid",
  secret: process.env.SESSION_SECRET || "biddersblock-demo-only-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

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
const requireAuth = (req, res, next) => {
  if (!req.session.userID) return res.status(401).json({ error: "Please log in to continue." });
  next();
};

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
  await new Promise((resolve, reject) =>
    req.session.regenerate((error) => error ? reject(error) : resolve())
  );
  req.session.userID = row.userID;
  res.json({ message: "User logged in successfully.", user: safeUser(row) });
}));

app.get("/auth/me", h(async (req, res) => {
  if (!req.session.userID) return res.json({ user: null });
  const user = await get("SELECT * FROM users WHERE userID = ?", [req.session.userID]);
  res.json({ user: user ? safeUser(user) : null });
}));

app.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ error: "Could not log out. Please try again." });
    res.clearCookie("biddersblock.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    });
    res.json({ message: "Logged out." });
  });
});

app.get("/auctions", h(async (req, res) => {
  res.json({ auctions: await all("SELECT * FROM items ORDER BY auctionEndTime DESC") });
}));

app.post("/add-auction", requireAuth, h(async (req, res) => {
  const { itemName, itemDescription, startingPrice, itemPicture } = req.body;
  const start = toISO(req.body.auctionStartTime);
  const end = toISO(req.body.auctionEndTime);
  if (!itemName || !(Number(startingPrice) > 0) || !start || !end)
    return res.status(400).json({ error: "Please fill in every field with valid values." });
  if (new Date(end) <= new Date(start))
    return res.status(400).json({ error: "The end time must be after the start time." });
  await run(
    "INSERT INTO items (sellerID, itemName, itemDescription, startingPrice, auctionStartTime, auctionEndTime, currentBidAmount, itemPicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [req.session.userID, itemName, itemDescription, startingPrice, start, end, startingPrice, itemPicture]
  );
  res.json({ message: "Auction added successfully." });
}));

app.delete("/delete-auction/:itemID", requireAuth, h(async (req, res) => {
  const item = await get("SELECT sellerID FROM items WHERE itemID = ?", [req.params.itemID]);
  if (!item) return res.status(404).json({ error: "Auction not found." });
  if (Number(item.sellerID) !== Number(req.session.userID))
    return res.status(403).json({ error: "You can only remove your own auction." });
  await run("DELETE FROM bids WHERE itemID = ?", [req.params.itemID]);
  await run("DELETE FROM items WHERE itemID = ?", [req.params.itemID]);
  res.json({ message: "Auction deleted successfully." });
}));

// All bid rules are enforced here, not just in the browser.
app.post("/add-bid", requireAuth, h(async (req, res) => {
  const { itemID } = req.body;
  const bidderID = Number(req.session.userID);
  const amount = Number(req.body.bidAmount);
  const auctionID = Number(itemID);
  if (!Number.isInteger(auctionID) || auctionID <= 0)
    return res.status(400).json({ error: "Choose a valid auction." });
  const item = await get("SELECT * FROM items WHERE itemID = ?", [auctionID]);
  const now = new Date();
  if (!item) return res.status(404).json({ error: "Auction not found." });
  if (!(amount > 0)) return res.status(400).json({ error: "Enter a valid bid amount." });
  if (Number(item.sellerID) === bidderID) return res.status(403).json({ error: "You can't bid on your own auction." });
  if (now < new Date(item.auctionStartTime)) return res.status(409).json({ error: "This auction hasn't started yet." });
  if (now >= new Date(item.auctionEndTime)) return res.status(409).json({ error: "This auction has ended." });

  // Single conditional UPDATE = atomic, so two simultaneous bids can't both win.
  const upd = await run(
    `UPDATE items SET highestPrice = ?, currentBidderID = ?
     WHERE itemID = ? AND ? >= startingPrice AND (highestPrice IS NULL OR ? > highestPrice)`,
    [amount, bidderID, auctionID, amount, amount]
  );
  if (upd.changes === 0) {
    const cur = await get("SELECT startingPrice, highestPrice FROM items WHERE itemID = ?", [auctionID]);
    return res.status(409).json({
      error: cur.highestPrice
        ? `Someone bid higher. The current bid is $${cur.highestPrice}.`
        : `The minimum bid is $${cur.startingPrice}.`,
      highestPrice: cur.highestPrice,
    });
  }
  const inserted = await run("INSERT INTO bids (bidderID, itemID, bidAmount, bid_time) VALUES (?, ?, ?, ?)", [
    bidderID, auctionID, amount, now.toISOString(), // ISO time sorts correctly, unlike toLocaleString()
  ]);
  const bid = await get(
    `SELECT b.rowid AS id, b.bidderID, u.userName, b.bidAmount, b.bid_time
     FROM bids b LEFT JOIN users u ON u.userID = b.bidderID WHERE b.rowid = ?`,
    [inserted.lastID]
  );
  io.to(`auction:${auctionID}`).emit("bid:created", bid);
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

app.get("/won-auctions", requireAuth, h(async (req, res) => {
  const rows = await all(
    "SELECT itemID, itemPicture, itemName, itemDescription, highestPrice, auctionEndTime FROM items WHERE currentBidderID = ?",
    [req.session.userID]
  );
  const now = new Date();
  res.json({ auctions: rows.filter((r) => new Date(r.auctionEndTime) <= now) });
}));

app.get("/my-orders", requireAuth, h(async (req, res) => {
  res.json({ orders: await all("SELECT * FROM orders WHERE userID = ? ORDER BY createdAt DESC", [req.session.userID]) });
}));

app.post("/checkout/:itemID", requireAuth, h(async (req, res) => {
  const itemID = Number(req.params.itemID);
  if (!Number.isInteger(itemID) || itemID <= 0)
    return res.status(400).json({ error: "Choose a valid auction." });
  const item = await get("SELECT itemID, itemName, highestPrice, currentBidderID, auctionEndTime FROM items WHERE itemID = ?", [itemID]);
  if (!item) return res.status(404).json({ error: "Auction not found." });
  if (new Date(item.auctionEndTime) > new Date())
    return res.status(409).json({ error: "Checkout is available after the auction ends." });
  if (Number(item.currentBidderID) !== Number(req.session.userID))
    return res.status(403).json({ error: "Only the winning bidder can check out this auction." });
  const existing = await get("SELECT * FROM orders WHERE itemID = ?", [itemID]);
  if (existing) return res.json({ order: existing, alreadyComplete: true });
  const inserted = await run("INSERT OR IGNORE INTO orders (itemID, userID, itemName, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)", [
    itemID, req.session.userID, item.itemName, item.highestPrice, "demo-confirmed", new Date().toISOString(),
  ]);
  const order = await get("SELECT * FROM orders WHERE itemID = ?", [itemID]);
  res.status(inserted.changes ? 201 : 200).json({ order, demo: true });
}));

app.post("/add-contact", h(async (req, res) => {
  const { contactName, contactEmail, contactNumber, contactMessage } = req.body;
  await run(
    "INSERT INTO contactForm (contactName, contactEmail, contactNumber, contactMessage) VALUES (?, ?, ?, ?)",
    [contactName, contactEmail, contactNumber, contactMessage]
  );
  res.json({ message: "Message received." }); // previously never responded
}));

app.get("/contact-requests", requireAuth, h(async (req, res) => {
  const admin = await get("SELECT 1 FROM userRoles WHERE userID = ? AND roleID = 1", [req.session.userID]);
  if (!admin) return res.status(403).json({ error: "Administrator access is required." });
  res.json({ requests: await all("SELECT * FROM contactForm") }); // previously never responded
}));

app.get("/user-role/:userID", requireAuth, h(async (req, res) => {
  if (Number(req.params.userID) !== Number(req.session.userID))
    return res.status(403).json({ error: "You can only view your own roles." });
  res.json({ roles: await all("SELECT roleID FROM userRoles WHERE userID = ?", [req.params.userID]) });
}));

const port = process.env.PORT || 3001;
const server = http.createServer(app);
io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, allowedOrigin(origin)),
    credentials: true,
  },
});
io.on("connection", (socket) => {
  socket.on("auction:join", async (itemID, acknowledge) => {
    const respond = typeof acknowledge === "function" ? acknowledge : () => {};
    const auctionID = Number(itemID);
    if (!Number.isInteger(auctionID) || auctionID <= 0) return respond({ joined: false });
    try {
      if (await get("SELECT 1 FROM items WHERE itemID = ?", [auctionID])) {
        socket.join(`auction:${auctionID}`);
        return respond({ joined: true });
      }
      respond({ joined: false });
    } catch (error) {
      console.error(error.message);
      respond({ joined: false });
    }
  });
});
server.listen(port, () => console.log(`Server listening on port ${port}.`));
