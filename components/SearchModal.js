"use client";
import { useMemo, useState } from "react";
import Modal from "./Modal";
import TxnRow from "./TxnRow";

export default function SearchModal({ transactions, catMap, accMap, cardMap, onClose }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return transactions.filter((t) => {
      const cat = catMap[t.categoryId]?.name?.toLowerCase() || "";
      const acc = accMap[t.accountId]?.name?.toLowerCase() || "";
      const note = (t.note || "").toLowerCase();
      return cat.includes(lower) || acc.includes(lower) || note.includes(lower);
    }).slice(0, 40);
  }, [q, transactions, catMap, accMap]);

  return (
    <Modal title="Search Transactions" onClose={onClose}>
      <input
        className="input mb-3.5"
        placeholder="Search category, account, note…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {q && results.length === 0 && (
        <div className="text-center text-[#5C6178] text-[13px] py-6">No matching transactions.</div>
      )}
      <div className="max-h-[360px] overflow-y-auto">
        {results.map((t) => <TxnRow key={t.id} t={t} cat={catMap[t.categoryId]} catMap={catMap} acc={accMap[t.accountId]} cardMap={cardMap} />)}
      </div>
      <style jsx global>{`
        .input { width: 100%; background: #F4F5FC; border: 1px solid #ECEEF6; border-radius: 12px; padding: 11px 13px; color: #1D2033; font-size: 14px; outline: none; box-sizing: border-box; }
      `}</style>
    </Modal>
  );
}
