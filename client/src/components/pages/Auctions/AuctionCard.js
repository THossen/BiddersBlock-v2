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
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        status === "ended" ? "opacity-75" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={itemPicture}
          alt={itemName}
          loading="lazy"
          className={`h-full w-full object-cover ${status === "ended" ? "grayscale" : ""}`}
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-slate-900">{itemName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{itemDescription}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-slate-500">{highestPrice ? "Current bid" : "Starting bid"}</p>
            <p className="text-xl font-bold text-slate-900">{money(highestPrice || startingPrice)}</p>
          </div>
          <p className="text-right text-xs text-slate-500">
            {status === "ended" ? "Ended" : "Ends"} {fmt(auctionEndTime)}
          </p>
        </div>
      </div>
    </article>
  );
}
export default AuctionCard;
