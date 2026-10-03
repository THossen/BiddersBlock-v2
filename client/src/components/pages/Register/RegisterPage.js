import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GavelIcon from "@mui/icons-material/Gavel";
import BoltIcon from "@mui/icons-material/Bolt";
import InsightsIcon from "@mui/icons-material/Insights";
import api from "../../../api";

const input =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

const FIELDS = [
  ["userFirstname", "First name", "text", "given-name", PersonOutlineIcon],
  ["userLastname", "Last name", "text", "family-name", PersonOutlineIcon],
  ["userAddress", "Address", "text", "street-address", HomeOutlinedIcon],
  ["userEmail", "Email", "email", "email", MailOutlineIcon],
  ["userName", "Username", "text", "username", AlternateEmailIcon],
  ["userPassword", "Password", "password", "new-password", LockOutlinedIcon],
  ["confirm", "Confirm password", "password", "new-password", LockOutlinedIcon],
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    Object.fromEntries(FIELDS.map(([k]) => [k, ""])),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(
        form.userPassword,
      )
    )
      return setError(
        "Use 8+ characters with an uppercase letter, a number and a symbol (!@#$%^&*).",
      );
    if (form.userPassword !== form.confirm)
      return setError("Passwords don't match.");
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await api.post("/register", payload);
      navigate("/LoginPage");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "We couldn't create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-8 sm:py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100" />
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/60 hover:text-indigo-800"
        >
          <ArrowBackIcon fontSize="small" />
          Back to home
        </Link>

        <div className="grid overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 sm:p-9 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-16 -z-10 h-64 w-64 rounded-full border border-indigo-200/60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-6 -z-10 h-64 w-64 rounded-full border border-sky-200/60"
            />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
              Your next great find
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Start bidding
              <span className="block text-indigo-700">your way.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
              Join the auction floor to discover unusual finds, follow the
              action, and sell items of your own.
            </p>

            <div className="mt-9 space-y-5 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <GavelIcon fontSize="small" />
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Live auctions and bidding
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <BoltIcon fontSize="small" />
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Instant bid updates
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <InsightsIcon fontSize="small" />
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Personal earnings and spending insights
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Free to join · No purchase required
            </div>
          </aside>

          <form onSubmit={submit} className="bg-white p-6 sm:p-9 lg:p-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Join today
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Create your account
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Already registered?{" "}
              <Link
                to="/LoginPage"
                className="font-semibold text-indigo-700 hover:underline"
              >
                Log in
              </Link>
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FIELDS.map(([key, label, type, autocomplete, FieldIcon]) => {
                const isPassword = type === "password";
                const inputType =
                  isPassword && !showPasswords
                    ? "password"
                    : isPassword
                      ? "text"
                      : type;
                return (
                  <label
                    key={key}
                    className={`block min-w-0 text-sm font-medium text-slate-700 ${key === "userAddress" || key === "userEmail" ? "sm:col-span-2" : ""}`}
                  >
                    {label}
                    <span className="relative mt-1 block">
                      <FieldIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        fontSize="small"
                      />
                      <input
                        className={`${input} ${isPassword ? "pr-12" : ""}`}
                        type={inputType}
                        autoComplete={autocomplete}
                        required
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((visible) => !visible)
                          }
                          aria-label={
                            showPasswords ? "Hide passwords" : "Show passwords"
                          }
                          title={
                            showPasswords ? "Hide passwords" : "Show passwords"
                          }
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          {showPasswords ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </button>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-rose-700">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create account"}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              By creating an account, you can bid on listings and track your
              auction activity.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
