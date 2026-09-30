import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../Providers/AuthContext";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500";

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
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-600">
          New here? <Link to="/RegisterPage" className="font-medium text-violet-700 hover:underline">Create an account</Link>
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
              className="absolute inset-y-0 right-3 text-sm font-medium text-violet-700">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
        <button disabled={busy}
          className="mt-6 w-full rounded-lg bg-violet-900 py-2.5 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
};
export default LoginPage;
