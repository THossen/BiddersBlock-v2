import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "../../../Providers/AuthContext";
import api from "../../../api";

const input =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

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
      const { data } = await api.post("/login", form);
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
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/60 hover:text-indigo-800"
        >
          <ArrowBackIcon fontSize="small" />
          Back to home
        </Link>
        <form onSubmit={submit} className="w-full rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Log in</h1>
          </div>
          <p className="text-sm text-slate-600">
            New here? <Link to="/RegisterPage" className="font-semibold text-indigo-700 hover:underline">Create an account</Link>
          </p>
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Username
            <span className="relative mt-1 block">
              <AlternateEmailIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fontSize="small"
              />
              <input
                className={input}
                autoComplete="username"
                required
                value={form.userName}
                onChange={set("userName")}
              />
            </span>
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-1 block">
              <LockOutlinedIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fontSize="small"
              />
              <input
                className={`${input} pr-12`}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.userPassword}
                onChange={set("userPassword")}
              />
              <button
                type="button"
                onClick={() => setShow((visible) => !visible)}
                aria-label={show ? "Hide password" : "Show password"}
                title={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </span>
          </label>
          {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
          <button disabled={busy}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
