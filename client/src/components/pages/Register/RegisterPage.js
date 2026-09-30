import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const input =
  "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

const FIELDS = [
  ["userFirstname", "First name", "text", "given-name"],
  ["userLastname", "Last name", "text", "family-name"],
  ["userAddress", "Address", "text", "street-address"],
  ["userEmail", "Email", "email", "email"],
  ["userName", "Username", "text", "username"],
  ["userPassword", "Password", "password", "new-password"],
  ["confirm", "Confirm password", "password", "new-password"],
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map(([k]) => [k, ""])));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(form.userPassword))
      return setError("Use 8+ characters with an uppercase letter, a number and a symbol (!@#$%^&*).");
    if (form.userPassword !== form.confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await axios.post("http://localhost:3001/register", payload);
      navigate("/LoginPage");
    } catch (err) {
      setError(err.response?.data?.error || "We couldn't create your account. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="relative flex justify-center px-4 py-12 sm:py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100" />
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Join today</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create your account</h1>
        </div>
        <p className="text-sm text-slate-600">
          Already registered? <Link to="/LoginPage" className="font-medium text-indigo-600 hover:underline">Log in</Link>
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, type, ac]) => (
            <label key={key}
              className={`block text-sm font-medium text-slate-700 ${key === "userAddress" || key === "userEmail" ? "sm:col-span-2" : ""}`}>
              {label}
              <input className={input} type={type} autoComplete={ac} required value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </label>
          ))}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
        <button disabled={busy}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
};
export default RegisterPage;
