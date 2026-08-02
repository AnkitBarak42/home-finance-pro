"use client";
import { useEffect, useState } from "react";
import { Lock, Delete } from "lucide-react";

const PIN_KEY = "hfp:pin";
const UNLOCKED_KEY = "hfp:unlocked";

export function usePinLock() {
  const [hasPin, setHasPin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pin = localStorage.getItem(PIN_KEY);
    setHasPin(!!pin);
    setUnlocked(!pin || sessionStorage.getItem(UNLOCKED_KEY) === "1");
    setReady(true);
  }, []);

  const setPin = (pin) => { localStorage.setItem(PIN_KEY, pin); setHasPin(true); setUnlocked(true); sessionStorage.setItem(UNLOCKED_KEY, "1"); };
  const removePin = () => { localStorage.removeItem(PIN_KEY); setHasPin(false); setUnlocked(true); };
  const tryUnlock = (pin) => {
    const ok = localStorage.getItem(PIN_KEY) === pin;
    if (ok) { setUnlocked(true); sessionStorage.setItem(UNLOCKED_KEY, "1"); }
    return ok;
  };

  return { ready, hasPin, unlocked, setPin, removePin, tryUnlock };
}

export function LockScreen({ onUnlock }) {
  const [pin, setPinInput] = useState("");
  const [error, setError] = useState(false);

  const press = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPinInput(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (!onUnlock(next)) { setError(true); setPinInput(""); }
      }, 120);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-violet/15 flex items-center justify-center mb-4"><Lock size={24} className="text-violet" /></div>
      <div className="text-text font-bold text-lg mb-1">Enter PIN</div>
      <div className={`text-xs mb-6 ${error ? "text-coral" : "text-muted"}`}>{error ? "Incorrect PIN, try again" : "Unlock Home Finance Pro"}</div>
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-full ${i < pin.length ? "bg-violet" : "bg-[#ECEEF6]"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((d, i) =>
          d === "" ? <div key={i} /> : (
            <button key={i} onClick={() => (d === "del" ? setPinInput((p) => p.slice(0, -1)) : press(d))}
              className="w-14 h-14 rounded-full bg-panel border border-border flex items-center justify-center text-text text-lg font-semibold">
              {d === "del" ? <Delete size={18} /> : d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function PinSetupModal({ onSet, onSkip }) {
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
        if (next === pin) onSet(pin);
        else { setError("PINs didn't match, try again"); setPinInput(""); setConfirm(""); setStage("create"); }
      }
    }
  };

  const val = stage === "create" ? pin : confirm;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-violet/15 flex items-center justify-center mb-4"><Lock size={24} className="text-violet" /></div>
      <div className="text-text font-bold text-lg mb-1">{stage === "create" ? "Set a PIN" : "Confirm PIN"}</div>
      <div className={`text-xs mb-6 ${error ? "text-coral" : "text-muted"}`}>{error || "Protects this app on this device"}</div>
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-full ${i < val.length ? "bg-violet" : "bg-[#ECEEF6]"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((d, i) =>
          d === "" ? <div key={i} /> : (
            <button key={i} onClick={() => (d === "del" ? (stage === "create" ? setPinInput((p) => p.slice(0, -1)) : setConfirm((p) => p.slice(0, -1))) : press(d))}
              className="w-14 h-14 rounded-full bg-panel border border-border flex items-center justify-center text-text text-lg font-semibold">
              {d === "del" ? <Delete size={18} /> : d}
            </button>
          )
        )}
      </div>
      <button onClick={onSkip} className="text-muted text-xs font-medium">Skip for now</button>
    </div>
  );
}
