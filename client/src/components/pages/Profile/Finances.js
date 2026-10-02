import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../../api";
import { dateLabel, money } from "./ProfileShared";

const buildMonthlyTotals = (transactions) => {
  const months = new Map();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!months.has(key)) {
      months.set(key, {
        key,
        month: date.toLocaleDateString(undefined, { month: "short", year: "numeric", timeZone: "UTC" }),
        earnings: 0,
        spending: 0,
      });
    }
    const entry = months.get(key);
    if (transaction.transactionType === "earning") {
      entry.earnings += Number(transaction.amount || 0);
    } else {
      entry.spending += Number(transaction.amount || 0);
    }
  });

  return [...months.values()].sort((a, b) => a.key.localeCompare(b.key));
};

const Finances = () => {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/my-finances")
      .then((response) => setTransactions(response.data.transactions))
      .catch((requestError) => {
        setError(requestError.response?.data?.error || "We couldn't load your transaction history.");
        setTransactions([]);
      });
  }, []);

  const completed = transactions || [];
  const earnings = completed
    .filter((transaction) => transaction.transactionType === "earning")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const spending = completed
    .filter((transaction) => transaction.transactionType === "spending")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const monthlyTotals = buildMonthlyTotals(completed);

  return (
    <section>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Account activity
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">Earnings &amp; spending</h2>
        <p className="mt-2 text-sm text-slate-600">
          Completed demo orders only. Bids you lost are not counted as spending.
        </p>
      </header>

      {transactions === null ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading your transaction history…</p>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            <article className="bg-white p-5 sm:p-6">
              <p className="text-sm font-medium text-slate-500">Seller earnings</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">{money(earnings)}</p>
              <p className="mt-2 text-xs text-slate-500">From completed demo orders on your listings</p>
            </article>
            <article className="bg-white p-5 sm:p-6">
              <p className="text-sm font-medium text-slate-500">Buyer spending</p>
              <p className="mt-2 text-3xl font-black text-indigo-700">{money(spending)}</p>
              <p className="mt-2 text-xs text-slate-500">From demo checkouts you completed after winning</p>
            </article>
          </div>

          <section>
            <div className="mb-3">
              <h3 className="text-lg font-bold text-slate-900">Monthly activity</h3>
              <p className="mt-1 text-sm text-slate-500">Completed sales and purchases by month</p>
            </div>
            {monthlyTotals.length ? (
              <div className="h-72 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTotals} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={68} />
                    <Tooltip formatter={(value, name) => [money(value), name]} cursor={{ fill: "#f1f5f9" }} />
                    <Legend />
                    <Bar dataKey="earnings" name="Earnings" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="spending" name="Spending" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="font-semibold text-slate-800">No completed transactions yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Earnings appear when a buyer completes demo checkout on your listing. Spending appears when you complete checkout after winning.
                </p>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3">
              <h3 className="text-lg font-bold text-slate-900">Recent transactions</h3>
            </div>
            {completed.length ? (
              <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {completed.slice(0, 8).map((transaction) => (
                  <article key={`${transaction.transactionType}-${transaction.orderID}`} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{transaction.itemName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${transaction.transactionType === "earning" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                          {transaction.transactionType === "earning" ? "Earned · demo" : "Purchased · demo"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Order #{transaction.orderID} · {dateLabel(transaction.createdAt)}</p>
                    </div>
                    <p className={`text-lg font-bold ${transaction.transactionType === "earning" ? "text-emerald-700" : "text-slate-900"}`}>
                      {transaction.transactionType === "earning" ? "+" : "−"}{money(transaction.amount)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </section>
  );
};

export default Finances;