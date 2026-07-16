"use client";
import { Download, FileSpreadsheet } from "lucide-react";
import Modal from "./Modal";

function toCSV(transactions, catMap, accMap) {
  const header = ["Date", "Type", "Category", "Account", "Payment Mode", "Amount", "Note", "Added By"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-IN"),
    t.type,
    catMap[t.categoryId]?.name || "",
    accMap[t.accountId]?.name || "",
    t.paymentMode || "",
    t.amount,
    (t.note || "").replace(/,/g, ";"),
    t.createdByName || "",
  ]);
  return [header, ...rows].map((r) => r.join(",")).join("\n");
}

export default function ExportModal({ transactions, catMap, accMap, onClose }) {
  const download = () => {
    const csv = toCSV(transactions, catMap, accMap);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `home-finance-pro-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="Export Data" onClose={onClose}>
      <div className="text-[12.5px] text-muted mb-4">Download every transaction in your family ledger ({transactions.length} entries) as a CSV file — opens directly in Excel or Google Sheets.</div>
      <button onClick={download} className="w-full flex items-center justify-center gap-2 py-[13px] rounded-2xl bg-mint text-ink font-bold text-[14.5px]">
        <FileSpreadsheet size={16} /> Download CSV
      </button>
      <div className="text-[11px] text-[#4A4F63] mt-4 leading-relaxed">
        PDF and emailed reports aren't available yet — CSV covers every row and opens in any spreadsheet app in the meantime.
      </div>
    </Modal>
  );
}
