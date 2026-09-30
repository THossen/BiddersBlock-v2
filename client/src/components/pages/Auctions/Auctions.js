import { useEffect, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuctionCard from "./AuctionCard";
import { AuctionContext } from "../../../Providers/AuctionContext";

const getStatus = (a, now = new Date()) =>
  now >= new Date(a.auctionEndTime)
    ? "ended"
    : now < new Date(a.auctionStartTime)
      ? "upcoming"
      : "live";

const FILTERS = [
  ["all", "All"],
  ["live", "Live"],
  ["upcoming", "Upcoming"],
  ["ended", "Ended"],
];
const SORTS = {
  ending: (a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime),
  high: (a, b) =>
    (b.highestPrice || b.startingPrice) - (a.highestPrice || a.startingPrice),
  low: (a, b) =>
    (a.highestPrice || a.startingPrice) - (b.highestPrice || b.startingPrice),
};

const Auctions = () => {
  const { auctionData, fetchData } = useContext(AuctionContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("live");
  const [sort, setSort] = useState("ending");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const shown = useMemo(
    () =>
      auctionData
        .map((a) => ({ ...a, status: getStatus(a) }))
        .filter(
          (a) =>
            (filter === "all" || a.status === filter) &&
            `${a.itemName} ${a.itemDescription}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort(SORTS[sort]),
    [auctionData, query, filter, sort],
  );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-100 via-sky-100 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/75 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Marketplace
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                Auctions
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
              {shown.length} active listings
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search auctions"
              aria-label="Search auctions"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 md:max-w-md"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1"
                role="group"
                aria-label="Filter by status"
              >
                {FILTERS.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    aria-pressed={filter === key}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      filter === key
                        ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-200"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort auctions"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="ending">Ending soonest</option>
                <option value="high">Price: high to low</option>
                <option value="low">Price: low to high</option>
              </select>
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
            <p className="text-lg font-medium text-slate-700">
              No auctions match. Try a different filter or search.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) =>
              a.status === "ended" ? (
                <AuctionCard key={a.itemID} {...a} />
              ) : (
                <Link
                  key={a.itemID}
                  to={`/auctions/${a.itemID}`}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <AuctionCard {...a} />
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Auctions;
