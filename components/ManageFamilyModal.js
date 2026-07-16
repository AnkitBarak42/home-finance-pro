"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Modal from "./Modal";

export default function ManageFamilyModal({ family, familyId, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <Modal title="Family Members" onClose={onClose}>
      <div className="bg-ink border border-[#262B3B] rounded-2xl p-4 mb-4">
        <div className="text-xs text-muted2 font-semibold mb-2">Invite code — share with family</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-[15px] text-violet tracking-wide">{familyId}</div>
          <button onClick={copyCode} className="w-9 h-9 rounded-[10px] bg-violet/15 flex items-center justify-center">
            {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} className="text-violet" />}
          </button>
        </div>
        <div className="text-[11px] text-muted mt-2 leading-relaxed">
          Anyone with this code can join your family via "Join Family" on the login screen. Their entries sync instantly for everyone.
        </div>
      </div>

      {family.map((f) => (
        <div key={f.id} className="flex items-center gap-3 py-[11px] px-1 border-b border-borderSoft">
          <div className="w-9 h-9 rounded-[11px] bg-violet/10 flex items-center justify-center flex-shrink-0"><span className="text-base">🧑</span></div>
          <div className="flex-1">
            <div className="text-sm text-text font-semibold">{f.name}</div>
            <div className="text-[11.5px] text-muted mt-0.5">{f.role} · {f.email}</div>
          </div>
        </div>
      ))}
    </Modal>
  );
}
