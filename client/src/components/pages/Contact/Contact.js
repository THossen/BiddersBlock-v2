import { useState } from "react";
import axios from "axios";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500";
const blank = { contactName: "", contactEmail: "", contactNumber: "", contactMessage: "" };

const Contact = () => {
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/add-contact", form);
      setForm(blank);
      setStatus({ ok: true, text: "Thanks, we've received your message." });
    } catch {
      setStatus({ ok: false, text: "We couldn't send your message. Please try again." });
    }
  };

  return (
    <div className="flex justify-center px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Contact us</h1>
        <p className="mt-1 text-sm text-slate-600">Questions about an auction? Send us a message.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">Name
          <input className={input} required value={form.contactName} onChange={set("contactName")} /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Email
          <input className={input} type="email" required value={form.contactEmail} onChange={set("contactEmail")} /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Phone (optional)
          <input className={input} type="tel" value={form.contactNumber} onChange={set("contactNumber")} /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Message
          <textarea className={input} rows={5} required value={form.contactMessage} onChange={set("contactMessage")} /></label>
        {status && <p role="status" className={`mt-4 text-sm ${status.ok ? "text-emerald-700" : "text-rose-700"}`}>{status.text}</p>}
        <button className="mt-6 w-full rounded-lg bg-violet-900 py-2.5 font-semibold text-white hover:bg-violet-800">Send message</button>
      </form>
    </div>
  );
};
export default Contact;
