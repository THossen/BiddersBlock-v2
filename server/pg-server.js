const express = require("express");
const cors = require("cors");
const http = require("http");
const bcrypt = require("bcrypt");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const { Pool } = require("pg");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured in server/.env.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSessionStore = connectPgSimple(session);
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
  store: new PgSessionStore({ pool, createTableIfMissing: true }),
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

const toApiRow = (row) => {
  if (!row) return row;
  return Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (key === "bid_time") return [key, value];
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/Id$/, "ID");
    const apiValue = (key === "id" || key.endsWith("_id")) && value !== null ? Number(value) : value;
    return [camelKey, apiValue];
  }));
};
const get = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return toApiRow(result.rows[0]);
};
const all = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows.map(toApiRow);
};
const run = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return { changes: result.rowCount, rows: result.rows.map(toApiRow) };
};

const h = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((error) => {
    console.error(error.message);
    if (!res.headersSent) res.status(500).json({ error: "Something went wrong. Please try again." });
  });

const toISO = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const safeUser = ({ userPassword, ...rest }) => rest;
const requireAuth = (req, res, next) => {
  if (!req.session.userID) return res.status(401).json({ error: "Please log in to continue." });
  next();
};

app.post("/register", h(async (req, res) => {
  const { userName, userEmail, userPassword, userFirstname, userLastname, userAddress } = req.body;
  if (!userName || !userEmail || !userPassword || userPassword.length < 8) {
    return res.status(400).json({ error: "Username, email and a password of 8+ characters are required." });
  }
  if (await get("SELECT 1 FROM users WHERE user_name = $1", [userName])) {
    return res.status(409).json({ error: "Username already exists." });
  }
  const hash = await bcrypt.hash(userPassword, 10);
  try {
    await run(
      `INSERT INTO users (user_name, user_email, user_password, user_firstname, user_lastname, user_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userName, userEmail, hash, userFirstname, userLastname, userAddress]
    );
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Username already exists." });
    throw error;
  }
  res.json({ message: "User registered successfully." });
}));

app.post("/login", h(async (req, res) => {
  const { userName, userPassword } = req.body;
  const row = await get("SELECT * FROM users WHERE user_name = $1", [userName]);
  if (!row || !(await bcrypt.compare(userPassword || "", row.userPassword))) {
    return res.status(401).json({ error: "Invalid credentials." });
  }
  await new Promise((resolve, reject) =>
    req.session.regenerate((error) => error ? reject(error) : resolve())
  );
  req.session.userID = row.userID;
  res.json({ message: "User logged in successfully.", user: safeUser(row) });
}));

app.get("/auth/me", h(async (req, res) => {
  if (!req.session.userID) return res.json({ user: null });
  const user = await get("SELECT * FROM users WHERE user_id = $1", [req.session.userID]);
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
  res.json({ auctions: await all("SELECT * FROM items ORDER BY auction_end_time DESC") });
}));

app.post("/add-auction", requireAuth, h(async (req, res) => {
  const { itemName, itemDescription, startingPrice, itemPicture } = req.body;
  const start = toISO(req.body.auctionStartTime);
  const end = toISO(req.body.auctionEndTime);
  if (!itemName || !(Number(startingPrice) > 0) || !start || !end) {
    return res.status(400).json({ error: "Please fill in every field with valid values." });
  }
  if (new Date(end) <= new Date(start)) {
    return res.status(400).json({ error: "The end time must be after the start time." });
  }
  await run(
    `INSERT INTO items
      (seller_id, item_name, item_description, starting_price, auction_start_time,
       auction_end_time, current_bid_amount, item_picture)
     VALUES ($1, $2, $3, $4, $5, $6, $4, $7)`,
    [req.session.userID, itemName, itemDescription, Number(startingPrice), start, end, itemPicture]
  );
  res.json({ message: "Auction added successfully." });
}));

app.delete("/delete-auction/:itemID", requireAuth, h(async (req, res) => {
  const item = await get("SELECT seller_id FROM items WHERE item_id = $1", [req.params.itemID]);
  if (!item) return res.status(404).json({ error: "Auction not found." });
  if (Number(item.sellerID) !== Number(req.session.userID)) {
    return res.status(403).json({ error: "You can only remove your own auction." });
  }
  await run("DELETE FROM bids WHERE item_id = $1", [req.params.itemID]);
  await run("DELETE FROM items WHERE item_id = $1", [req.params.itemID]);
  res.json({ message: "Auction deleted successfully." });
}));

app.post("/add-bid", requireAuth, h(async (req, res) => {
  const auctionID = Number(req.body.itemID);
  const bidderID = Number(req.session.userID);
  const amount = Number(req.body.bidAmount);
  if (!Number.isInteger(auctionID) || auctionID <= 0) {
    return res.status(400).json({ error: "Choose a valid auction." });
  }
  if (!(amount > 0)) return res.status(400).json({ error: "Enter a valid bid amount." });

  const client = await pool.connect();
  let bid;
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT * FROM items WHERE item_id = $1 FOR UPDATE", [auctionID]);
    const item = toApiRow(result.rows[0]);
    const now = new Date();
    if (!item) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Auction not found." });
    }
    if (Number(item.sellerID) === bidderID) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You can't bid on your own auction." });
    }
    if (now < new Date(item.auctionStartTime)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "This auction hasn't started yet." });
    }
    if (now >= new Date(item.auctionEndTime)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "This auction has ended." });
    }
    if (amount < Number(item.startingPrice) || (item.highestPrice !== null && amount <= Number(item.highestPrice))) {
      await client.query("ROLLBACK");
      const highestPrice = item.highestPrice;
      return res.status(409).json({
        error: highestPrice
          ? `Someone bid higher. The current bid is $${highestPrice}.`
          : `The minimum bid is $${item.startingPrice}.`,
        highestPrice,
      });
    }

    await client.query(
      "UPDATE items SET highest_price = $1, current_bidder_id = $2 WHERE item_id = $3",
      [amount, bidderID, auctionID]
    );
    const inserted = await client.query(
      "INSERT INTO bids (bidder_id, item_id, bid_amount, bid_time) VALUES ($1, $2, $3, $4) RETURNING bid_id",
      [bidderID, auctionID, amount, now.toISOString()]
    );
    const bidResult = await client.query(
      `SELECT b.bid_id AS id, b.bidder_id, u.user_name, b.bid_amount, b.bid_time
       FROM bids b LEFT JOIN users u ON u.user_id = b.bidder_id WHERE b.bid_id = $1`,
      [inserted.rows[0].bid_id]
    );
    bid = toApiRow(bidResult.rows[0]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  io.to(`auction:${auctionID}`).emit("bid:created", bid);
  res.json({ message: "Bid added successfully.", highestPrice: amount });
}));

app.get("/latest-bids/:itemID", h(async (req, res) => {
  const bids = await all(
    `SELECT b.bid_id AS id, b.bidder_id, u.user_name, b.bid_amount, b.bid_time
     FROM bids b LEFT JOIN users u ON u.user_id = b.bidder_id
     WHERE b.item_id = $1 ORDER BY b.bid_id DESC LIMIT 10`,
    [req.params.itemID]
  );
  res.json({ bids });
}));

app.get("/won-auctions", requireAuth, h(async (req, res) => {
  const auctions = await all(
    `SELECT item_id, item_picture, item_name, item_description, highest_price, auction_end_time
     FROM items WHERE current_bidder_id = $1 AND auction_end_time <= NOW()`,
    [req.session.userID]
  );
  res.json({ auctions });
}));

app.get("/my-orders", requireAuth, h(async (req, res) => {
  res.json({ orders: await all("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.session.userID]) });
}));

app.post("/checkout/:itemID", requireAuth, h(async (req, res) => {
  const itemID = Number(req.params.itemID);
  if (!Number.isInteger(itemID) || itemID <= 0) {
    return res.status(400).json({ error: "Choose a valid auction." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT * FROM items WHERE item_id = $1 FOR UPDATE", [itemID]);
    const item = toApiRow(result.rows[0]);
    if (!item) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Auction not found." });
    }
    if (new Date(item.auctionEndTime) > new Date()) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Checkout is available after the auction ends." });
    }
    if (Number(item.currentBidderID) !== Number(req.session.userID)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Only the winning bidder can check out this auction." });
    }
    const existing = await client.query("SELECT * FROM orders WHERE item_id = $1", [itemID]);
    if (existing.rows[0]) {
      await client.query("COMMIT");
      return res.json({ order: toApiRow(existing.rows[0]), alreadyComplete: true });
    }
    const inserted = await client.query(
      `INSERT INTO orders (item_id, user_id, item_name, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [itemID, req.session.userID, item.itemName, item.highestPrice, "demo-confirmed", new Date().toISOString()]
    );
    await client.query("COMMIT");
    res.status(201).json({ order: toApiRow(inserted.rows[0]), demo: true });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}));

app.post("/add-contact", h(async (req, res) => {
  const { contactName, contactEmail, contactNumber, contactMessage } = req.body;
  await run(
    "INSERT INTO contact_form (contact_name, contact_email, contact_number, contact_message) VALUES ($1, $2, $3, $4)",
    [contactName, contactEmail, contactNumber, contactMessage]
  );
  res.json({ message: "Message received." });
}));

app.get("/contact-requests", requireAuth, h(async (req, res) => {
  const admin = await get("SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = 1", [req.session.userID]);
  if (!admin) return res.status(403).json({ error: "Administrator access is required." });
  res.json({ requests: await all("SELECT * FROM contact_form") });
}));

app.get("/user-role/:userID", requireAuth, h(async (req, res) => {
  if (Number(req.params.userID) !== Number(req.session.userID)) {
    return res.status(403).json({ error: "You can only view your own roles." });
  }
  res.json({ roles: await all("SELECT role_id FROM user_roles WHERE user_id = $1", [req.params.userID]) });
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
      if (await get("SELECT 1 FROM items WHERE item_id = $1", [auctionID])) {
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

const start = async () => {
  await require("./schema")(pool);
  await pool.query("SELECT 1");
  server.listen(port, () => console.log(`Server listening on port ${port}.`));
};
start().catch((error) => {
  console.error("Could not start the API:", error.message);
  process.exitCode = 1;
  pool.end();
});
