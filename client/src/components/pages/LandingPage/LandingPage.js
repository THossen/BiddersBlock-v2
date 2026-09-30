import { useContext } from "react";
import { Link } from "react-router-dom";
import AuctionCard from "../Auctions/AuctionCard";
import { AuctionContext } from "../../../Providers/AuctionContext";

const STEPS = [
  ["Create an account", "Sign up for free in under a minute."],
  ["Find something you want", "Browse live auctions and check the time left."],
  ["Place your bid", "Bid at or above the minimum. You'll see it the moment someone outbids you."],
  ["Win the item", "Hold the highest bid when the timer hits zero and it's yours."],
];

const LandingPage = () => {
  const { auctionData } = useContext(AuctionContext);
  const now = new Date();
  const endingSoon = auctionData
    .filter((a) => new Date(a.auctionStartTime) <= now && new Date(a.auctionEndTime) > now)
    .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime))
    .slice(0, 3);

  return (
    <div>
      <section className="bg-violet-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Bid on one-of-a-kind items. Win them at your price.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-violet-200">
            BiddersBlock is an online auction house where every bid updates live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/Auctions" className="rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-violet-950 hover:bg-cyan-300">
              Browse auctions
            </Link>
            <Link to="/RegisterPage" className="rounded-lg border border-violet-500 px-6 py-3 font-semibold hover:bg-violet-900">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {endingSoon.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Ending soon</h2>
            <Link to="/Auctions" className="text-sm font-medium text-violet-700 hover:underline">View all auctions</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {endingSoon.map((a) => (
              <Link key={a.itemID} to={`/auctions/${a.itemID}`} className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                <AuctionCard {...a} status="live" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-sm font-semibold text-violet-700">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
