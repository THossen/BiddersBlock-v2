import { useEffect, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuctionCard from "./AuctionCard";
import { AuctionContext } from "../../../Providers/AuctionContext";

const getStatus = (a, now = new Date()) =>
  now >= new Date(a.auctionEndTime) ? "ended" : now < new Date(a.auctionStartTime) ? "upcoming" : "live";

const FILTERS = [["all", "All"], ["live", "Live"], ["upcoming", "Upcoming"], ["ended", "Ended"]];
const SORTS = {
  ending: (a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime),
  high: (a, b) => (b.highestPrice || b.startingPrice) - (a.highestPrice || a.startingPrice),
  low: (a, b) => (a.highestPrice || a.startingPrice) - (b.highestPrice || b.startingPrice),
};

const Auctions = () => {
  const { auctionData, fetchData } = useContext(AuctionContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("live");
  const [sort, setSort] = useState("ending");

  useEffect(() => { fetchData(); }, [fetchData]);

  const shown = useMemo(
    () =>
      auctionData
        .map((a) => ({ ...a, status: getStatus(a) }))
        .filter((a) => (filter === "all" || a.status === filter) &&
          `${a.itemName} ${a.itemDescription}`.toLowerCase().includes(query.toLowerCase()))
        .sort(SORTS[sort]),
    [auctionData, query, filter, sort]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Auctions</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search auctions"
          aria-label="Search auctions"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 md:max-w-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-300 p-1" role="group" aria-label="Filter by status">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  filter === key ? "bg-violet-900 text-white" : "text-slate-600 hover:bg-slate-100"
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ending">Ending soonest</option>
            <option value="high">Price: high to low</option>
            <option value="low">Price: low to high</option>
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          No auctions match. Try a different filter or search.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) =>
            a.status === "ended" ? (
              <AuctionCard key={a.itemID} {...a} />
            ) : (
              <Link key={a.itemID} to={`/auctions/${a.itemID}`} className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                <AuctionCard {...a} />
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
};
export default Auctions;
