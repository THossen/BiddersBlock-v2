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

const HowItWorksSection = () => (
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
        {STEPS.map(([title, text], index) => (
          <li
            key={title}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-black text-white shadow-md shadow-indigo-200">
              {index + 1}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorksSection;