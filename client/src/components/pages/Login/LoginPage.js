import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../Providers/AuthContext";

const input =
  "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", userPassword: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await axios.post("http://localhost:3001/login", form);
      login(data.user);
      navigate("/ProfilePage");
    } catch (err) {
      setError(err.response?.status === 401
        ? "That username and password don't match."
        : "We couldn't reach the server. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100" />
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Log in</h1>
        </div>
        <p className="text-sm text-slate-600">
          New here? <Link to="/RegisterPage" className="font-medium text-indigo-600 hover:underline">Create an account</Link>
        </p>
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Username
          <input className={input} autoComplete="username" required value={form.userName} onChange={set("userName")} />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <div className="relative">
            <input className={`${input} pr-16`} type={show ? "text" : "password"} autoComplete="current-password"
              required value={form.userPassword} onChange={set("userPassword")} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-3 text-sm font-medium text-indigo-600">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
        <button disabled={busy}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
};
export default LoginPage;
