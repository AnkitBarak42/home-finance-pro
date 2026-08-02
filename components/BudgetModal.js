"use client";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal, { Field } from "./Modal";
import { rupee } from "@/utils/format";

export default function BudgetModal({ categories, monthTxns, updateCategory, onClose }) {
  const expenseCats = categories.filter((c) => c.type === "expense");
  const spendByCat = useMemo(() => {
    const m = {};
    monthTxns.filter((t) => t.type === "expense").forEach((t) => { m[t.categoryId] = (m[t.categoryId] || 0) + t.amount; });
    return m;
  }, [monthTxns]);

  const [edits, setEdits] = useState({});
  const save = async (id) => {
    const val = parseFloat(edits[id]);
    if (isNaN(val)) return;
    await updateCategory(id, { budget: val });
    setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  return (
    <Modal title="Category Budgets" onClose={onClose}>
      <div className="text-[12px] text-muted mb-4">Set a monthly limit per category. You'll see progress here as you spend.</div>
      {expenseCats.map((c) => {
        const spent = spendByCat[c.id] || 0;
        const budget = c.budget || 0;
        const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
        const over = budget > 0 && spent > budget;
        return (
          <div key={c.id} className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span>{c.icon}</span>
                <span className="text-[13px] text-text font-semibold">{c.name}</span>
                {over && <AlertTriangle size={12} className="text-coral" />}
              </div>
              <span className="font-mono text-[11.5px] text-muted">{rupee(spent)} / {budget > 0 ? rupee(budget) : "—"}</span>
            </div>
            {budget > 0 && (
              <div className="h-1.5 rounded-full bg-ink overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? "#F0506B" : pct > 80 ? "#F5A623" : "#1FAE7C" }} />
              </div>
            )}
            <div className="flex gap-2">
              <input className="input flex-1" type="number" placeholder="Set budget ₹" defaultValue={budget || ""}
                onChange={(e) => setEdits((ed) => ({ ...ed, [c.id]: e.target.value }))} />
              <button onClick={() => save(c.id)} className="px-3.5 rounded-xl bg-violet/15 text-violet text-[12.5px] font-semibold">Save</button>
            </div>
          </div>
        );
      })}
      <style jsx global>{`
        .input { background: #F4F5FC; border: 1px solid #ECEEF6; border-radius: 12px; padding: 9px 12px; color: #1D2033; font-size: 13px; outline: none; box-sizing: border-box; }
      `}</style>
    </Modal>
  );
}
