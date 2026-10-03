import { Link } from "react-router-dom";

const LandingHero = ({ user, loading }) => (
  <section className="relative px-4 py-16 sm:py-24">
    <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-violet-950 via-indigo-950 to-sky-900 px-6 py-10 shadow-[0_20px_60px_rgba(79,70,229,0.25)] sm:px-10 lg:px-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block">
        <div className="absolute inset-y-0 left-0 border-l border-white/[0.08]" />
        <div className="absolute -right-10 top-8 h-44 w-44 rotate-45 border border-cyan-200/[0.12]" />
        <div className="absolute -right-2 top-16 h-44 w-44 rotate-45 border border-white/[0.08]" />
        <div className="absolute bottom-16 right-0 h-px w-4/5 bg-gradient-to-l from-cyan-200/40 to-transparent" />
        <div className="absolute right-8 top-8 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-cyan-200/70" />
          <span className="h-1.5 w-1.5 bg-cyan-200/40" />
          <span className="h-1.5 w-1.5 bg-cyan-200/20" />
        </div>
      </div>
      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-100">
            <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
              <span className="h-1.5 w-0.5 bg-cyan-200/60" />
              <span className="h-2.5 w-0.5 bg-cyan-200" />
              <span className="h-2 w-0.5 bg-cyan-200/80" />
            </span>
            Discover live deals
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            Bid on one-of-a-kind collectibles. Win them at your price.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-violet-100">
            BiddersBlock is an online auction house where every bid updates live.
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

        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20 backdrop-blur-sm">
          <div aria-hidden="true" className="pointer-events-none absolute -left-1 top-10 h-20 w-1 bg-gradient-to-b from-cyan-300/80 via-sky-300/40 to-transparent" />
          <div className="overflow-hidden rounded-2xl border-t-2 border-cyan-300/80 bg-white/95 p-5 text-slate-900 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Trending now
              </p>
              <span aria-hidden="true" className="flex items-center gap-1">
                <span className="h-1 w-4 bg-indigo-200" />
                <span className="h-1 w-2 bg-sky-300" />
                <span className="h-1 w-1 bg-cyan-400" />
              </span>
            </div>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <p className="text-sm text-slate-500">Current lead</p>
                <p className="mt-1 text-3xl font-black text-slate-900">$1,240</p>
                <div aria-hidden="true" className="absolute bottom-1 right-1 flex h-8 items-end gap-1 opacity-70">
                  <span className="h-2 w-1 bg-indigo-200" />
                  <span className="h-4 w-1 bg-indigo-300" />
                  <span className="h-3 w-1 bg-sky-300" />
                  <span className="h-6 w-1 bg-sky-400" />
                  <span className="h-5 w-1 bg-cyan-400" />
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Item
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">Vintage Camera</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-600">Auction ends</span>
                <span className="text-sm font-bold text-indigo-700">03:42:18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default LandingHero;