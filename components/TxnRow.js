"use client";
import { useState } from "react";
import { Trash2, Check, X, CreditCard } from "lucide-react";
import { rupee, categoryLabel } from "@/utils/format";

export default function TxnRow({ t, cat, catMap, acc, cardMap, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const d = t.date ? new Date(t.date) : new Date();
  const label = catMap ? categoryLabel(cat, catMap) : (cat?.name || "Uncategorized");
  const linkedCard = t.creditCardId && cardMap ? cardMap[t.creditCardId] : null;

  return (
    <div className="flex items-center gap-3 py-2.5 px-1 border-b border-borderSoft">
      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: (cat?.color || "#666") + "1A" }}>
        <span className="text-[17px]">{cat?.icon || "💰"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text font-semibold truncate">{label}</div>
        <div className="text-[11.5px] text-muted mt-0.5 truncate flex items-center gap-1">
          {linkedCard ? (
            <span className="flex items-center gap-1 text-amber"><CreditCard size={10} />{linkedCard.name}</span>
          ) : (
            acc?.name || "—"
          )}
          {" · " + d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          {t.note ? " · " + t.note : ""}
          {t.createdByName ? " · " + t.createdByName : ""}
        </div>
      </div>
      <div className={`font-mono text-sm font-bold ${t.type === "income" ? "text-mint" : "text-coral"}`}>
        {t.type === "income" ? "+" : "-"}{rupee(t.amount)}
      </div>
      {onDelete && (confirm ? (
        <div className="flex gap-1 ml-2">
          <button className="w-[26px] h-[26px] flex items-center justify-center" onClick={() => { onDelete(t); setConfirm(false); }}>
            <Check size={13} className="text-mint" />
          </button>
          <button className="w-[26px] h-[26px] flex items-center justify-center" onClick={() => setConfirm(false)}>
            <X size={13} className="text-muted" />
          </button>
        </div>
      ) : (
        <button className="w-[26px] h-[26px] flex items-center justify-center ml-2" onClick={() => setConfirm(true)}>
          <Trash2 size={13} className="text-muted" />
        </button>
      ))}
    </div>
  );
}
