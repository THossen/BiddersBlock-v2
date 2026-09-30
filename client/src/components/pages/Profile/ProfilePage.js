import { useState, useEffect, useContext } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import axios from "axios";
import AddAuctionForm from "../Auctions/AddAuctionForm";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useAuth from "../../../Providers/useAuth";

const TABS = [
  ["/ProfilePage", "Profile", true],
  ["/ProfilePage/AuctionsWon", "Auctions won"],
  ["/ProfilePage/AddAuctionForm", "Sell an item"],
];

const Row = ({ label, value }) => (
  <div className="py-3 sm:flex">
    <dt className="w-40 text-sm text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{value || "—"}</dd>
  </div>
);

const UserInfo = ({ user }) => (
  <section>
    <h2 className="text-xl font-semibold text-slate-900">Your details</h2>
    <dl className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5">
      <Row label="Name" value={`${user.userFirstname} ${user.userLastname}`} />
      <Row label="Username" value={user.userName} />
      <Row label="Email" value={user.userEmail} />
      <Row label="Address" value={user.userAddress} />
    </dl>
  </section>
);

const AuctionsWon = ({ user }) => {
  const [won, setWon] = useState(null);
  useEffect(() => {
    axios.get(`http://localhost:3001/won-auctions/${user.userID}`)
      .then((r) => setWon(r.data.auctions))
      .catch(() => setWon([]));
  }, [user.userID]);

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">Auctions won</h2>
      {won === null ? <p className="mt-4 text-slate-500">Loading…</p>
        : won.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            You haven't won any auctions yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {won.map((a) => (
              <article key={a.itemID} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img src={a.itemPicture} alt={a.itemName} className="aspect-[4/3] w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{a.itemName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Won for <span className="font-semibold">${a.highestPrice}</span> on{" "}
                    {new Date(a.auctionEndTime).toLocaleDateString()}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { fetchData } = useContext(AuctionContext);
  if (!user) return <Navigate to="/LoginPage" replace />; // previously crashed when logged out

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Hi, {user.userFirstname}</h1>
      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">
        {TABS.map(([to, label, end]) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
                isActive ? "border-violet-900 text-violet-900" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Routes>
          <Route path="/" element={<UserInfo user={user} />} />
          <Route path="/UserInfo" element={<UserInfo user={user} />} />
          <Route path="/AuctionsWon" element={<AuctionsWon user={user} />} />
          <Route path="/AddAuctionForm" element={<AddAuctionForm onAuctionAdded={fetchData} userID={user.userID} />} />
        </Routes>
      </div>
    </div>
  );
};
export default ProfilePage;
