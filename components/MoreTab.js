"use client";
import { Tag, Users, LogOut, ChevronRight, Car, Receipt, Target, BarChart3, FileSpreadsheet, Lock } from "lucide-react";
import { SectionLabel } from "./DashboardTab";

export default function MoreTab({ onManage, family, profile, onLogout, hasPin }) {
  const items = [
    { key: "categories", icon: <Tag size={17} className="text-amber" />, label: "Categories", sub: "Manage income & expense tags" },
    { key: "budget", icon: <Target size={17} className="text-mint" />, label: "Budgets", sub: "Set monthly limits per category" },
    { key: "vehicles", icon: <Car size={17} className="text-violet" />, label: "Vehicles", sub: "Fuel, service, insurance & more" },
    { key: "bills", icon: <Receipt size={17} className="text-amber" />, label: "Recurring Bills", sub: "Electricity, water, mobile & more" },
    { key: "reports", icon: <BarChart3 size={17} className="text-mint" />, label: "Reports", sub: "Daily · Weekly · Monthly · Yearly" },
    { key: "export", icon: <FileSpreadsheet size={17} className="text-violet" />, label: "Export Data", sub: "Download all transactions as CSV" },
    { key: "family", icon: <Users size={17} className="text-violet" />, label: "Family Members", sub: `${family.length} member${family.length !== 1 ? "s" : ""} · invite code` },
    { key: "security", icon: <Lock size={17} className="text-coral" />, label: "Security PIN", sub: hasPin ? "PIN lock is on" : "Not set — tap to enable" },
  ];
  return (
    <div className="px-4 pb-6">
      <div className="bg-panel border border-border rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-coral/15 flex items-center justify-center text-lg font-bold text-coral">
          {profile?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text font-semibold truncate">{profile?.name}</div>
          <div className="text-[11.5px] text-muted truncate">{profile?.email} · {profile?.role}</div>
        </div>
      </div>

      <SectionLabel text="Manage" />
      {items.map((it) => (
        <button key={it.key} onClick={() => onManage(it.key)} className="flex items-center gap-3 w-full py-3 px-1 border-b border-borderSoft bg-transparent">
          <div className="w-9 h-9 rounded-[11px] bg-violet/10 flex items-center justify-center flex-shrink-0">{it.icon}</div>
          <div className="flex-1 text-left">
            <div className="text-sm text-text font-semibold">{it.label}</div>
            <div className="text-[11.5px] text-muted mt-0.5">{it.sub}</div>
          </div>
          <ChevronRight size={16} className="text-[#4A4F63]" />
        </button>
      ))}

      <button onClick={onLogout} className="flex items-center gap-3 w-full py-3 px-1 mt-2 bg-transparent">
        <div className="w-9 h-9 rounded-[11px] bg-coral/10 flex items-center justify-center flex-shrink-0"><LogOut size={17} className="text-coral" /></div>
        <div className="text-sm text-coral font-semibold">Log Out</div>
      </button>

      <div className="text-[11.5px] text-[#4A4F63] text-center mt-5 leading-relaxed">
        Home Finance Pro · realtime sync via Firebase Firestore.
      </div>
    </div>
  );
}
