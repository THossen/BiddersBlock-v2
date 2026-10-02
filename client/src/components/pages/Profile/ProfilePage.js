import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import AddAuctionForm from "../Auctions/AddAuctionForm";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useAuth from "../../../Providers/useAuth";
import ProfileOverview from "./ProfileOverview";
import MyBids from "./MyBids";
import MyListings from "./MyListings";
import AuctionsWon from "./AuctionsWon";
import UserInfo from "./UserInfo";
import Finances from "./Finances";
import { useContext } from "react";

const TABS = [
  ["/ProfilePage", "Overview", true],
  ["/ProfilePage/MyBids", "My bids"],
  ["/ProfilePage/MyListings", "My listings"],
  ["/ProfilePage/AuctionsWon", "Auctions won"],
  ["/ProfilePage/Finances", "Earnings & spending"],
  ["/ProfilePage/Account", "Account"],
];

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { auctionData, fetchData } = useContext(AuctionContext);
  if (loading) return <p className="p-12 text-center text-slate-500">Checking your session…</p>;
  if (!user) return <Navigate to="/LoginPage" replace />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <div className="grid gap-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Your marketplace
          </p>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col">
            {TABS.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/ProfilePage/AddAuctionForm"
              className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sell an item
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Routes>
            <Route
              index
              element={<ProfileOverview user={user} auctions={auctionData} />}
            />
            <Route
              path="MyListings"
              element={<MyListings auctions={auctionData} userID={user.userID} />}
            />
            <Route path="MyBids" element={<MyBids />} />
            <Route path="AuctionsWon" element={<AuctionsWon user={user} />} />
            <Route path="Finances" element={<Finances />} />
            <Route path="Account" element={<UserInfo user={user} />} />
            <Route
              path="AddAuctionForm"
              element={<AddAuctionForm onAuctionAdded={fetchData} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;