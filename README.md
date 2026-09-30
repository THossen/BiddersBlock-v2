# BiddersBlock

An online auction platform where users list items, place bids, and win auctions. Built as a full-stack React and Express app, then reworked with server-side bid validation, a responsive UI, and a cleaner auth flow.


## Features

- **Browse and search auctions** with Live, Upcoming and Ended filters and sorting by end time or price
- **Bid history** on each auction that refreshes every few seconds and right after you bid
- **Server-enforced bidding rules**: minimum bid, no bidding on your own item, no bids outside the auction window
- **Race-safe bids**: the highest-bid update is a single conditional SQL statement, so simultaneous bids can't both win
- **Accounts** with bcrypt-hashed passwords, registration validation, and persistent login across refreshes
- **Seller tools**: list an item with an image preview and time validation
- **Profile area** with account details and a list of auctions you've won
- **Responsive layout** built with Tailwind CSS, with labelled form fields and visible keyboard focus

## Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 18, React Router 6, Tailwind CSS 3, Axios |
| Server | Node.js, Express, SQLite (`sqlite3`), bcrypt |

## Getting started

Requires **Node 18+**. Run the server and client in two terminals.

```bash
# Terminal 1: API on http://localhost:3001
cd server
npm install
npm run seed      # optional: demo user and 4 sample auctions
npm start

# Terminal 2: app on http://localhost:3000
cd client
npm install
npm start
```

The seed script creates a seller account (`demo` / `Demo!1234`). Register a second account to place bids, since sellers can't bid on their own auctions.

<details>
<summary>Using an existing database</summary>

Copy your `mysqlite.db` to `server/mysqlite.db`. Missing tables are created on startup. The `items` table needs `highestPrice` and `currentBidderID` columns; if they're absent, run:

```sql
ALTER TABLE items ADD COLUMN highestPrice REAL;
ALTER TABLE items ADD COLUMN currentBidderID INTEGER;
```

</details>

## Project structure

```
biddersblock/
├── client/
│   └── src/
│       ├── Providers/        # Auth and auction context, useAuth, useCountdown
│       └── components/
│           ├── layout/       # Navbar, Footer, Body
│           └── pages/        # LandingPage, Auctions, Login, Register, Profile, Contact, About Us
└── server/
    ├── server.js             # Express API
    ├── schema.js             # Creates tables on first run
    └── seed.js               # Demo data
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Create an account |
| POST | `/login` | Log in (the password hash is never returned) |
| GET | `/auctions` | List all auctions |
| POST | `/add-auction` | Create an auction |
| DELETE | `/delete-auction/:itemID` | Delete an auction and its bids |
| POST | `/add-bid` | Place a bid (validated and applied atomically) |
| GET | `/latest-bids/:itemID` | Ten most recent bids for an auction |
| GET | `/won-auctions/:userID` | Ended auctions a user is winning |
| POST | `/add-contact` | Submit the contact form |
| GET | `/contact-requests` | List contact submissions |
| GET | `/user-role/:userID` | Roles for a user |

## Known limitations and roadmap

- [ ] **Authentication**: the server trusts the user ID sent by the browser. Add sessions or JWTs, and protect the delete and contact-list endpoints, before any real deployment.
- [ ] **Configuration**: the API URL (`http://localhost:3001`) is hard-coded in the client; move it to an environment variable.
- [ ] **Real-time updates**: bid history polls the server; WebSockets would make it instant.
- [ ] **Payments and auction close**: winners are computed from the data, but there is no checkout or notification step.
- [ ] **Tests**: no automated tests yet.

## Team

Built as a team project by Tanvir Hossen (lead, front end and back end), Isaac Ortega and Robert Chu (back end), and Darnell Voltaire and Saiyedal Alam (front end).

## License

No license has been chosen yet. Add a `LICENSE` file (for example MIT) before sharing the code publicly.