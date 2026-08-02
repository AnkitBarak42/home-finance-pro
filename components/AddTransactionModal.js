"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Check, CreditCard } from "lucide-react";
import Modal, { Field } from "./Modal";
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
  const [justAddedId, setJustAddedId] = useState(null);

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

  // Briefly highlight a freshly-created category once it appears in the grid.
  useEffect(() => {
    if (!justAddedId) return;
    const t = setTimeout(() => setJustAddedId(null), 1600);
    return () => clearTimeout(t);
  }, [justAddedId]);

  const pickParent = (c) => {
    setCategoryId(c.id);
    setExpandedParentId(childrenByParent[c.id]?.length ? c.id : null);
  };
  const pickChild = (c) => setCategoryId(c.id);

  const submitQuickAddCategory = async () => {
    if (!newCatName.trim() || !addCategory || addingCat) return;
    setAddingCat(true);
    try {
      const newId = await addCategory({ name: newCatName.trim(), icon: newCatIcon, color: "#5B4FE8", type, budget: 0, parentId: null });
      if (newId) {
        setCategoryId(newId);
        setExpandedParentId(null);
        setJustAddedId(newId);
      }
      setNewCatName(""); setNewCatIcon("🏷️"); setQuickAdd(false);
    } finally {
      setAddingCat(false);
    }
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

  return (
    <Modal title="Add Transaction" onClose={onClose}>
      <div className="flex bg-ink rounded-xl p-1 mb-4 border border-[#ECEEF6]">
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
        <input className="input font-mono text-[22px] font-semibold" type="number" inputMode="decimal" placeholder="₹ 0"
          value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </Field>

      <Field label="Category">
        <div className="grid grid-cols-3 gap-2">
          {topLevel.map((c) => (
            <button key={c.id} onClick={() => pickParent(c)}
              className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-[1.5px] relative transition-all"
              style={{
                borderColor: (categoryId === c.id || expandedParentId === c.id) ? c.color : "#E3E5F0",
                background: (categoryId === c.id || expandedParentId === c.id) ? c.color + "22" : "#F8F9FD",
                boxShadow: justAddedId === c.id ? `0 0 0 3px ${c.color}55` : "none",
              }}>
              <span className="text-[15px]">{c.icon}</span>
              <span className={`text-xs text-center ${(categoryId === c.id || expandedParentId === c.id) ? "text-text" : "text-[#9AA0B4]"}`}>{c.name}</span>
              {childrenByParent[c.id]?.length > 0 && <span className="absolute top-1 right-1.5 text-[8px] text-muted">▾</span>}
              {justAddedId === c.id && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-mint flex items-center justify-center"><Check size={10} className="text-white" /></span>}
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
          <div className="mt-2.5 pl-1 border-l-2 border-[#ECEEF6]">
            <div className="text-[10.5px] text-muted font-semibold mb-1.5 pl-2">Subcategory (optional)</div>
            <div className="flex flex-wrap gap-1.5 pl-2">
              <button onClick={() => setCategoryId(expandedParentId)}
                className="px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold"
                style={{ background: categoryId === expandedParentId ? "#5B4FE822" : "#F8F9FD", color: categoryId === expandedParentId ? "#5B4FE8" : "#9AA0B4", border: "1px solid #E3E5F0" }}>
                General
              </button>
              {childrenByParent[expandedParentId].map((sub) => (
                <button key={sub.id} onClick={() => pickChild(sub)}
                  className="px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1"
                  style={{ background: categoryId === sub.id ? sub.color + "22" : "#F8F9FD", color: categoryId === sub.id ? "#1D2033" : "#9AA0B4", border: `1px solid ${categoryId === sub.id ? sub.color : "#E3E5F0"}` }}>
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
        className="w-full py-[13px] rounded-2xl text-white font-bold text-[14.5px] mt-1 disabled:opacity-50 transition-transform active:scale-[0.98]"
        style={{ background: type === "income" ? "#1FAE7C" : "#F0506B" }}>
        {saving ? "Saving…" : `Save ${type === "income" ? "Income" : "Expense"}`}
      </button>

      <style jsx global>{`
        .input { width: 100%; background: #F4F5FC; border: 1px solid #ECEEF6; border-radius: 12px; padding: 11px 13px; color: #1D2033; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .15s ease; }
        .input:focus { border-color: #5B4FE8; }
      `}</style>
    </Modal>
  );
}
