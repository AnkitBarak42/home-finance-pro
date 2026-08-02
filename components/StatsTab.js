"use client";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AlertTriangle } from "lucide-react";
import { rupee, monthKey, CATEGORY_COLORS } from "@/utils/format";
import { MonthNav } from "./TransactionsTab";

const tooltipStyle = { background: "#F8F9FD", border: "1px solid #E3E5F0", borderRadius: 10, fontFamily: "Sora", fontSize: 12 };
const GROUPS = [
  { key: "category", label: "Category" },
  { key: "member", label: "Member" },
  { key: "account", label: "Account" },
  { key: "paymentMode", label: "Payment Mode" },
];

export default function StatsTab({ cursor, setCursor, monthTxns, catMap, accMap, monthExpense, transactions }) {
  const nav = (dir) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
  const [group, setGroup] = useState("category");

  const groupData = useMemo(() => {
    const sums = {};
    monthTxns.filter((t) => t.type === "expense").forEach((t) => {
      let key, label, color;
      if (group === "category") { key = t.categoryId; label = catMap[t.categoryId]?.name || "Other"; color = catMap[t.categoryId]?.color; }
      else if (group === "member") { key = t.createdByName || "Unknown"; label = key; }
      else if (group === "account") { key = t.accountId; label = accMap[t.accountId]?.name || "Other"; }
      else { key = t.paymentMode || "Other"; label = key; }
      sums[key] = sums[key] || { label, value: 0, color };
      sums[key].value += t.amount;
    });
    return Object.values(sums)
      .map((v, i) => ({ ...v, color: v.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [monthTxns, group, catMap, accMap]);

  const trend = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const mk = monthKey(d);
      const exp = transactions.filter((t) => t.type === "expense" && monthKey(new Date(t.date)) === mk).reduce((s, t) => s + t.amount, 0);
      arr.push({ month: d.toLocaleDateString("en-IN", { month: "short" }), exp });
    }
    return arr;
  }, [transactions, cursor]);

  // Monthly suggestion: biggest category increase vs last month
  const suggestion = useMemo(() => {
    const prevCursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    const prevMk = monthKey(prevCursor);
    const prevSums = {};
    transactions.filter((t) => t.type === "expense" && monthKey(new Date(t.date)) === prevMk).forEach((t) => {
      prevSums[t.categoryId] = (prevSums[t.categoryId] || 0) + t.amount;
    });
    const curSums = {};
    monthTxns.filter((t) => t.type === "expense").forEach((t) => { curSums[t.categoryId] = (curSums[t.categoryId] || 0) + t.amount; });
    let best = null;
    Object.entries(curSums).forEach(([id, val]) => {
      const diff = val - (prevSums[id] || 0);
      if (diff > 0 && (!best || diff > best.diff)) best = { id, diff, val };
    });
    if (!best || best.diff < 200) return null;
    return `${catMap[best.id]?.name || "A category"} is up ${rupee(best.diff)} vs last month.`;
  }, [transactions, monthTxns, cursor, catMap]);

  return (
    <div className="px-4 pb-6">
      <MonthNav cursor={cursor} nav={nav} />

      {suggestion && (
        <div className="flex items-start gap-2.5 bg-amber/10 border border-amber/30 rounded-2xl p-3.5 mb-4">
          <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-[#EFD9A6]">{suggestion}</div>
        </div>
      )}

      <div className="bg-panel border border-border rounded-[18px] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13.5px] font-bold text-[#6B7086]">Spending Breakdown</div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
          {GROUPS.map((g) => (
            <button key={g.key} onClick={() => setGroup(g.key)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap ${group === g.key ? "bg-violet/20 text-violet" : "bg-ink text-muted border border-border"}`}>
              {g.label}
            </button>
          ))}
        </div>
        {groupData.length === 0 ? (
          <div className="text-center text-[#5C6178] text-[13px] py-6">No expenses recorded this month.</div>
        ) : (
          <>
            <div className="w-full h-[210px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={groupData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2}>
                    {groupData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => rupee(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1.5">
              {groupData.map((e, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-[9px] h-[9px] rounded-[3px] inline-block" style={{ background: e.color }} />
                    <span className="text-[13px] text-[#6B7086]">{e.label}</span>
                  </div>
                  <span className="font-mono text-[12.5px] text-text">
                    {rupee(e.value)} <span className="text-muted">({Math.round((e.value / monthExpense) * 100) || 0}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-panel border border-border rounded-[18px] p-4 mb-4">
        <div className="text-[13.5px] font-bold text-[#6B7086] mb-2">6-Month Expense Trend</div>
        <div className="w-full h-[180px]">
          <ResponsiveContainer>
            <BarChart data={trend} margin={{ left: -20, top: 8 }}>
              <CartesianGrid stroke="#E3E5F040" vertical={false} />
              <XAxis dataKey="month" stroke="#6B7186" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7186" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => rupee(v)} cursor={{ fill: "#00000006" }} />
              <Bar dataKey="exp" radius={[5, 5, 0, 0]} fill="#F0506B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
