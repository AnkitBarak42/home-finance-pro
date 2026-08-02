"use client";
import { LayoutGrid, Receipt, PieChart, Wallet, Settings2, Plus } from "lucide-react";

const TABS = [
  { key: "dashboard", icon: LayoutGrid, label: "Home" },
  { key: "transactions", icon: Receipt, label: "Trans." },
  { key: "stats", icon: PieChart, label: "Insights" },
  { key: "money", icon: Wallet, label: "Money" },
  { key: "more", icon: Settings2, label: "More" },
];

export function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-1/2 translate-x-1/2 bottom-[70px] w-14 h-14 rounded-full bg-gradient-to-br from-violet to-violet2 shadow-fab flex items-center justify-center z-20 active:scale-95 transition-transform ring-4 ring-white"
    >
      <Plus size={24} className="text-white" strokeWidth={2.6} />
    </button>
  );
}

export default function TabBar({ tab, setTab }) {
  return (
    <div className="sticky bottom-0 flex bg-[#FFFFFFee] backdrop-blur-md border-t border-border pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(60,66,110,0.06)]">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex flex-col items-center gap-[3px] py-1">
            <div className="w-9 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: active ? "#5B4FE81A" : "transparent" }}>
              <Icon size={18} className={active ? "text-violet" : "text-muted"} strokeWidth={active ? 2.4 : 2} />
            </div>
            <span className={`text-[10.5px] ${active ? "text-violet font-semibold" : "text-muted font-medium"}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
