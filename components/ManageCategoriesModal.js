"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2, CornerDownRight } from "lucide-react";
import Modal from "./Modal";
import { CATEGORY_COLORS } from "@/utils/format";

export default function ManageCategoriesModal({ categories, addCategory, deleteCategory, onClose }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [type, setType] = useState("expense");
  const [parentId, setParentId] = useState(""); // "" = top-level
  const [addingSubTo, setAddingSubTo] = useState(null); // quick-add sub under a specific parent

  const typeCats = categories.filter((c) => c.type === type);
  const topLevel = typeCats.filter((c) => !c.parentId);
  const childrenByParent = useMemo(() => {
    const m = {};
    typeCats.filter((c) => c.parentId).forEach((c) => { (m[c.parentId] = m[c.parentId] || []).push(c); });
    return m;
  }, [typeCats]);

  const add = async () => {
    if (!name.trim()) return;
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
    await addCategory({ name: name.trim(), icon, color, type, budget: 0, parentId: parentId || null });
    setName(""); setIcon("🏷️"); setParentId(""); setAddingSubTo(null);
  };

  const quickAddSub = (parent) => {
    setParentId(parent.id);
    setAddingSubTo(parent.id);
    setName(""); setIcon("🏷️");
  };

  return (
    <Modal title="Manage Categories" onClose={onClose}>
      <div className="flex bg-ink rounded-xl p-1 mb-4 border border-[#262B3B]">
        <button onClick={() => { setType("expense"); setParentId(""); }} className={`flex-1 py-2.5 rounded-[9px] font-semibold text-[13px] ${type === "expense" ? "bg-coral/20 text-coral" : "text-muted"}`}>Expense</button>
        <button onClick={() => { setType("income"); setParentId(""); }} className={`flex-1 py-2.5 rounded-[9px] font-semibold text-[13px] ${type === "income" ? "bg-mint/20 text-mint" : "text-muted"}`}>Income</button>
      </div>

      <div className="mb-1.5 text-[11.5px] text-muted font-semibold">
        {addingSubTo ? `Adding subcategory under "${topLevel.find((c) => c.id === addingSubTo)?.name}"` : "Add new category"}
      </div>
      <div className="flex gap-2 mb-2">
        <input className="input w-[52px] text-center text-lg flex-none" value={icon} onChange={(e) => setIcon(e.target.value.slice(0, 2))} />
        <input className="input flex-1" placeholder={addingSubTo ? "Subcategory name" : "Category name"} value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={add} className="w-9 h-9 rounded-[11px] bg-violet flex items-center justify-center flex-none"><Plus size={16} className="text-white" /></button>
      </div>
      {!addingSubTo && (
        <div className="mb-4">
          <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">No parent (top-level category)</option>
            {topLevel.map((c) => <option key={c.id} value={c.id}>Sub-category of: {c.name}</option>)}
          </select>
        </div>
      )}
      {addingSubTo && (
        <button onClick={() => { setAddingSubTo(null); setParentId(""); }} className="text-[11.5px] text-violet font-semibold mb-4">
          Cancel — add a top-level category instead
        </button>
      )}

      <div className="max-h-[300px] overflow-y-auto">
        {topLevel.length === 0 && <div className="text-center text-[#5C6178] text-[13px] py-6">No categories yet.</div>}
        {topLevel.map((c) => (
          <div key={c.id}>
            <div className="flex items-center gap-3 py-[11px] px-1 border-b border-borderSoft">
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: c.color + "1A" }}><span>{c.icon}</span></div>
              <div className="flex-1"><div className="text-sm text-text font-semibold">{c.name}</div></div>
              <button onClick={() => quickAddSub(c)} className="text-[11px] text-violet font-semibold bg-violet/10 px-2 py-1 rounded-lg mr-1">+ Sub</button>
              <button onClick={() => deleteCategory(c.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
            </div>
            {(childrenByParent[c.id] || []).map((sub) => (
              <div key={sub.id} className="flex items-center gap-2.5 py-2 pl-6 pr-1 border-b border-borderSoft">
                <CornerDownRight size={13} className="text-muted flex-shrink-0" />
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: sub.color + "1A" }}><span className="text-[13px]">{sub.icon}</span></div>
                <div className="flex-1"><div className="text-[13px] text-[#C7CBDA] font-medium">{sub.name}</div></div>
                <button onClick={() => deleteCategory(sub.id)} className="w-[24px] h-[24px] flex items-center justify-center"><Trash2 size={12} className="text-muted" /></button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <style jsx global>{`
        .input { background: #0F1117; border: 1px solid #262B3B; border-radius: 12px; padding: 11px 13px; color: #EDEFF7; font-size: 14px; outline: none; box-sizing: border-box; width: 100%; }
      `}</style>
    </Modal>
  );
}
