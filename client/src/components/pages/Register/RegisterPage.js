import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500";

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
    <div className="flex justify-center bg-slate-50 px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Already registered? <Link to="/LoginPage" className="font-medium text-violet-700 hover:underline">Log in</Link>
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
          className="mt-6 w-full rounded-lg bg-violet-900 py-2.5 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
};
export default RegisterPage;
