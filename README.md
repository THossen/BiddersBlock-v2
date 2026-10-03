<div align="center">

# BiddersBlock

### A full-stack auction marketplace

Browse listings, place competitive bids, and manage auctions from a responsive React app backed by an Express API and PostgreSQL.

<p>
    <img src="https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/Node.js-18%2B-43853d?logo=nodedotjs&logoColor=white" alt="Node.js 18 or later" />
    <img src="https://img.shields.io/badge/Express-4-222222?logo=express&logoColor=white" alt="Express 4" />
    <img src="https://img.shields.io/badge/SQLite-database-003b57?logo=sqlite&logoColor=white" alt="SQLite" />
</p>

<img src="client/public/BiddersBlock%20Home%20View.png" width="100%" alt="BiddersBlock Home View" />

<table>
  <tr>
    <td width="50%">
      <img src="client/public/Auctions%20View.png" alt="Auctions View" />
    </td>
    <td width="50%">
      <img src="client/public/Earnings%20and%20Spending%20Dashboard.png" alt="Earnings and Spending Dashboard" />
    </td>
  </tr>
</table>

[Features](#highlights) · [Tech stack](#tech-stack) · [Run locally](#run-locally) · [API](#api-reference) · [Roadmap](#security--roadmap)

</div>

---

## Overview

BiddersBlock is a college-project marketplace app built around the core auction workflow: sellers create timed listings, buyers compete with bids, and the platform tracks the current leader and completed wins. It pairs a responsive React interface with an Express API, PostgreSQL, cookie-based sessions, and Socket.IO.

## Highlights

### Discover and bid

- Search and browse auctions with Live, Upcoming, and Ended filters, plus price and end-time sorting.
- View bid activity update live through Socket.IO.
- Enforce bidding rules on the server, including minimum prices, auction timing, and preventing sellers from bidding on their own items.
- Serialize competing bids with PostgreSQL row locks and transactions so only the current highest bid is accepted.

### Sell and manage

- Create timed listings with an image preview and date validation.
- Review live listings, auctions currently led, completed wins, and account details in the profile area.
- Track your latest bid per auction and filter active, leading, outbid, and ended results.
- Review completed demo-order earnings and spending in a monthly finance chart; lost bids are excluded.
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
| Database | PostgreSQL with `pg`; SQLite is retained only for the one-time import tool |
| Authentication | bcrypt password hashing, HTTP-only session cookie stored in PostgreSQL |

## Run locally

Requires **Node.js 18 or later** and Docker Desktop. From the repository root, start PostgreSQL and copy the example environment files:

```powershell
docker compose up -d
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

The local PostgreSQL database uses a Docker volume, so its contents survive container restarts. The volume belongs to this computer and is not included in Git.

**1. Start the API**

```bash
cd server
npm install
npm run migrate:sqlite  # One-time import if server/mysqlite.db exists
npm run seed            # Optional and safe to rerun; adds missing demo data
npm start      # http://localhost:3001
```

If you do not have an existing `server/mysqlite.db`, skip `migrate:sqlite` and run `npm run seed` to create the demo data. The import refuses to run if PostgreSQL already contains application records, and leaves the SQLite source untouched.

**2. Start the client**

```bash
cd client
npm install
npm start      # http://localhost:3000
```

Replace `SESSION_SECRET` in `server/.env` with a long random value. Set `REACT_APP_API_URL` in `client/.env` if your API is not at `http://localhost:3001`. Restart the corresponding dev server after changing environment files. The backend accepts other localhost ports during development.

Stop PostgreSQL with `docker compose down`; the named data volume is kept. Avoid `docker compose down -v` unless you intentionally want to delete the local database.

The seed script creates a demo seller account: **`demo` / `Demo!1234`**. Register another account to place bids, since sellers cannot bid on their own auctions.

Checkout is deliberately a demo workflow: it creates a `demo-confirmed` order record after an auction ends, but it does not charge a card or contact a payment service.

<details>
<summary>Existing database note</summary>

When upgrading an older project, keep `server/mysqlite.db` in place and run `npm run migrate:sqlite` once to copy users, auctions, bids, orders, contacts, and roles into PostgreSQL. The SQLite file is not deleted or modified.

To use the same database on another computer, migrate or restore a database backup there. The local Docker volume itself does not sync between computers.

</details>

## Project structure

```text
biddersblock/
├── docker-compose.yml       # Local PostgreSQL service and persistent volume
├── client/
│   └── src/
│       ├── api.js             # Shared API URL and cookie-enabled Axios client
│       ├── Providers/        # Authentication and auction state
│       └── components/
│           ├── layout/       # Navigation, page body, and footer
│           └── pages/        # Auctions, profiles, auth, contact, and about
└── server/
    ├── server.js             # API entry point
    ├── pg-server.js          # Express API, PostgreSQL sessions, and Socket.IO
    ├── schema.js             # PostgreSQL table definitions
    ├── migrate-sqlite.js     # One-time SQLite data importer
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
| `GET` | `/my-bids` | Get the signed-in user's latest bid per auction and current status |
| `GET` | `/won-auctions` | Get the signed-in user's ended wins |
| `GET` | `/my-orders` | Get the signed-in user's demo orders |
| `GET` | `/my-finances` | Get completed demo orders as seller earnings and buyer spending |
| `POST` | `/checkout/:itemID` | Record a simulated checkout for a won auction |
| `POST` | `/add-contact` | Submit the contact form |
| `GET` | `/contact-requests` | List contact submissions (admin role required) |
| `GET` | `/user-role/:userID` | Get a user's roles |

The Socket.IO client joins an auction room with `auction:join` and receives accepted bids as `bid:created` events.

## Security & roadmap

This project is intended for a demo, not real transactions. Sessions are stored in PostgreSQL and survive API restarts. Before a public deployment, configure HTTPS, CSRF protections, rate limiting, and deployment-specific secrets. Checkout is simulated and does not handle payments.

- [ ] Integrate a payment provider and verified webhooks if real checkout is needed; current checkout is simulated.
- [ ] Add winner notifications and a complete auction close workflow.
- [ ] Add automated tests for the API and core auction rules.



