<div align="center">

# BiddersBlock

### A full-stack auction marketplace

Browse listings, place competitive bids, and manage auctions from a responsive React app backed by an Express API and SQLite.

<p>
    <img src="https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/Node.js-18%2B-43853d?logo=nodedotjs&logoColor=white" alt="Node.js 18 or later" />
    <img src="https://img.shields.io/badge/Express-4-222222?logo=express&logoColor=white" alt="Express 4" />
    <img src="https://img.shields.io/badge/SQLite-database-003b57?logo=sqlite&logoColor=white" alt="SQLite" />
</p>

[Features](#highlights) · [Tech stack](#tech-stack) · [Run locally](#run-locally) · [API](#api-reference) · [Roadmap](#security--roadmap)

</div>

---

## Overview

BiddersBlock is a marketplace web app built around the core auction workflow: sellers create timed listings, buyers compete with bids, and the platform tracks the current leader and completed wins. It pairs a responsive React interface with an Express REST API and a lightweight SQLite database.

## Highlights

### Discover and bid

- Search and browse auctions with Live, Upcoming, and Ended filters, plus price and end-time sorting.
- View recent bid activity on an auction; the bid list refreshes periodically and after a bid is placed.
- Enforce bidding rules on the server, including minimum prices, auction timing, and preventing sellers from bidding on their own items.
- Apply each bid with a conditional database update so competing requests cannot both become the highest bid.

### Sell and manage

- Create timed listings with an image preview and date validation.
- Review live listings, auctions currently led, completed wins, and account details in the profile area.
- Register and sign in with bcrypt-hashed passwords; login state persists across page refreshes.

### Built for everyday use

- Responsive layouts styled with Tailwind CSS.
- Labeled form controls and visible keyboard focus states.
- REST endpoints organized around users, auctions, bids, and contact submissions.

## Tech stack

| Area | Technologies |
| --- | --- |
| Front end | React 18, React Router 6, Tailwind CSS 3, Axios |
| Back end | Node.js, Express 4 |
| Database | SQLite with `sqlite3` |
| Authentication | bcrypt password hashing |

## Run locally

Requires **Node.js 18 or later**. Start the API and client in separate terminals from the repository root.

**1. Start the API**

```bash
cd server
npm install
npm run seed   # Optional: add a demo seller and sample auctions
npm start      # http://localhost:3001
```

**2. Start the client**

```bash
cd client
npm install
npm start      # http://localhost:3000
```

The seed script creates a demo seller account: **`demo` / `Demo!1234`**. Register another account to place bids, since sellers cannot bid on their own auctions.

<details>
<summary>Existing database note</summary>

Place the database at `server/mysqlite.db`. Missing tables are created on startup. If your existing `items` table does not include the bid-tracking columns, add them with:

```sql
ALTER TABLE items ADD COLUMN highestPrice REAL;
ALTER TABLE items ADD COLUMN currentBidderID INTEGER;
```

</details>

## Project structure

```text
biddersblock/
├── client/
│   └── src/
│       ├── Providers/        # Authentication and auction state
│       └── components/
│           ├── layout/       # Navigation, page body, and footer
│           └── pages/        # Auctions, profiles, auth, contact, and about
└── server/
        ├── server.js             # Express API and auction rules
        ├── schema.js             # SQLite table definitions
        └── seed.js               # Demo account and auction data
```

## API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Create an account |
| `POST` | `/login` | Authenticate and return the user profile |
| `GET` | `/auctions` | List all auctions |
| `POST` | `/add-auction` | Create an auction listing |
| `DELETE` | `/delete-auction/:itemID` | Delete an auction and its bids |
| `POST` | `/add-bid` | Validate and place a bid |
| `GET` | `/latest-bids/:itemID` | Get the ten most recent bids |
| `GET` | `/won-auctions/:userID` | Get a user's ended auctions won |
| `POST` | `/add-contact` | Submit the contact form |
| `GET` | `/contact-requests` | List contact submissions |
| `GET` | `/user-role/:userID` | Get a user's roles |

## Security & roadmap

This project is a portfolio/demo application, not production-ready. In particular, the API currently trusts user IDs sent by the client and does not protect every administrative endpoint. Do not deploy it with real user data or payments until authentication and authorization are enforced by the server.

- [ ] Add server-managed sessions or JWT authentication and authorize sensitive routes.
- [ ] Move the API base URL into environment-based configuration.
- [ ] Replace bid-history polling with WebSocket updates.
- [ ] Add checkout, winner notifications, and a complete auction close workflow.
- [ ] Add automated tests for the API and core auction rules.



