"use client";
import { Search, Wifi } from "lucide-react";

const TITLES = {
  dashboard: "Home Finance Pro",
  transactions: "Transactions",
  stats: "Insights",
  accounts: "Accounts",
  more: "More",
};

export default function Header({ tab, onSearch }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3.5">
      <div>
        <div className="text-[10.5px] tracking-wider text-violet font-bold mb-0.5 flex items-center gap-1.5">
          FAMILY LEDGER <Wifi size={11} className="text-mint" />
        </div>
        <div className="text-[21px] font-bold text-text">{TITLES[tab]}</div>
      </div>
      <button onClick={onSearch} className="w-9 h-9 rounded-[11px] bg-panel border border-border flex items-center justify-center">
        <Search size={18} className="text-[#C7CBDA]" />
      </button>
    </div>
  );
}
