"use client";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { rupee, fmtDay } from "@/utils/format";
import TxnRow from "./TxnRow";

export default function TransactionsTab({ cursor, setCursor, monthTxns, catMap, accMap, cardMap, onDelete, monthIncome, monthExpense }) {
  const nav = (dir) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));

  const grouped = useMemo(() => {
    const g = {};
    monthTxns.forEach((t) => {
      const key = new Date(t.date).toDateString();
      (g[key] = g[key] || []).push(t);
    });
    return Object.entries(g).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [monthTxns]);

  return (
    <div className="px-4 pb-6">
      <MonthNav cursor={cursor} nav={nav} />
      <div className="flex justify-between bg-panel border border-border rounded-2xl px-[18px] py-3.5 mb-4 font-mono text-base font-bold">
        <div><span className="text-mint">{rupee(monthIncome)}</span><div className="font-sans text-[10.5px] text-muted font-medium mt-0.5">Income</div></div>
        <div><span className="text-coral">{rupee(monthExpense)}</span><div className="font-sans text-[10.5px] text-muted font-medium mt-0.5">Expense</div></div>
        <div><span className="text-text">{(monthIncome - monthExpense < 0 ? "-" : "") + rupee(monthIncome - monthExpense)}</span><div className="font-sans text-[10.5px] text-muted font-medium mt-0.5">Net</div></div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center text-[#5C6178] text-[13px] p-7 bg-[#151822] rounded-2xl border border-dashed border-[#262B3B]">No transactions this month.</div>
      ) : grouped.map(([dateStr, txns]) => {
        const d = new Date(dateStr);
        const dayTotal = txns.reduce((s, t) => s + (t.type === "expense" ? t.amount : 0), 0);
        return (
          <div key={dateStr} className="mb-3.5">
            <div className="flex justify-between text-[13px] font-bold text-[#C7CBDA] px-1 py-1.5">
              <span>{d.getDate()} <span className="text-muted font-medium">{fmtDay(d)}</span></span>
              <span className="font-mono text-coral text-[13px]">{rupee(dayTotal)}</span>
            </div>
            {txns.map((t) => <TxnRow key={t.id} t={t} cat={catMap[t.categoryId]} catMap={catMap} acc={accMap[t.accountId]} cardMap={cardMap} onDelete={onDelete} />)}
          </div>
        );
      })}
    </div>
  );
}

export function MonthNav({ cursor, nav }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <button onClick={() => nav(-1)} className="w-8 h-8 rounded-[10px] bg-panel border border-border flex items-center justify-center">
        <ChevronLeft size={18} className="text-[#C7CBDA]" />
      </button>
      <div className="text-[15px] font-bold text-text">{cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
      <button onClick={() => nav(1)} className="w-8 h-8 rounded-[10px] bg-panel border border-border flex items-center justify-center">
        <ChevronRight size={18} className="text-[#C7CBDA]" />
      </button>
    </div>
  );
}
