import { useParams, Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useCountdown from "../../../Providers/useCountdown";
import LiveBids from "./LiveBids";
import useAuth from "../../../Providers/useAuth";
import axios from "axios";

function AuctionDetailsPage() {
  const { id } = useParams();
  const { auctionData } = useContext(AuctionContext);
  const { user } = useAuth();
  const [newBid, setNewBid] = useState("");
  const [highestPrice, setHighestPrice] = useState(null);
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  const isSeller = user && user.userID === auction.sellerID;

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (Number(newBid) < min) return setMessage({ type: "error", text: `Your bid must be at least $${min}.` });
    setBusy(true);
    try {
      const { data } = await axios.post("http://localhost:3001/add-bid", {
        bidderID: user.userID, itemID: auction.itemID, bidAmount: newBid,
      });
      setHighestPrice(data.highestPrice);
      setNewBid("");
      setRefreshKey((k) => k + 1);
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

          {!user ? (
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
      <div className="mt-12"><LiveBids itemID={id} refreshKey={refreshKey} /></div>
    </div>
  );
}
export default AuctionDetailsPage;
