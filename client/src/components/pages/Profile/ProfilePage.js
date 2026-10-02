import { useState, useEffect, useContext } from "react";
import { Routes, Route, NavLink, Navigate, Link } from "react-router-dom";
import AddAuctionForm from "../Auctions/AddAuctionForm";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useAuth from "../../../Providers/useAuth";
import api from "../../../api";

const TABS = [
  ["/ProfilePage", "Overview", true],
  ["/ProfilePage/MyBids", "My bids"],
  ["/ProfilePage/MyListings", "My listings"],
  ["/ProfilePage/AuctionsWon", "Auctions won"],
  ["/ProfilePage/Account", "Account"],
];

const money = (amount) =>
  `$${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const dateLabel = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Row = ({ label, value }) => (
  <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className="break-words font-semibold text-slate-900">{value || "—"}</dd>
  </div>
);

const UserInfo = ({ user }) => (
  <section>
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
        Account settings
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-900">Your details</h2>
      <p className="mt-2 text-sm text-slate-600">
        The contact information associated with your bidder account.
      </p>
    </div>
    <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white p-5 sm:px-7">
      <Row label="Name" value={`${user.userFirstname} ${user.userLastname}`} />
      <Row label="Username" value={user.userName} />
      <Row label="Email" value={user.userEmail} />
      <Row label="Address" value={user.userAddress} />
    </dl>
  </section>
);

const AuctionRows = ({ auctions, emptyTitle, emptyText, mode }) => {
  if (!auctions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="font-semibold text-slate-800">{emptyTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {auctions.map((auction) => (
        <article key={auction.itemID} className="flex gap-4 p-4 sm:p-5">
          <img
            src={auction.itemPicture}
            alt={auction.itemName}
            className="h-20 w-24 shrink-0 rounded-xl bg-slate-100 object-cover sm:h-24 sm:w-32"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-bold text-slate-900">
                {auction.itemName}
              </h3>
              {mode === "listing" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    new Date(auction.auctionEndTime).getTime() <= Date.now()
                      ? "bg-slate-100 text-slate-600"
                      : new Date(auction.auctionStartTime).getTime() >
                          Date.now()
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {new Date(auction.auctionEndTime).getTime() <= Date.now()
                    ? "Ended"
                    : new Date(auction.auctionStartTime).getTime() > Date.now()
                      ? "Upcoming"
                      : "Live"}
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {auction.itemDescription}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-slate-900">
                {mode === "won"
                  ? "Won for "
                  : auction.highestPrice
                    ? "Current bid "
                    : "Starting bid "}
                {money(
                  auction.highestPrice ||
                    auction.currentBidAmount ||
                    auction.startingPrice,
                )}
              </span>
              <span className="text-slate-500">
                {mode === "won" ||
                new Date(auction.auctionEndTime).getTime() <= Date.now()
                  ? `Ended ${dateLabel(auction.auctionEndTime)}`
                  : `Ends ${dateLabel(auction.auctionEndTime)}`}
              </span>
            </div>
          </div>
          {mode === "leading" && (
            <span className="hidden h-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Leading
            </span>
          )}
        </article>
      ))}
    </div>
  );
};

const MyListings = ({ auctions, userID }) => {
  const listings = auctions
    .filter((auction) => Number(auction.sellerID) === Number(userID))
    .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime));

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Seller center
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            My listings
          </h2>
        </div>
        <Link
          to="/ProfilePage/AddAuctionForm"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          List an item
        </Link>
      </div>
      <AuctionRows
        auctions={listings}
        emptyTitle="No listings yet"
        emptyText="Items you put up for auction will appear here."
        mode="listing"
      />
    </section>
  );
};

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
  won: ["Won", "bg-emerald-50 text-emerald-700"],
  lost: ["Ended · not won", "bg-slate-100 text-slate-600"],
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
    if (filter === "leading" || filter === "outbid") return bid.bidStatus === filter;
    return true;
  });
  const filterCounts = Object.fromEntries(
    BID_FILTERS.map(([key]) => [key, (bids || []).filter((bid) => {
      if (key === "active") return bid.auctionStatus !== "ended";
      if (key === "ended") return bid.auctionStatus === "ended";
      if (key === "leading" || key === "outbid") return bid.bidStatus === key;
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
            const [statusLabel, statusStyle] = BID_STATUS_STYLES[bid.bidStatus] || BID_STATUS_STYLES.lost;
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
                <Link
                  to={`/auctions/${bid.itemID}`}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                >
                  View auction
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const AuctionsWon = ({ user }) => {
  const [won, setWon] = useState(null);
  const [orders, setOrders] = useState({});
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  useEffect(() => {
    api
      .get("/won-auctions")
      .then((r) => setWon(r.data.auctions))
      .catch(() => setWon([]));
    api
      .get("/my-orders")
      .then((r) => setOrders(Object.fromEntries(r.data.orders.map((order) => [order.itemID, order]))))
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
          <p className="mt-1 text-sm text-slate-500">Demo checkout records an order only; no payment is processed.</p>
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
                  Won for{" "}
                  <span className="font-bold text-slate-900">
                    {money(auction.highestPrice)}
                  </span>{" "}
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

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { auctionData, fetchData } = useContext(AuctionContext);
  if (loading) return <p className="p-12 text-center text-slate-500">Checking your session…</p>;
  if (!user) return <Navigate to="/LoginPage" replace />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <div className="grid gap-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Your marketplace
          </p>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col">
            {TABS.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/ProfilePage/AddAuctionForm"
              className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sell an item
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Routes>
            <Route
              index
              element={<ProfileOverview user={user} auctions={auctionData} />}
            />
            <Route
              path="MyListings"
              element={
                <MyListings auctions={auctionData} userID={user.userID} />
              }
            />
            <Route path="MyBids" element={<MyBids />} />
            <Route path="AuctionsWon" element={<AuctionsWon user={user} />} />
            <Route path="Account" element={<UserInfo user={user} />} />
            <Route
              path="AddAuctionForm"
              element={<AddAuctionForm onAuctionAdded={fetchData} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default ProfilePage;
