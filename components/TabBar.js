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
      className="absolute right-[18px] bottom-[84px] w-14 h-14 rounded-[18px] bg-coral shadow-fab flex items-center justify-center z-20"
    >
      <Plus size={24} className="text-ink" strokeWidth={2.6} />
    </button>
  );
}

export default function TabBar({ tab, setTab }) {
  return (
    <div className="sticky bottom-0 flex bg-[#12141Cee] backdrop-blur-md border-t border-[#1E222E] pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex flex-col items-center gap-[3px] py-1">
            <Icon size={19} className={active ? "text-coral" : "text-muted"} strokeWidth={active ? 2.4 : 2} />
            <span className={`text-[10.5px] ${active ? "text-coral font-semibold" : "text-muted font-medium"}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
