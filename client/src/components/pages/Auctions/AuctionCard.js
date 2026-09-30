const money = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmt = (d) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const STATUS = {
  live: ["Live", "bg-emerald-100 text-emerald-800"],
  upcoming: ["Upcoming", "bg-amber-100 text-amber-800"],
  ended: ["Ended", "bg-slate-200 text-slate-700"],
};

function AuctionCard({ itemPicture, itemName, itemDescription, highestPrice, startingPrice, auctionEndTime, status }) {
  const [label, tone] = STATUS[status];

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(79,70,229,0.12)] ${
        status === "ended" ? "opacity-75" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={itemPicture}
          alt={itemName}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${status === "ended" ? "grayscale" : ""}`}
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${tone}`}>{label}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-slate-900">{itemName}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{itemDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{highestPrice ? "Current bid" : "Starting bid"}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{money(highestPrice || startingPrice)}</p>
          </div>
          <p className="text-right text-[11px] text-slate-500">
            {status === "ended" ? "Ended" : "Ends"} {fmt(auctionEndTime)}
          </p>
        </div>
      </div>
    </article>
  );
}
export default AuctionCard;
