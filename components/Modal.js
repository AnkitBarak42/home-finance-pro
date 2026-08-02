"use client";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="w-full max-w-[480px] max-h-[88vh] overflow-y-auto bg-panel rounded-t-[22px] border border-border border-b-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-2.5 sticky top-0 bg-panel z-10">
          <div className="text-[16.5px] font-bold text-text">{title}</div>
          <button onClick={onClose} className="w-9 h-9 rounded-[11px] bg-ink border border-border flex items-center justify-center">
            <X size={18} className="text-[#6B7086]" />
          </button>
        </div>
        <div className="px-5 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <div className="text-xs text-muted2 font-semibold mb-1.5">{label}</div>
      {children}
    </div>
  );
}
