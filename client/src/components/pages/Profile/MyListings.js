import { Link } from "react-router-dom";
import { AuctionRows } from "./ProfileShared";

const MyListings = ({ auctions, userID }) => {
  const listings = auctions
    .filter((auction) => Number(auction.sellerID) === Number(userID))
    .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime));

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Seller center
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            My listings
          </h2>
        </div>
        <Link
          to="/ProfilePage/AddAuctionForm"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          List an item
        </Link>
      </div>
      <AuctionRows
        auctions={listings}
        emptyTitle="No listings yet"
        emptyText="Items you put up for auction will appear here."
        mode="listing"
      />
    </section>
  );
};

export default MyListings;