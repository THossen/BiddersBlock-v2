export const money = (amount) =>
  `$${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const dateLabel = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const Row = ({ label, value }) => (
  <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className="break-words font-semibold text-slate-900">{value || "—"}</dd>
  </div>
);

export const AuctionRows = ({ auctions, emptyTitle, emptyText, mode }) => {
  if (!auctions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="font-semibold text-slate-800">{emptyTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {auctions.map((auction) => (
        <article key={auction.itemID} className="flex min-w-0 gap-4 p-4 sm:p-5">
          <img
            src={auction.itemPicture}
            alt={auction.itemName}
            className="h-20 w-24 shrink-0 rounded-xl bg-slate-100 object-cover sm:h-24 sm:w-32"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 title={auction.itemName} className="min-w-0 max-w-full truncate font-bold text-slate-900">
                {auction.itemName}
              </h3>
              {mode === "listing" && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  new Date(auction.auctionEndTime).getTime() <= Date.now()
                    ? auction.highestPrice == null && auction.currentBidderID == null
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                    : new Date(auction.auctionStartTime).getTime() > Date.now()
                      ? "bg-sky-50 text-sky-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}>
                  {new Date(auction.auctionEndTime).getTime() <= Date.now()
                    ? auction.highestPrice == null && auction.currentBidderID == null
                      ? "Ended · no bids"
                      : "Ended · winner set"
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
            {mode === "listing" &&
              new Date(auction.auctionEndTime).getTime() <= Date.now() &&
              auction.highestPrice == null &&
              auction.currentBidderID == null && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  No bids were placed. You can list it again with a different starting price or schedule.
                </p>
              )}
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