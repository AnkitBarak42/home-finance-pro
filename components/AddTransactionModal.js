"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Check, CreditCard } from "lucide-react";
import Modal, { Field } from "./Modal";
import VoiceEntryButton from "./VoiceEntryButton";
import { PAYMENT_MODES } from "@/utils/format";

export default function AddTransactionModal({ type, setType, categories, accounts, creditCards = [], onClose, onSave, addCategory }) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expandedParentId, setExpandedParentId] = useState(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [creditCardId, setCreditCardId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [addingCat, setAddingCat] = useState(false);

  const filteredCats = categories.filter((c) => c.type === type);
  const topLevel = filteredCats.filter((c) => !c.parentId);
  const childrenByParent = useMemo(() => {
    const m = {};
    filteredCats.filter((c) => c.parentId).forEach((c) => { (m[c.parentId] = m[c.parentId] || []).push(c); });
    return m;
  }, [filteredCats]);

  useEffect(() => {
    if (!filteredCats.find((c) => c.id === categoryId)) {
      setCategoryId(topLevel[0]?.id || "");
      setExpandedParentId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!accountId && accounts[0]) setAccountId(accounts[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  useEffect(() => {
    if (paymentMode !== "Card") setCreditCardId("");
  }, [paymentMode]);

  const pickParent = (c) => {
    setCategoryId(c.id);
    setExpandedParentId(childrenByParent[c.id]?.length ? c.id : null);
  };
  const pickChild = (c) => setCategoryId(c.id);

  const submitQuickAddCategory = async () => {
    if (!newCatName.trim() || !addCategory) return;
    setAddingCat(true);
    await addCategory({ name: newCatName.trim(), icon: newCatIcon, color: "#8C7AE6", type, budget: 0, parentId: null });
    setNewCatName(""); setNewCatIcon("🏷️"); setQuickAdd(false); setAddingCat(false);
  };

  const linkedToCard = type === "expense" && paymentMode === "Card" && creditCardId;
  const canSave = parseFloat(amount) > 0 && categoryId && (linkedToCard || accountId) && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      type, amount: parseFloat(amount), categoryId, paymentMode, note: note.trim(), date: new Date(date).toISOString(),
      accountId: linkedToCard ? "" : accountId,
      creditCardId: linkedToCard ? creditCardId : "",
    });
    setSaving(false);
  };

  const handleVoice = ({ amount: a, categoryId: c, note: n }) => {
    if (a) setAmount(a);
    if (c) { setCategoryId(c); const parent = filteredCats.find((x) => x.id === c); if (parent && !parent.parentId) setExpandedParentId(childrenByParent[c]?.length ? c : null); }
    setNote(n);
  };

  return (
    <Modal title="Add Transaction" onClose={onClose}>
      <div className="flex bg-ink rounded-xl p-1 mb-4 border border-[#262B3B]">
        <button onClick={() => setType("expense")}
          className={`flex-1 py-2.5 rounded-[9px] font-semibold text-[13px] ${type === "expense" ? "bg-coral/20 text-coral" : "text-muted bg-transparent"}`}>
          Expense
        </button>
        <button onClick={() => setType("income")}
          className={`flex-1 py-2.5 rounded-[9px] font-semibold text-[13px] ${type === "income" ? "bg-mint/20 text-mint" : "text-muted bg-transparent"}`}>
          Income
        </button>
      </div>

      <Field label="Amount">
        <div className="flex items-center gap-2">
          <input className="input font-mono text-[22px] font-semibold flex-1" type="number" inputMode="decimal" placeholder="₹ 0"
            value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          <VoiceEntryButton categories={filteredCats} onParsed={handleVoice} />
        </div>
        <div className="text-[10.5px] text-muted mt-1.5">Tap the mic and say e.g. "Milk 65 rupees" to auto-fill.</div>
      </Field>

      <Field label="Category">
        <div className="grid grid-cols-3 gap-2">
          {topLevel.map((c) => (
            <button key={c.id} onClick={() => pickParent(c)}
              className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-[1.5px] relative"
              style={{ borderColor: (categoryId === c.id || expandedParentId === c.id) ? c.color : "#2A2F40", background: (categoryId === c.id || expandedParentId === c.id) ? c.color + "22" : "#1B1E29" }}>
              <span className="text-[15px]">{c.icon}</span>
              <span className={`text-xs text-center ${(categoryId === c.id || expandedParentId === c.id) ? "text-text" : "text-[#9AA0B4]"}`}>{c.name}</span>
              {childrenByParent[c.id]?.length > 0 && <span className="absolute top-1 right-1.5 text-[8px] text-muted">▾</span>}
            </button>
          ))}
          {addCategory && (
            <button onClick={() => setQuickAdd((q) => !q)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl border-[1.5px] border-dashed border-violet/40 text-violet">
              <Plus size={15} />
              <span className="text-xs">Add New</span>
            </button>
          )}
        </div>

        {quickAdd && (
          <div className="flex gap-2 mt-2.5 items-center">
            <input className="input w-[52px] text-center text-lg flex-none" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value.slice(0, 2))} />
            <input className="input flex-1" placeholder={`New ${type} category`} value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitQuickAddCategory()} autoFocus />
            <button onClick={submitQuickAddCategory} disabled={addingCat || !newCatName.trim()}
              className="w-9 h-9 rounded-[11px] bg-violet flex items-center justify-center flex-none disabled:opacity-50">
              <Check size={16} className="text-white" />
            </button>
          </div>
        )}

        {expandedParentId && childrenByParent[expandedParentId]?.length > 0 && (
          <div className="mt-2.5 pl-1 border-l-2 border-[#262B3B]">
            <div className="text-[10.5px] text-muted font-semibold mb-1.5 pl-2">Subcategory (optional)</div>
            <div className="flex flex-wrap gap-1.5 pl-2">
              <button onClick={() => setCategoryId(expandedParentId)}
                className="px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold"
                style={{ background: categoryId === expandedParentId ? "#8C7AE622" : "#1B1E29", color: categoryId === expandedParentId ? "#8C7AE6" : "#9AA0B4", border: "1px solid #2A2F40" }}>
                General
              </button>
              {childrenByParent[expandedParentId].map((sub) => (
                <button key={sub.id} onClick={() => pickChild(sub)}
                  className="px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1"
                  style={{ background: categoryId === sub.id ? sub.color + "22" : "#1B1E29", color: categoryId === sub.id ? "#EDEFF7" : "#9AA0B4", border: `1px solid ${categoryId === sub.id ? sub.color : "#2A2F40"}` }}>
                  <span>{sub.icon}</span>{sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Payment Mode">
          <select className="input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        {!linkedToCard && (
          <Field label="Account">
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
        )}
        {type === "expense" && paymentMode === "Card" && (
          <Field label="Credit Card">
            <select className="input" value={creditCardId} onChange={(e) => setCreditCardId(e.target.value)}>
              <option value="">Don't track (deduct account)</option>
              {creditCards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        )}
      </div>

      {linkedToCard && (
        <div className="flex items-start gap-2 bg-amber/10 border border-amber/30 rounded-xl px-3 py-2.5 mb-3.5">
          <CreditCard size={14} className="text-amber flex-shrink-0 mt-0.5" />
          <div className="text-[11.5px] text-[#EFD9A6]">This adds to the card's bill instead of deducting an account now. Pay it later from Money → Credit Cards.</div>
        </div>
      )}

      <Field label="Date">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="Note (optional)">
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
      </Field>

      <button onClick={submit} disabled={!canSave}
        className="w-full py-[13px] rounded-2xl text-ink font-bold text-[14.5px] mt-1 disabled:opacity-50"
        style={{ background: type === "income" ? "#38D39F" : "#FF6B5B" }}>
        {saving ? "Saving…" : `Save ${type === "income" ? "Income" : "Expense"}`}
      </button>

      <style jsx global>{`
        .input { width: 100%; background: #0F1117; border: 1px solid #262B3B; border-radius: 12px; padding: 11px 13px; color: #EDEFF7; font-size: 14px; outline: none; box-sizing: border-box; }
      `}</style>
    </Modal>
  );
}
