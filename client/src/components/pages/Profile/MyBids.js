import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import { dateLabel, money } from "./ProfileShared";

const BID_FILTERS = [
  ["all", "All bids"],
  ["active", "Active"],
  ["leading", "Leading"],
  ["outbid", "Outbid"],
  ["ended", "Ended"],
];

const BID_STATUS_STYLES = {
  leading: ["Leading", "bg-emerald-50 text-emerald-700"],
  outbid: ["Outbid", "bg-amber-50 text-amber-700"],
  "outbid-ended": ["You were outbid", "bg-rose-50 text-rose-700"],
  won: ["Won", "bg-emerald-50 text-emerald-700"],
  purchased: ["Purchased · demo", "bg-sky-50 text-sky-700"],
  upcoming: ["Upcoming", "bg-sky-50 text-sky-700"],
};

const MyBids = () => {
  const [bids, setBids] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/my-bids")
      .then((response) => setBids(response.data.bids))
      .catch((requestError) => {
        setError(requestError.response?.data?.error || "We couldn't load your bids. Please try again.");
        setBids([]);
      });
  }, []);

  const visibleBids = (bids || []).filter((bid) => {
    if (filter === "active") return bid.auctionStatus !== "ended";
    if (filter === "ended") return bid.auctionStatus === "ended";
    if (filter === "leading") return bid.bidStatus === filter;
    if (filter === "outbid") return bid.bidStatus === "outbid" || bid.bidStatus === "outbid-ended";
    return true;
  });
  const filterCounts = Object.fromEntries(
    BID_FILTERS.map(([key]) => [key, (bids || []).filter((bid) => {
      if (key === "active") return bid.auctionStatus !== "ended";
      if (key === "ended") return bid.auctionStatus === "ended";
      if (key === "leading") return bid.bidStatus === key;
      if (key === "outbid") return bid.bidStatus === "outbid" || bid.bidStatus === "outbid-ended";
      return true;
    }).length]),
  );

  return (
    <section>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Buyer center</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">My bids</h2>
        <p className="mt-2 text-sm text-slate-600">Track auctions you’ve bid on and see where you stand.</p>
      </div>

      <nav aria-label="Filter bids" className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        {BID_FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
              filter === key ? "bg-indigo-50 text-indigo-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {label}{bids && <span className="ml-1.5 text-xs opacity-70">{filterCounts[key]}</span>}
          </button>
        ))}
      </nav>

      {bids === null ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading your bids…</p>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : visibleBids.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="font-semibold text-slate-800">{bids.length === 0 ? "No bids yet" : "No matching auctions"}</p>
          <p className="mt-1 text-sm text-slate-500">
            {bids.length === 0 ? "Auctions you bid on will appear here." : "Try another filter to see your bid activity."}
          </p>
          {bids.length === 0 && <Link to="/Auctions" className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900">Browse auctions</Link>}
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {visibleBids.map((bid) => {
            const [statusLabel, statusStyle] = BID_STATUS_STYLES[bid.bidStatus] || BID_STATUS_STYLES.upcoming;
            return (
              <article key={bid.itemID} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <img
                  src={bid.itemPicture}
                  alt={bid.itemName}
                  className="h-24 w-full shrink-0 rounded-xl bg-slate-100 object-cover sm:h-20 sm:w-28"
                  onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-slate-900">{bid.itemName}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusStyle}`}>{statusLabel}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{bid.itemDescription}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-600">Your latest bid <strong className="text-slate-900">{money(bid.userBidAmount)}</strong></span>
                    <span className="text-slate-600">Current price <strong className="text-slate-900">{money(bid.highestPrice || bid.currentBidAmount || bid.startingPrice)}</strong></span>
                    <span className="text-slate-500">
                      {bid.auctionStatus === "ended" ? "Ended " : bid.auctionStatus === "upcoming" ? "Starts " : "Ends "}
                      {dateLabel(bid.auctionStatus === "upcoming" ? bid.auctionStartTime : bid.auctionEndTime)}
                    </span>
                  </div>
                </div>
                {bid.bidStatus === "won" ? (
                  <Link
                    to="/ProfilePage/AuctionsWon"
                    className="shrink-0 rounded-lg bg-indigo-700 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-800"
                  >
                    Continue to checkout
                  </Link>
                ) : bid.bidStatus === "purchased" ? (
                  <Link
                    to="/ProfilePage/AuctionsWon"
                    className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    View order #{bid.orderID}
                  </Link>
                ) : bid.bidStatus === "outbid-ended" ? (
                  <Link
                    to="/Auctions"
                    className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    Browse auctions
                  </Link>
                ) : (
                  <Link
                    to={`/auctions/${bid.itemID}`}
                    className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    {bid.bidStatus === "outbid" ? "Raise your bid" : "View auction"}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyBids;