import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import { AuctionRows } from "./ProfileShared";

const ProfileOverview = ({ user, auctions }) => {
  const [won, setWon] = useState(null);
  useEffect(() => {
    api
      .get("/won-auctions")
      .then((response) => setWon(response.data.auctions))
      .catch(() => setWon([]));
  }, [user.userID]);

  const now = Date.now();
  const ownedAuctions = auctions.filter(
    (auction) => Number(auction.sellerID) === Number(user.userID),
  );
  const activeListings = ownedAuctions.filter(
    (auction) =>
      new Date(auction.auctionStartTime).getTime() <= now &&
      new Date(auction.auctionEndTime).getTime() > now,
  );
  const leadingAuctions = auctions.filter(
    (auction) =>
      Number(auction.currentBidderID) === Number(user.userID) &&
      Number(auction.sellerID) !== Number(user.userID) &&
      new Date(auction.auctionEndTime).getTime() > now,
  );
  const initials =
    `${user.userFirstname?.[0] || ""}${user.userLastname?.[0] || ""}`.toUpperCase() ||
    user.userName?.[0]?.toUpperCase() ||
    "B";
  const stats = [
    ["Live listings", activeListings.length, "Currently open for bids"],
    ["Leading", leadingAuctions.length, "Auctions where you're ahead"],
    ["Won", won?.length ?? "—", "Completed auctions"],
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-700 to-sky-500 text-2xl font-black text-white ring-4 ring-indigo-50">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Bidder account
          </p>
          <h1 className="mt-1 truncate text-2xl font-black text-slate-900 sm:text-3xl">
            {user.userFirstname} {user.userLastname}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            @{user.userName}
            {user.userAddress ? ` · ${user.userAddress}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/ProfilePage/Account"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Account details
          </Link>
          <Link
            to="/ProfilePage/AddAuctionForm"
            className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Sell an item
          </Link>
        </div>
      </section>

      <section
        aria-label="Marketplace activity"
        className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3"
      >
        {stats.map(([label, value, description]) => (
          <div key={label} className="bg-white px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your live listings
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Auctions currently accepting bids
              </p>
            </div>
            <Link
              to="/ProfilePage/MyListings"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              All listings
            </Link>
          </div>
          <AuctionRows
            auctions={activeListings.slice(0, 3)}
            emptyTitle="Nothing for sale right now"
            emptyText="Start a listing when you're ready to sell."
            mode="listing"
          />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Auctions you're leading
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Your current high bids
            </p>
          </div>
          <AuctionRows
            auctions={leadingAuctions.slice(0, 3)}
            emptyTitle="No leading bids yet"
            emptyText="When your bid is highest, the auction appears here."
            mode="leading"
          />
        </section>
      </div>

      {won?.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recently won</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Your completed auction wins
              </p>
            </div>
            <Link
              to="/ProfilePage/AuctionsWon"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              All wins
            </Link>
          </div>
          <AuctionRows
            auctions={won.slice(0, 2)}
            emptyTitle="No wins yet"
            emptyText="Completed wins will show here."
            mode="won"
          />
        </section>
      )}
    </div>
  );
};

export default ProfileOverview;