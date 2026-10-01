import { useState } from "react";
import api from "../../../api";

const input =
  "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";
const blank = { contactName: "", contactEmail: "", contactNumber: "", contactMessage: "" };

const Contact = () => {
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/add-contact", form);
      setForm(blank);
      setStatus({ ok: true, text: "Thanks, we've received your message." });
    } catch {
      setStatus({ ok: false, text: "We couldn't send your message. Please try again." });
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-12 sm:py-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100 blur-3xl" />
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-sky-600 p-8 text-white shadow-lg shadow-indigo-200">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100">Get in touch</p>
            <h1 className="mt-4 text-3xl font-black">Contact us</h1>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Questions about an auction, bidding process, or account support? We’re here to help.
            </p>
            <div className="mt-8 space-y-4 text-sm text-indigo-50">
              <div>
                <p className="font-semibold uppercase tracking-[0.12em] text-indigo-100">Email</p>
                <p className="mt-1">support@biddersblock.com</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.12em] text-indigo-100">Hours</p>
                <p className="mt-1">Mon–Fri • 9am–6pm</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm text-slate-600">Questions about an auction? Send us a message.</p>
            <label className="mt-6 block text-sm font-medium text-slate-700">Name
              <input className={input} required value={form.contactName} onChange={set("contactName")} /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700">Email
              <input className={input} type="email" required value={form.contactEmail} onChange={set("contactEmail")} /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700">Phone (optional)
              <input className={input} type="tel" value={form.contactNumber} onChange={set("contactNumber")} /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700">Message
              <textarea className={`${input} min-h-[120px] resize-y`} rows={5} required value={form.contactMessage} onChange={set("contactMessage")} /></label>
            {status && <p role="status" className={`mt-4 text-sm ${status.ok ? "text-emerald-700" : "text-rose-700"}`}>{status.text}</p>}
            <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-105">Send message</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Contact;
