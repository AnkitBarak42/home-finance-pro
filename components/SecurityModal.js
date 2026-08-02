"use client";
import { useState } from "react";
import { Lock, Delete, ShieldCheck } from "lucide-react";
import Modal from "./Modal";

export default function SecurityModal({ hasPin, onSet, onRemove, onClose }) {
  const [mode, setMode] = useState(hasPin ? "menu" : "create");
  const [pin, setPinInput] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState("create");
  const [error, setError] = useState("");

  const press = (d) => {
    const setter = stage === "create" ? setPinInput : setConfirm;
    const cur = stage === "create" ? pin : confirm;
    if (cur.length >= 4) return;
    const next = cur + d;
    setter(next);
    if (next.length === 4) {
      if (stage === "create") { setStage("confirm"); setError(""); }
      else {
        if (next === pin) { onSet(pin); onClose(); }
        else { setError("PINs didn't match, try again"); setPinInput(""); setConfirm(""); setStage("create"); }
      }
    }
  };

  if (mode === "menu") {
    return (
      <Modal title="Security" onClose={onClose}>
        <div className="flex items-center gap-3 bg-mint/10 border border-mint/30 rounded-2xl p-4 mb-4">
          <ShieldCheck size={20} className="text-mint" />
          <div className="text-[12.5px] text-[#6B7086]">PIN lock is currently <span className="text-mint font-semibold">enabled</span> on this device.</div>
        </div>
        <button onClick={() => { setMode("create"); setStage("create"); setPinInput(""); setConfirm(""); }} className="w-full py-3 rounded-xl bg-panel border border-border text-text font-semibold text-[13.5px] mb-2.5">Change PIN</button>
        <button onClick={() => { onRemove(); onClose(); }} className="w-full py-3 rounded-xl bg-coral/10 text-coral font-semibold text-[13.5px]">Remove PIN Lock</button>
      </Modal>
    );
  }

  const val = stage === "create" ? pin : confirm;

  return (
    <Modal title={stage === "create" ? "Set a PIN" : "Confirm PIN"} onClose={onClose}>
      <div className="flex flex-col items-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-violet/15 flex items-center justify-center mb-4"><Lock size={22} className="text-violet" /></div>
        <div className={`text-xs mb-5 ${error ? "text-coral" : "text-muted"}`}>{error || "4-digit PIN protects this app on this device"}</div>
        <div className="flex gap-3 mb-7">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`w-3.5 h-3.5 rounded-full ${i < val.length ? "bg-violet" : "bg-[#ECEEF6]"}`} />)}
        </div>
        <div className="grid grid-cols-3 gap-3.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((d, i) =>
            d === "" ? <div key={i} /> : (
              <button key={i} onClick={() => (d === "del" ? (stage === "create" ? setPinInput((p) => p.slice(0, -1)) : setConfirm((p) => p.slice(0, -1))) : press(d))}
                className="w-12 h-12 rounded-full bg-ink border border-border flex items-center justify-center text-text text-base font-semibold">
                {d === "del" ? <Delete size={16} /> : d}
              </button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
