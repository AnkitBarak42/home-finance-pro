"use client";
import { useMemo, useState } from "react";
import Modal from "./Modal";
import { rupee, monthKey } from "@/utils/format";

export default function ReportsModal({ transactions, onClose }) {
  const [range, setRange] = useState("monthly"); // daily | weekly | monthly | yearly

  const rows = useMemo(() => {
    const groups = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      let key;
      if (range === "daily") key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      else if (range === "weekly") {
        const onejan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        key = `Week ${week}, ${d.getFullYear()}`;
      } else if (range === "monthly") key = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      else key = String(d.getFullYear());

      if (!groups[key]) groups[key] = { income: 0, expense: 0, sortKey: range === "daily" || range === "weekly" ? d.getTime() : monthKey(d) + (range === "yearly" ? d.getFullYear() : "") };
      groups[key][t.type === "income" ? "income" : "expense"] += t.amount;
    });
    return Object.entries(groups)
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1))
      .slice(0, 24);
  }, [transactions, range]);

  return (
    <Modal title="Reports" onClose={onClose}>
      <div className="flex bg-ink rounded-xl p-1 mb-4 border border-[#262B3B]">
        {[["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]].map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} className={`flex-1 py-2 rounded-[9px] text-[12px] font-semibold ${range === k ? "bg-violet/20 text-violet" : "text-muted"}`}>{l}</button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="text-center text-[#5C6178] text-[13px] py-8">No transactions yet.</div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-borderSoft">
              <span className="text-[13px] text-[#C7CBDA]">{r.label}</span>
              <div className="flex gap-3 font-mono text-[12.5px]">
                <span className="text-mint">+{rupee(r.income)}</span>
                <span className="text-coral">-{rupee(r.expense)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
