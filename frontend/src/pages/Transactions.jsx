import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTransactions, useCreateTx, useUpdateTx, useDeleteTx } from "../hooks/useTransactions";
import TransactionTable from "../components/TransactionTable";
import toast from "react-hot-toast";
import api from "../api/client";

const CATS = ["Food", "Rent", "Salary", "Transport", "Entertainment", "Healthcare", "Shopping", "Utilities"];
const EMPTY = { amount: "", type: "expense", category: "Food", date: "", note: "" };

function Modal({ tx, onClose }) {
  const create = useCreateTx();
  const update = useUpdateTx();
  const [form, setForm] = useState(
    tx ? { amount: tx.amount, type: tx.type, category: tx.category, date: tx.date, note: tx.note || "" } : EMPTY
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (tx) await update.mutateAsync({ id: tx.id, ...form, amount: Number(form.amount) });
      else await create.mutateAsync({ ...form, amount: Number(form.amount) });
      toast.success(tx ? "Transaction updated" : "Transaction created");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || "An error occurred");
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
            </svg>
            {tx ? "Edit Transaction" : "New Transaction"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={set("amount")}
                  className="input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Type</label>
              <select value={form.type} onChange={set("type")} className="input">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={set("category")} className="input">
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={set("date")}
                max={new Date().toISOString().split("T")[0]}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Note</label>
            <input
              type="text"
              value={form.note}
              onChange={set("note")}
              className="input"
              placeholder="Optional description"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center"
            >
              {busy ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                tx ? "Save Changes" : "Create Transaction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const canExport = hasRole("analyst", "admin");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: "", category: "", date_from: "", date_to: "", search: "" });
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = Object.fromEntries(
    Object.entries({ page, limit: 20, ...filters }).filter(([, v]) => v !== "" && v !== null)
  );

  const { data, isLoading } = useTransactions(params);
  const del = useDeleteTx();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const exportCsv = async () => {
    try {
      const r = await api.get("/api/v1/transactions/export/csv", { responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Export failed");
    }
  };

  const setF = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };
  const clearFilters = () => { setFilters({ type: "", category: "", date_from: "", date_to: "", search: "" }); setSearch(""); setPage(1); };

  const txs = data?.data || [];
  const meta = data?.meta || {};
  const pages = Math.ceil((meta.total || 0) / (meta.limit || 20));
  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
              </svg>
              Transactions
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {meta.total ? `${meta.total} total transactions` : "Manage your financial records"}
            </p>
          </div>
          <div className="flex gap-3">
            {canExport && (
              <button
                onClick={exportCsv}
                className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setModal({})}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Transaction
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select value={filters.type} onChange={setF("type")} className="input w-36">
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={filters.category} onChange={setF("category")} className="input w-44">
              <option value="">All categories</option>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="date" value={filters.date_from} onChange={setF("date_from")} className="input w-40" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" value={filters.date_to} onChange={setF("date_to")} className="input w-40" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <TransactionTable
              data={txs}
              loading={isLoading}
              onEdit={(t) => setModal(t)}
              onDelete={handleDelete}
            />
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {pages} ({meta.total} records)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <Modal tx={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} />
      )}
    </div>
  );
}