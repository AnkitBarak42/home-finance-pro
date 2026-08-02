"use client";
import { useState } from "react";
import { Plus, Receipt, Trash2, Check, Pencil } from "lucide-react";
import { rupee, monthKey } from "@/utils/format";
import Modal, { Field } from "./Modal";
import { SectionLabel } from "./DashboardTab";

const BILL_TYPES = ["Electricity", "Water", "LPG", "Broadband", "Mobile", "FASTag", "Insurance", "Other"];

export default function BillsTab({ bills, addBill, updateBill, deleteBill, markPaid, accounts }) {
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payAcct, setPayAcct] = useState(accounts[0]?.id || "");
  const blank = { name: "", type: "Electricity", amount: "", dueDay: "" };
  const [form, setForm] = useState(blank);
  const thisMonth = monthKey(new Date());

  const startAdd = () => { setForm(blank); setEditing("new"); };
  const startEdit = (b) => { setForm({ name: b.name, type: b.type, amount: String(b.amount), dueDay: String(b.dueDay || "") }); setEditing(b.id); };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), type: form.type, amount: parseFloat(form.amount) || 0, dueDay: parseInt(form.dueDay) || 1 };
    if (editing === "new") await addBill({ ...payload, lastPaidMonth: "" });
    else await updateBill(editing, payload);
    setEditing(null);
  };

  return (
    <div className="px-4 pb-6">
      <SectionLabel text={`Recurring Bills (${bills.length})`} action={
        <button onClick={startAdd} className="flex items-center gap-1 text-[12.5px] text-amber bg-amber/10 px-2.5 py-1.5 rounded-[9px] font-semibold"><Plus size={14} /> Add</button>
      } />
      {bills.length === 0 && <div className="text-center text-[#5C6178] text-[13px] p-6 bg-[#F8F9FD] rounded-2xl border border-dashed border-[#ECEEF6]">No recurring bills tracked yet.</div>}
      {bills.map((b) => {
        const paidThisMonth = b.lastPaidMonth === thisMonth;
        return (
          <div key={b.id} className="flex items-center gap-3 py-3 px-1 border-b border-borderSoft">
            <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${paidThisMonth ? "bg-mint/15" : "bg-amber/15"}`}>
              <Receipt size={16} className={paidThisMonth ? "text-mint" : "text-amber"} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-text font-semibold">{b.name}</div>
              <div className="text-[11.5px] text-muted mt-0.5">{b.type} · Due day {b.dueDay} · {paidThisMonth ? "Paid this month" : "Pending"}</div>
            </div>
            <div className="font-mono text-sm text-text font-semibold mr-1.5">{rupee(b.amount)}</div>
            {!paidThisMonth && (
              <button onClick={() => setPaying(b.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Check size={14} className="text-mint" /></button>
            )}
            <button onClick={() => startEdit(b)} className="w-[26px] h-[26px] flex items-center justify-center"><Pencil size={13} className="text-muted" /></button>
            <button onClick={() => deleteBill(b.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
          </div>
        );
      })}

      {editing && (
        <Modal title={editing === "new" ? "Add Bill" : "Edit Bill"} onClose={() => setEditing(null)}>
          <Field label="Bill name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. BSES Electricity" /></Field>
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {BILL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount"><input className="input" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></Field>
            <Field label="Due Day (1-31)"><input className="input" type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value }))} /></Field>
          </div>
          <button onClick={save} className="w-full py-[13px] rounded-2xl bg-amber text-white font-bold text-[14.5px] mt-1">Save Bill</button>
        </Modal>
      )}

      {paying && (
        <Modal title="Mark Bill as Paid" onClose={() => setPaying(null)}>
          <Field label="Pay from account">
            <select className="input" value={payAcct} onChange={(e) => setPayAcct(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <button onClick={async () => { await markPaid(paying, payAcct); setPaying(null); }} className="w-full py-[13px] rounded-2xl bg-mint text-white font-bold text-[14.5px] mt-1">Confirm Payment</button>
        </Modal>
      )}

      <style jsx global>{`
        .input { width: 100%; background: #F4F5FC; border: 1px solid #ECEEF6; border-radius: 12px; padding: 11px 13px; color: #1D2033; font-size: 14px; outline: none; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
