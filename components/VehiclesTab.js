"use client";
import { useMemo, useState } from "react";
import { Plus, Car, Trash2, Fuel, Wrench, ShieldCheck, Gauge, ScrollText, CircleDot } from "lucide-react";
import { rupee } from "@/utils/format";
import Modal, { Field } from "./Modal";
import { SectionLabel } from "./DashboardTab";

const LOG_TYPES = [
  { key: "fuel", label: "Fuel", icon: Fuel, color: "#FF6B5B" },
  { key: "service", label: "Service", icon: Wrench, color: "#8C7AE6" },
  { key: "insurance", label: "Insurance", icon: ShieldCheck, color: "#38D39F" },
  { key: "pollution", label: "Pollution", icon: Gauge, color: "#F0B429" },
  { key: "challan", label: "Challan", icon: ScrollText, color: "#F26E9A" },
  { key: "tyres", label: "Tyres", icon: CircleDot, color: "#4FA8E0" },
];

export default function VehiclesTab({ vehicles, addVehicle, deleteVehicle, logs, addLog, deleteLog, accounts }) {
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vName, setVName] = useState(""); const [vType, setVType] = useState("Car");
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [logModal, setLogModal] = useState(null); // { vehicleId, type }

  const logsByVehicle = useMemo(() => {
    const m = {};
    logs.forEach((l) => { (m[l.vehicleId] = m[l.vehicleId] || []).push(l); });
    return m;
  }, [logs]);

  const saveVehicle = async () => {
    if (!vName.trim()) return;
    await addVehicle({ name: vName.trim(), type: vType });
    setVName(""); setAddingVehicle(false);
  };

  return (
    <div className="px-4 pb-6">
      <SectionLabel text={`Vehicles (${vehicles.length})`} action={
        <button onClick={() => setAddingVehicle(true)} className="flex items-center gap-1 text-[12.5px] text-violet bg-violet/10 px-2.5 py-1.5 rounded-[9px] font-semibold"><Plus size={14} /> Add</button>
      } />

      {vehicles.length === 0 && <div className="text-center text-[#5C6178] text-[13px] p-6 bg-[#151822] rounded-2xl border border-dashed border-[#262B3B]">No vehicles added yet.</div>}

      {vehicles.map((v) => {
        const vLogs = (logsByVehicle[v.id] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        const total = vLogs.reduce((s, l) => s + l.amount, 0);
        return (
          <div key={v.id} className="bg-panel border border-border rounded-2xl p-4 mb-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] bg-violet/15 flex items-center justify-center"><Car size={16} className="text-violet" /></div>
                <div><div className="text-sm text-text font-semibold">{v.name}</div><div className="text-[11px] text-muted">{v.type} · Total spent {rupee(total)}</div></div>
              </div>
              <button onClick={() => deleteVehicle(v.id)} className="w-[26px] h-[26px] flex items-center justify-center"><Trash2 size={13} className="text-muted" /></button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {LOG_TYPES.map((lt) => {
                const Icon = lt.icon;
                return (
                  <button key={lt.key} onClick={() => setLogModal({ vehicleId: v.id, type: lt.key })}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-border" style={{ background: lt.color + "12" }}>
                    <Icon size={15} style={{ color: lt.color }} />
                    <span className="text-[10.5px] text-[#C7CBDA]">{lt.label}</span>
                  </button>
                );
              })}
            </div>

            {vLogs.length > 0 && (
              <button onClick={() => setActiveVehicle(activeVehicle === v.id ? null : v.id)} className="text-[11.5px] text-violet font-semibold">
                {activeVehicle === v.id ? "Hide history" : `View history (${vLogs.length})`}
              </button>
            )}
            {activeVehicle === v.id && (
              <div className="mt-2">
                {vLogs.map((l) => {
                  const lt = LOG_TYPES.find((x) => x.key === l.type);
                  return (
                    <div key={l.id} className="flex items-center gap-2.5 py-2 border-b border-borderSoft">
                      <span className="text-[11.5px] text-[#C7CBDA] flex-1">{lt?.label} {l.note ? "· " + l.note : ""}</span>
                      <span className="text-[11px] text-muted">{new Date(l.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                      <span className="font-mono text-[12.5px] text-coral font-semibold">{rupee(l.amount)}</span>
                      <button onClick={() => deleteLog(l)} className="w-[22px] h-[22px] flex items-center justify-center"><Trash2 size={12} className="text-muted" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {addingVehicle && (
        <Modal title="Add Vehicle" onClose={() => setAddingVehicle(false)}>
          <Field label="Vehicle name"><input className="input" value={vName} onChange={(e) => setVName(e.target.value)} placeholder="e.g. Brezza CNG" /></Field>
          <Field label="Type">
            <select className="input" value={vType} onChange={(e) => setVType(e.target.value)}>
              {["Car", "Bike/Scooter", "EV Scooter", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <button onClick={saveVehicle} className="w-full py-[13px] rounded-2xl bg-violet text-ink font-bold text-[14.5px] mt-1">Save Vehicle</button>
        </Modal>
      )}

      {logModal && (
        <LogEntryModal logModal={logModal} accounts={accounts} onClose={() => setLogModal(null)}
          onSave={async (payload) => { await addLog({ ...payload, vehicleId: logModal.vehicleId, type: logModal.type }); setLogModal(null); }} />
      )}

      <style jsx global>{`
        .input { width: 100%; background: #0F1117; border: 1px solid #262B3B; border-radius: 12px; padding: 11px 13px; color: #EDEFF7; font-size: 14px; outline: none; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function LogEntryModal({ logModal, accounts, onClose, onSave }) {
  const lt = LOG_TYPES.find((x) => x.key === logModal.type);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSave({ amount: amt, note: note.trim(), date: new Date(date).toISOString(), accountId });
  };

  return (
    <Modal title={`Add ${lt?.label} Expense`} onClose={onClose}>
      <Field label="Amount"><input className="input font-mono text-lg" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></Field>
      <Field label="Account">
        <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </Field>
      <Field label="Date"><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Note (optional)"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <button onClick={submit} className="w-full py-[13px] rounded-2xl bg-coral text-ink font-bold text-[14.5px] mt-1">Save</button>
    </Modal>
  );
}
