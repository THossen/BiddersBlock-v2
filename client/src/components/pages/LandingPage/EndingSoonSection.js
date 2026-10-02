import { Link } from "react-router-dom";
import AuctionCard from "../Auctions/AuctionCard";

const EndingSoonSection = ({ auctions }) => {
  if (!auctions.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Live marketplace
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Ending soon</h2>
        </div>
        <Link
          to="/Auctions"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          View all auctions
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <Link
            key={auction.itemID}
            to={`/auctions/${auction.itemID}`}
            className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <AuctionCard {...auction} status="live" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default EndingSoonSection;