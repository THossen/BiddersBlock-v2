import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500";
const empty = { itemName: "", itemDescription: "", itemPicture: "", startingPrice: "", auctionStartTime: "", auctionEndTime: "" };

const AddAuctionForm = ({ onAuctionAdded, userID }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const start = new Date(form.auctionStartTime), end = new Date(form.auctionEndTime);
    if (end <= start) return setError("The end time must be after the start time.");
    if (end <= new Date()) return setError("The end time must be in the future.");
    setBusy(true);
    try {
      await axios.post("http://localhost:3001/add-auction", {
        ...form,
        sellerID: userID,
        auctionStartTime: start.toISOString(), // sends an unambiguous time, not a local string
        auctionEndTime: end.toISOString(),
      });
      await onAuctionAdded();
      setForm(empty);
      navigate("/Auctions");
    } catch (err) {
      setError(err.response?.data?.error || "We couldn't list your item. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">List an item</h2>
        <label className="block text-sm font-medium text-slate-700">Item name
          <input className={input} required value={form.itemName} onChange={set("itemName")} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Description
          <textarea className={input} rows={4} required value={form.itemDescription} onChange={set("itemDescription")} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Image URL
          <input className={input} type="url" required value={form.itemPicture} onChange={set("itemPicture")} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Starting price ($)
          <input className={input} type="number" min="1" step="0.01" required value={form.startingPrice} onChange={set("startingPrice")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Starts
            <input className={input} type="datetime-local" required value={form.auctionStartTime} onChange={set("auctionStartTime")} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Ends
            <input className={input} type="datetime-local" required value={form.auctionEndTime} onChange={set("auctionEndTime")} />
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <button disabled={busy} className="rounded-lg bg-violet-900 px-6 py-2.5 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
          {busy ? "Listing…" : "List item"}
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">Image preview</p>
        <div className="mt-1 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
          {form.itemPicture && <img src={form.itemPicture} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />}
        </div>
      </div>
    </form>
  );
};
export default AddAuctionForm;
