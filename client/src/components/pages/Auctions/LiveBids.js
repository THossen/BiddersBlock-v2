import { useState, useEffect } from "react";
import axios from "axios";

const when = (s) =>
  new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const LiveBids = ({ itemID, refreshKey }) => {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    let live = true;
    const load = () =>
      axios
        .get(`http://localhost:3001/latest-bids/${itemID}`)
        .then((r) => live && setBids(r.data.bids))
        .catch(console.error);
    load();
    const t = setInterval(load, 3000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [itemID, refreshKey]);

  return (
    <section className="mx-auto w-full max-w-xl">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Bid history</h2>
      {bids.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No bids yet. Be the first to bid.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {bids.map((b, i) => (
            <li
              key={b.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-slate-800">
                {b.userName || `User ${b.bidderID}`}
                {i === 0 && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Leading
                  </span>
                )}
              </span>
              <span className="text-right">
                <span className="block font-semibold text-slate-900">
                  ${Number(b.bidAmount).toLocaleString()}
                </span>
                <span className="block text-xs text-slate-500">
                  {when(b.bid_time)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
export default LiveBids;
