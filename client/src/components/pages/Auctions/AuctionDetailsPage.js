import { useParams, Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useCountdown from "../../../Providers/useCountdown";
import LiveBids from "./LiveBids";
import useAuth from "../../../Providers/useAuth";
import api from "../../../api";

function AuctionDetailsPage() {
  const { id } = useParams();
  const { auctionData } = useContext(AuctionContext);
  const { user } = useAuth();
  const [newBid, setNewBid] = useState("");
  const [highestPrice, setHighestPrice] = useState(null);
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }
  const [busy, setBusy] = useState(false);

  const auction = auctionData.find((a) => a.itemID === parseInt(id));
  useEffect(() => { if (auction) setHighestPrice(auction.highestPrice); }, [auction]);
  const timeLeft = useCountdown(auction ? new Date(auction.auctionEndTime) : new Date());

  if (!auctionData.length) return <p className="p-16 text-center text-slate-500">Loading auction…</p>;
  if (!auction)
    return (
      <p className="p-16 text-center text-slate-600">
        We couldn't find that auction. <Link to="/Auctions" className="text-violet-700 underline">Browse auctions</Link>
      </p>
    );

  const { itemName, itemDescription, startingPrice, itemPicture } = auction;
  const min = highestPrice ? Number(highestPrice) + 1 : Number(startingPrice);
  const isSeller = user && Number(user.userID) === Number(auction.sellerID);
  const isEnded = timeLeft === "Auction ended";
  const isUpcoming = new Date(auction.auctionStartTime) > new Date();
  const hasBids = auction.highestPrice != null || auction.currentBidderID != null;
  const isWinner = user && Number(user.userID) === Number(auction.currentBidderID);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (Number(newBid) < min) return setMessage({ type: "error", text: `Your bid must be at least $${min}.` });
    setBusy(true);
    try {
      const { data } = await api.post("/add-bid", {
        itemID: auction.itemID, bidAmount: newBid,
      });
      setHighestPrice(data.highestPrice);
      setNewBid("");
      setMessage({ type: "success", text: "Bid placed. You're the highest bidder." });
    } catch (err) {
      const r = err.response?.data;
      if (r?.highestPrice) setHighestPrice(r.highestPrice);
      setMessage({ type: "error", text: r?.error || "Couldn't place your bid. Please try again." });
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/Auctions" className="text-sm text-violet-700 hover:underline">&larr; All auctions</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <img src={itemPicture} alt={itemName} className="w-full rounded-xl object-cover shadow-sm" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{itemName}</h1>
          <p className="mt-3 text-slate-600">{itemDescription}</p>
          <dl className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
            <div><dt className="text-xs text-slate-500">Starting price</dt><dd className="text-lg font-semibold">${startingPrice}</dd></div>
            <div><dt className="text-xs text-slate-500">Current bid</dt><dd className="text-lg font-semibold text-emerald-700">{highestPrice ? `$${highestPrice}` : "No bids"}</dd></div>
            <div><dt className="text-xs text-slate-500">Time left</dt><dd className="text-lg font-semibold text-rose-700">{timeLeft}</dd></div>
          </dl>

          {isEnded ? (
            <div className={`mt-6 rounded-xl border p-5 ${hasBids ? isWinner ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}>
              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isWinner ? "text-emerald-700" : hasBids ? "text-slate-500" : "text-amber-700"}`}>
                {isWinner ? "Auction result" : hasBids ? "Auction closed" : "No bids"}
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {isWinner ? "You won this auction" : hasBids ? "This auction has ended" : "Auction ended without bids"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isWinner
                  ? `You won with the highest bid of $${Number(auction.highestPrice).toLocaleString()}. Your win is ready in your profile.`
                  : hasBids
                    ? `The winning bid was $${Number(auction.highestPrice).toLocaleString()}. Browse current auctions to find another lot.`
                    : "No one placed a bid on this lot. Browse current auctions or list another item."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {isWinner ? (
                  <Link to="/ProfilePage/AuctionsWon" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                    Continue to checkout
                  </Link>
                ) : isSeller && !hasBids ? (
                  <Link to="/ProfilePage/AddAuctionForm" className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800">
                    List another item
                  </Link>
                ) : null}
                <Link to="/Auctions" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-800">
                  Browse auctions
                </Link>
              </div>
            </div>
          ) : isUpcoming ? (
            <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Coming up</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Bidding hasn’t opened yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                This auction starts {new Date(auction.auctionStartTime).toLocaleString()}.
              </p>
            </div>
          ) : !user ? (
            <p className="mt-6 rounded-lg bg-violet-50 p-4 text-violet-900">
              <Link to="/LoginPage" className="font-semibold underline">Log in</Link> or{" "}
              <Link to="/RegisterPage" className="font-semibold underline">sign up</Link> to place a bid.
            </p>
          ) : isSeller ? (
            <p className="mt-6 rounded-lg bg-slate-100 p-4 text-slate-700">This is your auction, so you can't bid on it.</p>
          ) : (
            <form onSubmit={submit} className="mt-6">
              <label htmlFor="bid" className="block text-sm font-medium text-slate-700">Your bid (minimum ${min})</label>
              <div className="mt-2 flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">$</span>
                  <input
                    id="bid" type="number" min={min} step="0.01" required value={newBid}
                    onChange={(e) => setNewBid(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <button disabled={busy} className="rounded-lg bg-violet-900 px-6 py-2 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                  {busy ? "Placing…" : "Place bid"}
                </button>
              </div>
              {message && (
                <p role="status" className={`mt-3 text-sm ${message.type === "error" ? "text-rose-700" : "text-emerald-700"}`}>
                  {message.text}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
      <div className="mt-12"><LiveBids itemID={id} /></div>
    </div>
  );
}
export default AuctionDetailsPage;
