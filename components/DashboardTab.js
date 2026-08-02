"use client";
import { TrendingUp, TrendingDown, PiggyBank, Users, Plus, ArrowUpRight, ArrowDownRight, Landmark, Wallet2, CreditCard, Receipt, AlertCircle, ChevronRight } from "lucide-react";
import { rupee, monthKey } from "@/utils/format";
import TxnRow from "./TxnRow";

export default function DashboardTab({ accounts, family, monthTxns, monthIncome, monthExpense, catMap, accMap, cardMap, onQuickAdd, onDelete, creditCards = [], loans = [], bills = [], onNavigate = () => {} }) {
  const thisMonth = monthKey(new Date());
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const cashInHand = accounts.filter((a) => a.type === "Cash").reduce((s, a) => s + (a.balance || 0), 0);
  const bankBalance = accounts.filter((a) => a.type === "Bank").reduce((s, a) => s + (a.balance || 0), 0);
  const ccOutstanding = creditCards.reduce((s, c) => s + (c.usedLimit || 0), 0);
  const loanRemaining = loans.reduce((s, l) => s + (l.remainingBalance || 0), 0);
  const netWorth = totalBalance - ccOutstanding - loanRemaining;

  // A loan's EMI only counts as "due" if its next due date has arrived or passed —
  // once paid, nextDueDate rolls forward a month so it drops off this list.
  const dueLoans = loans.filter((l) => l.nextDueDate && monthKey(new Date(l.nextDueDate)) <= thisMonth);
  const emiDueThisMonth = dueLoans.reduce((s, l) => s + (l.emiAmount || 0), 0);

  const dueBills = bills.filter((b) => b.lastPaidMonth !== thisMonth);
  const billsDue = dueBills.reduce((s, b) => s + (b.amount || 0), 0);

  // Show a card here once it has a due date set, even if the balance hasn't
  // been logged yet — the date/reminder itself is the point.
  const dueCards = creditCards.filter((c) => (c.usedLimit || 0) > 0 || c.dueDay);

  // Merge everything owed into one sorted "Due This Cycle" list.
  const today = new Date();
  const dueItems = [
    ...dueCards.map((c) => {
      const dueDate = c.dueDay ? new Date(today.getFullYear(), today.getMonth(), c.dueDay) : null;
      const overdue = dueDate ? dueDate < today : false;
      return { key: `card-${c.id}`, kind: "Credit Card", label: c.name, amount: c.usedLimit, dueDay: c.dueDay, overdue, icon: CreditCard, color: "#F5A623", nav: "cards" };
    }),
    ...dueLoans.map((l) => {
      const dueDate = l.nextDueDate ? new Date(l.nextDueDate) : null;
      const overdue = dueDate ? dueDate < today : false;
      return { key: `loan-${l.id}`, kind: "EMI", label: l.name, amount: l.emiAmount, dueDay: dueDate?.getDate(), overdue, icon: Wallet2, color: "#F0506B", nav: "loans" };
    }),
    ...dueBills.map((b) => {
      const dueDate = b.dueDay ? new Date(today.getFullYear(), today.getMonth(), b.dueDay) : null;
      const overdue = dueDate ? dueDate < today : false;
      return { key: `bill-${b.id}`, kind: "Bill", label: b.name, amount: b.amount, dueDay: b.dueDay, overdue, icon: Receipt, color: "#5B4FE8", nav: "bills" };
    }),
  ].sort((a, b) => (b.overdue - a.overdue) || (a.dueDay || 99) - (b.dueDay || 99));

  const totalDue = dueItems.reduce((s, i) => s + (i.amount || 0), 0);

  const savings = monthIncome - monthExpense;
  const budgetUsed = monthIncome > 0 ? Math.min(100, Math.round((monthExpense / monthIncome) * 100)) : monthExpense > 0 ? 100 : 0;
  const recent = monthTxns.slice(0, 5);
  const ringColor = budgetUsed >= 90 ? "#F0506B" : budgetUsed >= 60 ? "#F5A623" : "#1FAE7C";
  const r = 30, c = 2 * Math.PI * r;

  return (
    <div className="px-4 pb-6">
      <button onClick={() => onNavigate("insights")} className="w-full flex items-center gap-4 bg-gradient-to-br from-violet to-violet2 rounded-[22px] p-[18px] mb-4 text-left active:opacity-90 shadow-[0_12px_28px_rgba(91,79,232,0.28)]">
        <svg width="76" height="76" className="flex-shrink-0">
          <circle cx="38" cy="38" r={r} stroke="rgba(255,255,255,0.25)" strokeWidth="7" fill="none" />
          <circle cx="38" cy="38" r={r} stroke="#FFFFFF" strokeWidth="7" fill="none"
            strokeDasharray={c} strokeDashoffset={c - (budgetUsed / 100) * c} strokeLinecap="round"
            transform="rotate(-90 38 38)" style={{ transition: "stroke-dashoffset .6s ease" }} />
          <text x="38" y="43" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontFamily="IBM Plex Mono" fontWeight="600">{budgetUsed}%</text>
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/70 font-medium">Net Worth · tap for Insights</div>
          <div className="font-mono text-[26px] font-bold text-white mt-0.5">{netWorth < 0 ? "-" : ""}{rupee(netWorth)}</div>
          <div className="flex gap-3.5 mt-2.5">
            <span className="flex items-center gap-1.5"><ArrowUpRight size={13} className="text-white" /><span className="font-mono text-[12.5px] text-white font-semibold">{rupee(monthIncome)}</span></span>
            <span className="flex items-center gap-1.5"><ArrowDownRight size={13} className="text-white/80" /><span className="font-mono text-[12.5px] text-white/90 font-semibold">{rupee(monthExpense)}</span></span>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/70 flex-shrink-0" />
      </button>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <StatCard onClick={() => onNavigate("income")} icon={<TrendingUp size={16} className="text-mint" />} label="Monthly Income" value={rupee(monthIncome)} accent="#1FAE7C" />
        <StatCard onClick={() => onNavigate("expense")} icon={<TrendingDown size={16} className="text-coral" />} label="Monthly Expense" value={rupee(monthExpense)} accent="#F0506B" />
        <StatCard onClick={() => onNavigate("insights")} icon={<PiggyBank size={16} className="text-amber" />} label="Savings" value={(savings < 0 ? "-" : "") + rupee(savings)} accent="#F5A623" />
        <StatCard onClick={() => onNavigate("accounts")} icon={<Landmark size={16} className="text-violet" />} label="Accounts" value={String(accounts.length)} accent="#5B4FE8" />
      </div>

      <SectionLabel text="Money Overview" />
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 mb-5">
        <MiniCard onClick={() => onNavigate("accounts")} icon={<Landmark size={14} className="text-mint" />} label="Cash in Hand" value={rupee(cashInHand)} />
        <MiniCard onClick={() => onNavigate("accounts")} icon={<Landmark size={14} className="text-violet" />} label="Bank Balance" value={rupee(bankBalance)} />
        <MiniCard onClick={() => onNavigate("cards")} icon={<CreditCard size={14} className="text-amber" />} label="CC Outstanding" value={rupee(ccOutstanding)} warn={ccOutstanding > 0} />
        <MiniCard onClick={() => onNavigate("loans")} icon={<Wallet2 size={14} className="text-coral" />} label="EMI Due" value={rupee(emiDueThisMonth)} warn={emiDueThisMonth > 0} />
        <MiniCard onClick={() => onNavigate("bills")} icon={<Receipt size={14} className="text-amber" />} label="Bills Due" value={rupee(billsDue)} warn={billsDue > 0} />
      </div>

      {dueItems.length > 0 && (
        <>
          <SectionLabel text={`Due This Cycle · ${rupee(totalDue)}`} />
          <div className="bg-panel border border-border rounded-2xl mb-5 overflow-hidden">
            {dueItems.map((it) => {
              const Icon = it.icon;
              return (
                <button key={it.key} onClick={() => onNavigate(it.nav)} className="flex items-center gap-3 px-4 py-3 border-b border-borderSoft last:border-b-0 w-full text-left active:bg-black/[0.03]">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: it.color + "1A" }}>
                    <Icon size={14} style={{ color: it.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text font-semibold truncate">{it.label}</div>
                    <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                      {it.kind}{it.dueDay ? ` · Due ${it.dueDay}${ordinal(it.dueDay)}` : ""}
                      {it.overdue && <span className="flex items-center gap-0.5 text-coral font-semibold"><AlertCircle size={10} /> Overdue</span>}
                    </div>
                  </div>
                  <div className="font-mono text-[13px] text-text font-semibold">{rupee(it.amount)}</div>
                  <ChevronRight size={14} className="text-[#4A4F63] flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <SectionLabel text="Quick Add" />
      <div className="flex gap-2.5 mb-5">
        <button onClick={() => onQuickAdd("income")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[13px] bg-panel border border-mint/30 text-mint font-semibold text-[13.5px]">
          <Plus size={15} /> Income
        </button>
        <button onClick={() => onQuickAdd("expense")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[13px] bg-panel border border-coral/30 text-coral font-semibold text-[13.5px]">
          <Plus size={15} /> Expense
        </button>
      </div>

      <SectionLabel text="Cash + Bank Accounts" />
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 mb-5">
        {accounts.map((a) => (
          <button key={a.id} onClick={() => onNavigate("accounts")} className="min-w-[130px] bg-panel border border-border rounded-2xl px-3.5 py-3 flex-shrink-0 text-left active:opacity-80">
            <div className="text-[10px] text-muted font-semibold uppercase tracking-wide">{a.type}</div>
            <div className="text-[13.5px] text-text font-semibold mt-1">{a.name}</div>
            <div className="font-mono text-sm text-violet font-semibold mt-2">{rupee(a.balance)}</div>
          </button>
        ))}
      </div>

      <SectionLabel text="Recent Transactions" action={
        <button onClick={() => onNavigate("income")} className="text-[11.5px] text-violet font-semibold">View all</button>
      } />
      {recent.length === 0 ? (
        <div className="text-center text-muted text-[13px] p-7 bg-[#F8F9FD] rounded-2xl border border-dashed border-[#ECEEF6]">
          No transactions yet this month. Tap + to add your first one.
        </div>
      ) : recent.map((t) => (
        <TxnRow key={t.id} t={t} cat={catMap[t.categoryId]} catMap={catMap} acc={accMap[t.accountId]} cardMap={cardMap} onDelete={onDelete} />
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, accent, onClick }) {
  return (
    <button onClick={onClick} className="bg-panel rounded-2xl p-3.5 text-left active:scale-[0.97] transition-transform shadow-card"
      style={{ boxShadow: `0 6px 20px ${accent}14` }}>
      <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center mb-2.5" style={{ background: accent + "1A" }}>{icon}</div>
      <div className="text-[11.5px] text-muted2 font-medium">{label}</div>
      <div className="font-mono text-[16.5px] font-semibold text-text mt-0.5">{value}</div>
    </button>
  );
}

function MiniCard({ icon, label, value, warn, onClick }) {
  return (
    <button onClick={onClick} className="min-w-[118px] bg-panel rounded-2xl px-3.5 py-3 flex-shrink-0 text-left active:scale-[0.97] transition-transform shadow-card">
      <div className="flex items-center gap-1.5 mb-1.5">{icon}<span className="text-[10px] text-muted font-semibold uppercase tracking-wide">{label}</span></div>
      <div className={`font-mono text-[13.5px] font-semibold ${warn ? "text-amber" : "text-text"}`}>{value}</div>
    </button>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function SectionLabel({ text, action }) {
  return (
    <div className="flex items-center justify-between mx-0.5 mb-2.5 mt-1">
      <div className="text-[13px] font-bold text-text tracking-wide">{text}</div>
      {action}
    </div>
  );
}
