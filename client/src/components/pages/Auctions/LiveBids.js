import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api, { API_BASE_URL } from "../../../api";

const when = (s) =>
  new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const LiveBids = ({ itemID }) => {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    let active = true;
    const mergeBids = (incoming) => {
      setBids((current) => {
        const unique = new Map([...incoming, ...current].map((bid) => [bid.id, bid]));
        return [...unique.values()].sort((a, b) => b.id - a.id).slice(0, 10);
      });
    };
    const load = () => api
      .get(`/latest-bids/${itemID}`)
      .then((response) => { if (active) mergeBids(response.data.bids); })
      .catch(console.error);
    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      socket.emit("auction:join", Number(itemID));
      load();
    });
    socket.on("bid:created", (bid) => mergeBids([bid]));
    socket.on("connect_error", console.error);
    load();
    return () => {
      active = false;
      socket.disconnect();
    };
  }, [itemID]);

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Bid history</h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
          Live
        </span>
      </div>

      {bids.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center shadow-inner shadow-slate-200/50">
          <p className="text-lg font-semibold text-slate-700">No bids yet</p>
          <p className="mt-2 text-sm text-slate-500">Be the first to place a bid and kick off the auction.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          {bids.map((b, i) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-slate-800">
                    {b.userName || `User ${b.bidderID}`}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                      Leading
                    </span>
                  )}
                </div>
                <span className="mt-1 block text-xs text-slate-500">{when(b.bid_time)}</span>
              </div>

              <div className="text-right">
                <span className="block text-lg font-black text-slate-900">
                  ${Number(b.bidAmount).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
export default LiveBids;
