"use client";
import { Search, Wifi } from "lucide-react";

const TITLES = {
  dashboard: "Home Finance Pro",
  transactions: "Transactions",
  stats: "Insights",
  money: "Money",
  more: "More",
};

const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? GREETINGS[0] : h < 17 ? GREETINGS[1] : GREETINGS[2];
}

export default function Header({ tab, onSearch, profile }) {
  return (
    <div className="bg-gradient-to-br from-violet to-violet2 rounded-b-[26px] px-4 pt-5 pb-5 mb-1 shadow-[0_10px_24px_rgba(91,79,232,0.25)]">
      <div className="flex items-center justify-between">
        <div>
          {tab === "dashboard" ? (
            <>
              <div className="text-[10.5px] tracking-wider text-white/70 font-bold mb-0.5 flex items-center gap-1.5">
                {greeting().toUpperCase()}{profile?.name ? `, ${profile.name.toUpperCase()}` : ""} <Wifi size={11} className="text-white/70" />
              </div>
              <div className="text-[21px] font-extrabold text-white tracking-tight">
                HomeFinance Pro
              </div>
            </>
          ) : (
            <>
              <div className="text-[10.5px] tracking-wider text-white/70 font-bold mb-0.5 flex items-center gap-1.5">
                MY LEDGER <Wifi size={11} className="text-white/70" />
              </div>
              <div className="text-[21px] font-bold text-white">{TITLES[tab]}</div>
            </>
          )}
        </div>
        <button onClick={onSearch} className="w-10 h-10 rounded-[13px] bg-white/15 border border-white/20 flex items-center justify-center active:scale-95 transition-transform">
          <Search size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
