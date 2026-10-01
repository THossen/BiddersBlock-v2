// Creates any missing tables. Safe to run every start; leaves an existing database untouched.
module.exports = (db) =>
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      userID INTEGER PRIMARY KEY AUTOINCREMENT, userName TEXT UNIQUE NOT NULL, userEmail TEXT,
      userPassword TEXT NOT NULL, userFirstname TEXT, userLastname TEXT, userAddress TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS items (
      itemID INTEGER PRIMARY KEY AUTOINCREMENT, sellerID INTEGER, itemName TEXT, itemDescription TEXT,
      startingPrice REAL, auctionStartTime TEXT, auctionEndTime TEXT, currentBidAmount REAL,
      itemPicture TEXT, highestPrice REAL, currentBidderID INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS bids (
      bidID INTEGER PRIMARY KEY AUTOINCREMENT, bidderID INTEGER, itemID INTEGER, bidAmount REAL, bid_time TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      orderID INTEGER PRIMARY KEY AUTOINCREMENT, itemID INTEGER UNIQUE NOT NULL,
      userID INTEGER NOT NULL, itemName TEXT NOT NULL, amount REAL, status TEXT NOT NULL,
      createdAt TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS contactForm (
      contactID INTEGER PRIMARY KEY AUTOINCREMENT, contactName TEXT, contactEmail TEXT, contactNumber TEXT, contactMessage TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS userRoles (userID INTEGER, roleID INTEGER)`);
  });
