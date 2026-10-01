import { useContext } from "react";
import { Link } from "react-router-dom";
import AuctionCard from "../Auctions/AuctionCard";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useAuth from "../../../Providers/useAuth";

const STEPS = [
  ["Create an account", "Sign up for free in under a minute."],
  ["Find something you want", "Browse live auctions and check the time left."],
  [
    "Place your bid",
    "Bid at or above the minimum. You'll see it the moment someone outbids you.",
  ],
  [
    "Win the item",
    "Hold the highest bid when the timer hits zero and it's yours.",
  ],
];

const LandingPage = () => {
  const { auctionData } = useContext(AuctionContext);
  const { user, loading } = useAuth();
  const now = new Date();
  const endingSoon = auctionData
    .filter(
      (a) =>
        new Date(a.auctionStartTime) <= now && new Date(a.auctionEndTime) > now,
    )
    .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime))
    .slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100 blur-3xl" />

      <section className="relative px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-violet-950 via-indigo-950 to-sky-900 px-6 py-10 shadow-[0_20px_60px_rgba(79,70,229,0.25)] sm:px-10 lg:px-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-100">
                Discover live deals
              </span>
              <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Bid on one-of-a-kind items. Win them at your price.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-violet-100">
                BiddersBlock is an online auction house where every bid updates
                live.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/Auctions"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-105"
                >
                  Browse auctions
                </Link>
                {loading ? null : !user ? (
                  <Link
                    to="/RegisterPage"
                    className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Create an account
                  </Link>
                ) : (
                  <Link
                    to="/ProfilePage"
                    className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    View profile
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20 backdrop-blur-sm">
              <div className="rounded-2xl bg-white/95 p-5 text-slate-900 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Trending now
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Current lead</p>
                    <p className="mt-1 text-3xl font-black text-slate-900">
                      $1,240
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Item
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      Vintage Camera
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                    <span className="text-sm font-medium text-slate-600">
                      Auction ends
                    </span>
                    <span className="text-sm font-bold text-indigo-700">
                      03:42:18
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {endingSoon.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Live marketplace
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Ending soon
              </h2>
            </div>
            <Link
              to="/Auctions"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              View all auctions
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {endingSoon.map((a) => (
              <Link
                key={a.itemID}
                to={`/auctions/${a.itemID}`}
                className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <AuctionCard {...a} status="live" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-slate-50/80 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Simple, transparent, and fast
            </h2>
          </div>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-black text-white shadow-md shadow-indigo-200">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
