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

BiddersBlock is a college-project marketplace app built around the core auction workflow: sellers create timed listings, buyers compete with bids, and the platform tracks the current leader and completed wins. It pairs a responsive React interface with an Express API, SQLite, cookie-based sessions, and Socket.IO.

## Highlights

### Discover and bid

- Search and browse auctions with Live, Upcoming, and Ended filters, plus price and end-time sorting.
- View bid activity update live through Socket.IO.
- Enforce bidding rules on the server, including minimum prices, auction timing, and preventing sellers from bidding on their own items.
- Apply each bid with a conditional database update so competing requests cannot both become the highest bid.

### Sell and manage

- Create timed listings with an image preview and date validation.
- Review live listings, auctions currently led, completed wins, and account details in the profile area.
- Register and sign in with bcrypt-hashed passwords and an HTTP-only server-managed session cookie.
- Complete a **simulated checkout** for a won auction. This records a demo order only; no payment provider or real payment is involved.

### Built for everyday use

- Responsive layouts styled with Tailwind CSS.
- Labeled form controls and visible keyboard focus states.
- REST endpoints organized around users, auctions, bids, and contact submissions.

## Tech stack

| Area | Technologies |
| --- | --- |
| Front end | React 18, React Router 6, Tailwind CSS 3, Axios, Socket.IO Client |
| Back end | Node.js, Express 4, express-session, Socket.IO |
| Database | SQLite with `sqlite3` |
| Authentication | bcrypt password hashing, HTTP-only session cookie |

## Run locally

Requires **Node.js 18 or later**. Copy each `.env.example` to `.env`, then start the API and client in separate terminals from the repository root.

**1. Start the API**

```bash
cd server
npm install
cp .env.example .env
npm run seed   # Optional: add a demo seller and sample auctions
npm start      # http://localhost:3001
```

**2. Start the client**

```bash
cd client
npm install
cp .env.example .env
npm start      # http://localhost:3000
```

Set `SESSION_SECRET` in `server/.env` to a long random value. Set `REACT_APP_API_URL` in `client/.env` if your API is not at `http://localhost:3001`. Restart the corresponding dev server after changing environment files. The backend accepts other localhost ports during development.

The seed script creates a demo seller account: **`demo` / `Demo!1234`**. Register another account to place bids, since sellers cannot bid on their own auctions.

Checkout is deliberately a demo workflow: it creates a `demo-confirmed` order record after an auction ends, but it does not charge a card or contact a payment service.

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
│       ├── api.js             # Shared API URL and cookie-enabled Axios client
│       ├── Providers/        # Authentication and auction state
│       └── components/
│           ├── layout/       # Navigation, page body, and footer
│           └── pages/        # Auctions, profiles, auth, contact, and about
└── server/
    ├── server.js             # Express API, sessions, and Socket.IO events
    ├── schema.js             # SQLite table definitions
    └── seed.js               # Demo account and auction data
```

## API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Create an account |
| `POST` | `/login` | Authenticate and start a session |
| `GET` | `/auth/me` | Restore the current session's user |
| `POST` | `/logout` | End the current session |
| `GET` | `/auctions` | List all auctions |
| `POST` | `/add-auction` | Create a listing as the signed-in user |
| `DELETE` | `/delete-auction/:itemID` | Delete your own auction and its bids |
| `POST` | `/add-bid` | Validate and place a bid as the signed-in user |
| `GET` | `/latest-bids/:itemID` | Get the ten most recent bids |
| `GET` | `/won-auctions` | Get the signed-in user's ended wins |
| `GET` | `/my-orders` | Get the signed-in user's demo orders |
| `POST` | `/checkout/:itemID` | Record a simulated checkout for a won auction |
| `POST` | `/add-contact` | Submit the contact form |
| `GET` | `/contact-requests` | List contact submissions (admin role required) |
| `GET` | `/user-role/:userID` | Get a user's roles |

The Socket.IO client joins an auction room with `auction:join` and receives accepted bids as `bid:created` events.

## Security & roadmap

This project is intended for a college portfolio/demo, not real transactions. It now uses server-managed sessions for protected auction actions, but the default session store is in-memory and sessions are lost when the server restarts. Use a persistent session store, HTTPS, CSRF protections, and deployment-specific secrets before any public deployment.

- [ ] Replace the demo in-memory session store with a persistent store for deployment.
- [ ] Integrate a payment provider and verified webhooks if real checkout is needed; current checkout is simulated.
- [ ] Add winner notifications and a complete auction close workflow.
- [ ] Add automated tests for the API and core auction rules.
- [ ] Add automated tests for the API and core auction rules.



