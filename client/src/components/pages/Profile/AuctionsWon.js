import { useState, useEffect } from "react";
import api from "../../../api";
import { money } from "./ProfileShared";

const AuctionsWon = ({ user }) => {
  const [won, setWon] = useState(null);
  const [orders, setOrders] = useState({});
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    api
      .get("/won-auctions")
      .then((response) => setWon(response.data.auctions))
      .catch(() => setWon([]));
    api
      .get("/my-orders")
      .then((response) => setOrders(Object.fromEntries(response.data.orders.map((order) => [order.itemID, order]))))
      .catch(() => setOrders({}))
      .finally(() => setOrdersLoaded(true));
  }, [user.userID]);

  const completeDemoCheckout = async (itemID) => {
    setCheckingOut(itemID);
    setCheckoutError("");
    try {
      const { data } = await api.post(`/checkout/${itemID}`);
      setOrders((current) => ({ ...current, [itemID]: data.order }));
    } catch (error) {
      setCheckoutError(error.response?.data?.error || "Demo checkout could not be completed.");
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Auctions won</h2>
          <p className="mt-1 text-sm text-slate-500">
            Demo checkout records an order only; no payment is processed.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {won?.length ?? 0} total
        </span>
      </div>

      {won === null ? (
        <p className="mt-4 text-slate-500">Loading…</p>
      ) : won.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center shadow-inner shadow-slate-200/60">
          <p className="text-lg font-semibold text-slate-700">No wins yet</p>
          <p className="mt-2 text-sm text-slate-500">
            You haven't won any auctions yet.
          </p>
        </div>
      ) : (
        <>
          {checkoutError && <p role="alert" className="mb-4 text-sm text-rose-700">{checkoutError}</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            {won.map((auction) => (
              <article
                key={auction.itemID}
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(79,70,229,0.12)]"
              >
                <img
                  src={auction.itemPicture}
                  alt={auction.itemName}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{auction.itemName}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Won for <span className="font-bold text-slate-900">{money(auction.highestPrice)}</span>{" "}
                    on {new Date(auction.auctionEndTime).toLocaleDateString()}
                  </p>
                  {orders[auction.itemID] ? (
                    <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                      Demo order #{orders[auction.itemID].orderID} confirmed. No payment was processed.
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={!ordersLoaded || checkingOut === auction.itemID}
                      onClick={() => completeDemoCheckout(auction.itemID)}
                      className="mt-4 w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      {checkingOut === auction.itemID ? "Completing…" : `Complete demo checkout · ${money(auction.highestPrice)}`}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default AuctionsWon;