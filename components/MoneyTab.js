"use client";
import { useState } from "react";
import { Plus, CreditCard, Pencil, Trash2, Landmark, Wallet2 } from "lucide-react";
import { rupee, addDaysToDay } from "@/utils/format";
import Modal, { Field } from "./Modal";
import { SectionLabel } from "./DashboardTab";

export default function MoneyTab({
  accounts, addAccount, updateAccount, deleteAccount,
  creditCards, addCard, updateCard, deleteCard, payCard,
  loans, addLoan, updateLoan, deleteLoan, payLoanEmi,
  sub: subProp, setSub: setSubProp,
}) {
  const [subState, setSubState] = useState("accounts");
  const sub = subProp ?? subState;
  const setSub = setSubProp ?? setSubState;

  return (
    <div className="px-4 pb-6">
      <div className="flex bg-panel rounded-xl p-1 mb-5 border border-border">
        {[["accounts", "Accounts"], ["cards", "Credit Cards"], ["loans", "Loans / EMI"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)}
            className={`flex-1 py-2 rounded-[9px] text-[12.5px] font-semibold ${sub === k ? "bg-violet/20 text-violet" : "text-muted"}`}>
            {l}
          </button>
        ))}
      </div>

      {sub === "accounts" && (
        <AccountsSection accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount} />
      )}
      {sub === "cards" && (
        <CardsSection cards={creditCards} accounts={accounts} addCard={addCard} updateCard={updateCard} deleteCard={deleteCard} payCard={payCard} />
      )}
      {sub === "loans" && (
        <LoansSection loans={loans} accounts={accounts} addLoan={addLoan} updateLoan={updateLoan} deleteLoan={deleteLoan} payLoanEmi={payLoanEmi} />
      )}

      <style jsx global>{`
        .input { width: 100%; background: #0F1117; border: 1px solid #262B3B; border-radius: 12px; padding: 11px 13px; color: #EDEFF7; font-size: 14px; outline: none; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

/* ---------------- Accounts ---------------- */
function AccountsSection({ accounts, addAccount, updateAccount, deleteAccount }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Bank", balance: "" });

  const startAdd = () => { setForm({ name: "", type: "Bank", balance: "" }); setEditing("new"); };
  const startEdit = (a) => { setForm({ name: a.name, type: a.type, balance: String(a.balance) }); setEditing(a.id); };
  const save = async () => {
    if (!form.name.trim()) return;
    const bal = parseFloat(form.balance) || 0;
    if (editing === "new") await addAccount({ name: form.name.trim(), type: form.type, balance: bal });
    else await updateAccount(editing, { name: form.name.trim(), type: form.type, balance: bal });
    setEditing(null);
  };

  return (
    <>
      <SectionLabel text={`Accounts (${accounts.length})`} action={
        <button onClick={startAdd} className="flex items-center gap-1 text-[12.5px] text-violet bg-violet/10 px-2.5 py-1.5 rounded-[9px] font-semibold">
          <Plus size={14} /> Add
        </button>
      } />
      {accounts.map((a) => (
        <div key={a.id} className="flex items-center gap-3 py-[11px] px-1 border-b border-borderSoft">
          <div className="w-9 h-9 rounded-[11px] bg-violet/10 flex items-center justify-center flex-shrink-0"><Landmark size={16} className="text-violet" /></div>
          <div className="flex-1"><div className="text-sm text-text font-semibold">{a.name}</div><div className="text-[11.5px] text-muted mt-0.5">{a.type}</div></div>
          <div className={`font-mono font-semibold mr-2.5 ${a.balance < 0 ? "text-coral" : "text-text"}`}>{rupee(a.balance)}</div>
          <button onClick={() => startEdit(a)} className="w-[26px] h-[26px] flex items-center justify-center"><Pencil size={13} className="text-muted" /></button>
          <button onClick={() => deleteAccount(a.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
        </div>
      ))}
      {editing && (
        <Modal title={editing === "new" ? "Add Account" : "Edit Account"} onClose={() => setEditing(null)}>
          <Field label="Account name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. HDFC Savings" /></Field>
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {["Cash", "Bank", "Wallet"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Balance"><input className="input" type="number" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} placeholder="0" /></Field>
          <button onClick={save} className="w-full py-[13px] rounded-2xl bg-violet text-ink font-bold text-[14.5px] mt-1">Save Account</button>
        </Modal>
      )}
    </>
  );
}

/* ---------------- Credit Cards ---------------- */
function CardsSection({ cards, accounts, addCard, updateCard, deleteCard, payCard }) {
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [payAcct, setPayAcct] = useState(accounts[0]?.id || "");
  const blank = { name: "", bank: "", creditLimit: "", usedLimit: "", statementDay: "", dueDay: "", minDue: "", cashback: "0" };
  const [form, setForm] = useState(blank);

  const startAdd = () => { setForm(blank); setEditing("new"); };
  const startEdit = (c) => { setForm({
    name: c.name, bank: c.bank, creditLimit: String(c.creditLimit), usedLimit: String(c.usedLimit),
    statementDay: String(c.statementDay || ""), dueDay: c.dueDayAuto ? "" : String(c.dueDay || ""), minDue: String(c.minDue || 0), cashback: String(c.cashback || 0),
  }); setEditing(c.id); };

  const save = async () => {
    if (!form.name.trim()) return;
    const statementDay = parseInt(form.statementDay) || null;
    const manualDueDay = parseInt(form.dueDay) || null;
    // If the person only fills the bill-generation (statement) date and
    // leaves due date blank, auto-set due date = statement date + 20 days —
    // so the bill still shows up correctly without extra manual entry.
    const dueDay = manualDueDay || (statementDay ? addDaysToDay(statementDay, 20) : null);
    const payload = {
      name: form.name.trim(), bank: form.bank.trim(),
      creditLimit: parseFloat(form.creditLimit) || 0, usedLimit: parseFloat(form.usedLimit) || 0,
      statementDay, dueDay, dueDayAuto: !manualDueDay,
      minDue: parseFloat(form.minDue) || 0, cashback: parseFloat(form.cashback) || 0,
    };
    if (editing === "new") await addCard({ ...payload, lastPaymentMonth: "" });
    else await updateCard(editing, payload);
    setEditing(null);
  };

  const submitPay = async () => {
    const amt = parseFloat(payAmt);
    if (!amt || amt <= 0 || !payAcct) return;
    await payCard(paying, amt, payAcct);
    setPaying(null); setPayAmt("");
  };

  const dueLabel = (c) => {
    if (!c.dueDay) return null;
    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), c.dueDay);
    const overdue = due < today && c.usedLimit > 0;
    const daysLeft = Math.ceil((due - today) / 86400000);
    return { text: `${c.dueDay}${ordinal(c.dueDay)}`, overdue, daysLeft };
  };

  return (
    <>
      <SectionLabel text={`Credit Cards (${cards.length})`} action={
        <button onClick={startAdd} className="flex items-center gap-1 text-[12.5px] text-amber bg-amber/10 px-2.5 py-1.5 rounded-[9px] font-semibold"><Plus size={14} /> Add</button>
      } />
      {cards.length === 0 && <div className="text-center text-[#5C6178] text-[13px] p-6 bg-[#151822] rounded-2xl border border-dashed border-[#262B3B]">No credit cards added yet.</div>}
      {cards.map((c) => {
        const available = c.creditLimit - c.usedLimit;
        const pct = c.creditLimit > 0 ? Math.min(100, Math.round((c.usedLimit / c.creditLimit) * 100)) : 0;
        const due = dueLabel(c);
        return (
          <div key={c.id} className="bg-panel border border-border rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] bg-amber/15 flex items-center justify-center"><CreditCard size={16} className="text-amber" /></div>
                <div><div className="text-sm text-text font-semibold">{c.name}</div><div className="text-[11px] text-muted">{c.bank}</div></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(c)} className="w-[26px] h-[26px] flex items-center justify-center"><Pencil size={13} className="text-muted" /></button>
                <button onClick={() => deleteCard(c.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-ink overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? "#FF6B5B" : "#F0B429" }} />
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[12px] text-muted mb-2">
              <div>Used: <span className="font-mono text-text">{rupee(c.usedLimit)}</span></div>
              <div className="text-right">Available: <span className="font-mono text-mint">{rupee(available)}</span></div>
              <div>Statement: <span className="text-[#C7CBDA]">{c.statementDay ? `${c.statementDay}${ordinal(c.statementDay)}` : "—"}</span></div>
              <div className="text-right">
                Due: <span className={due?.overdue ? "text-coral font-semibold" : "text-[#C7CBDA]"}>
                  {due ? due.text : "—"}{c.dueDayAuto && due ? " (auto)" : ""}{due?.overdue ? " (overdue)" : due && due.daysLeft >= 0 && due.daysLeft <= 5 && c.usedLimit > 0 ? ` (${due.daysLeft}d left)` : ""}
                </span>
              </div>
              <div>Min Due: <span className="font-mono text-[#C7CBDA]">{rupee(c.minDue)}</span></div>
              <div className="text-right">Cashback: <span className="font-mono text-mint">{rupee(c.cashback)}</span></div>
            </div>
            <button onClick={() => { setPaying(c.id); setPayAmt(String(c.minDue || "")); }} className="w-full py-2 rounded-xl bg-amber/15 text-amber font-semibold text-[12.5px]">Pay / Reduce Balance</button>
          </div>
        );
      })}

      {editing && (
        <Modal title={editing === "new" ? "Add Credit Card" : "Edit Credit Card"} onClose={() => setEditing(null)}>
          <Field label="Card name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. SBI Cashback" /></Field>
          <Field label="Bank"><input className="input" value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))} placeholder="e.g. SBI" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Credit Limit"><input className="input" type="number" value={form.creditLimit} onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} /></Field>
            <Field label="Used Limit"><input className="input" type="number" value={form.usedLimit} onChange={(e) => setForm((f) => ({ ...f, usedLimit: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Statement Day (1-31)"><input className="input" type="number" min="1" max="31" placeholder="e.g. 5" value={form.statementDay} onChange={(e) => setForm((f) => ({ ...f, statementDay: e.target.value }))} /></Field>
            <Field label="Due Day (optional)"><input className="input" type="number" min="1" max="31" placeholder="Auto: +20 days" value={form.dueDay} onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value }))} /></Field>
          </div>
          <div className="text-[11px] text-muted -mt-2 mb-3.5">Leave Due Day blank and it's auto-set to Statement Day + 20 — the usual billing cycle.</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum Due"><input className="input" type="number" value={form.minDue} onChange={(e) => setForm((f) => ({ ...f, minDue: e.target.value }))} /></Field>
            <Field label="Cashback Earned"><input className="input" type="number" value={form.cashback} onChange={(e) => setForm((f) => ({ ...f, cashback: e.target.value }))} /></Field>
          </div>
          <button onClick={save} className="w-full py-[13px] rounded-2xl bg-amber text-ink font-bold text-[14.5px] mt-1">Save Card</button>
        </Modal>
      )}

      {paying && (
        <Modal title="Pay Credit Card" onClose={() => setPaying(null)}>
          <Field label="Amount"><input className="input font-mono text-lg" type="number" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} /></Field>
          <Field label="Pay from account">
            <select className="input" value={payAcct} onChange={(e) => setPayAcct(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <button onClick={submitPay} className="w-full py-[13px] rounded-2xl bg-mint text-ink font-bold text-[14.5px] mt-1">Confirm Payment</button>
        </Modal>
      )}
    </>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/* ---------------- Loans / EMI ---------------- */
function LoansSection({ loans, accounts, addLoan, updateLoan, deleteLoan, payLoanEmi }) {
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payAcct, setPayAcct] = useState(accounts[0]?.id || "");
  const blank = { name: "", type: "Home Loan", principal: "", emiAmount: "", interestRate: "", remainingBalance: "", nextDueDate: "" };
  const [form, setForm] = useState(blank);

  const startAdd = () => { setForm(blank); setEditing("new"); };
  const startEdit = (l) => { setForm({
    name: l.name, type: l.type, principal: String(l.principal), emiAmount: String(l.emiAmount),
    interestRate: String(l.interestRate || 0), remainingBalance: String(l.remainingBalance), nextDueDate: l.nextDueDate || "",
  }); setEditing(l.id); };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(), type: form.type,
      principal: parseFloat(form.principal) || 0, emiAmount: parseFloat(form.emiAmount) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
      remainingBalance: parseFloat(form.remainingBalance) || 0, nextDueDate: form.nextDueDate,
    };
    if (editing === "new") await addLoan(payload);
    else await updateLoan(editing, payload);
    setEditing(null);
  };

  return (
    <>
      <SectionLabel text={`Loans / EMI (${loans.length})`} action={
        <button onClick={startAdd} className="flex items-center gap-1 text-[12.5px] text-coral bg-coral/10 px-2.5 py-1.5 rounded-[9px] font-semibold"><Plus size={14} /> Add</button>
      } />
      {loans.length === 0 && <div className="text-center text-[#5C6178] text-[13px] p-6 bg-[#151822] rounded-2xl border border-dashed border-[#262B3B]">No loans added yet.</div>}
      {loans.map((l) => {
        const pct = l.principal > 0 ? Math.min(100, Math.round(((l.principal - l.remainingBalance) / l.principal) * 100)) : 0;
        return (
          <div key={l.id} className="bg-panel border border-border rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] bg-coral/15 flex items-center justify-center"><Wallet2 size={16} className="text-coral" /></div>
                <div><div className="text-sm text-text font-semibold">{l.name}</div><div className="text-[11px] text-muted">{l.type}</div></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(l)} className="w-[26px] h-[26px] flex items-center justify-center"><Pencil size={13} className="text-muted" /></button>
                <button onClick={() => deleteLoan(l.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-ink overflow-hidden mb-2">
              <div className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[12px] text-muted mb-2">
              <div>EMI: <span className="font-mono text-text">{rupee(l.emiAmount)}</span></div>
              <div className="text-right">Remaining: <span className="font-mono text-coral">{rupee(l.remainingBalance)}</span></div>
              <div>Interest: <span className="text-[#C7CBDA]">{l.interestRate}%</span></div>
              <div className="text-right">Next Due: <span className="text-[#C7CBDA]">{l.nextDueDate || "—"}</span></div>
            </div>
            <button onClick={() => setPaying(l.id)} className="w-full py-2 rounded-xl bg-coral/15 text-coral font-semibold text-[12.5px]">Mark EMI Paid</button>
          </div>
        );
      })}

      {editing && (
        <Modal title={editing === "new" ? "Add Loan" : "Edit Loan"} onClose={() => setEditing(null)}>
          <Field label="Loan name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Home Loan - SBI" /></Field>
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {["Home Loan", "Car Loan", "Personal Loan", "Education Loan", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Principal"><input className="input" type="number" value={form.principal} onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))} /></Field>
            <Field label="EMI Amount"><input className="input" type="number" value={form.emiAmount} onChange={(e) => setForm((f) => ({ ...f, emiAmount: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Interest Rate %"><input className="input" type="number" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} /></Field>
            <Field label="Remaining Balance"><input className="input" type="number" value={form.remainingBalance} onChange={(e) => setForm((f) => ({ ...f, remainingBalance: e.target.value }))} /></Field>
          </div>
          <Field label="Next Due Date"><input className="input" type="date" value={form.nextDueDate} onChange={(e) => setForm((f) => ({ ...f, nextDueDate: e.target.value }))} /></Field>
          <button onClick={save} className="w-full py-[13px] rounded-2xl bg-coral text-ink font-bold text-[14.5px] mt-1">Save Loan</button>
        </Modal>
      )}

      {paying && (
        <Modal title="Mark EMI Paid" onClose={() => setPaying(null)}>
          <Field label="Pay from account">
            <select className="input" value={payAcct} onChange={(e) => setPayAcct(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <div className="text-[12px] text-muted mb-3">This deducts the EMI amount from the selected account, reduces the remaining balance, and advances the next due date by one month.</div>
          <button onClick={async () => { await payLoanEmi(paying, payAcct); setPaying(null); }} className="w-full py-[13px] rounded-2xl bg-mint text-ink font-bold text-[14.5px]">Confirm EMI Payment</button>
        </Modal>
      )}
    </>
  );
}
