import { Row } from "./ProfileShared";

const UserInfo = ({ user }) => (
  <section>
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
        Account settings
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-900">Your details</h2>
      <p className="mt-2 text-sm text-slate-600">
        The contact information associated with your bidder account.
      </p>
    </div>
    <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white p-5 sm:px-7">
      <Row label="Name" value={`${user.userFirstname} ${user.userLastname}`} />
      <Row label="Username" value={user.userName} />
      <Row label="Email" value={user.userEmail} />
      <Row label="Address" value={user.userAddress} />
    </dl>
  </section>
);

export default UserInfo;