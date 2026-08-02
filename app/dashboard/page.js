"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, runTransaction, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { monthKey } from "@/utils/format";

import Header from "@/components/Header";
import TabBar, { FAB } from "@/components/TabBar";
import DashboardTab from "@/components/DashboardTab";
import TransactionsTab from "@/components/TransactionsTab";
import StatsTab from "@/components/StatsTab";
import MoneyTab from "@/components/MoneyTab";
import MoreTab from "@/components/MoreTab";
import VehiclesTab from "@/components/VehiclesTab";
import BillsTab from "@/components/BillsTab";
import AddTransactionModal from "@/components/AddTransactionModal";
import ManageCategoriesModal from "@/components/ManageCategoriesModal";
import SearchModal from "@/components/SearchModal";
import BudgetModal from "@/components/BudgetModal";
import ReportsModal from "@/components/ReportsModal";
import ExportModal from "@/components/ExportModal";
import SecurityModal from "@/components/SecurityModal";
import Modal from "@/components/Modal";
import { usePinLock, LockScreen } from "@/components/SecurityLock";

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const familyId = profile?.familyId;
  const pinLock = usePinLock();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const [tab, setTab] = useState("dashboard");
  const [moneySub, setMoneySub] = useState("accounts");
  const [cursor, setCursor] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState("expense");
  const [manage, setManage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const { data: transactions } = useFirestoreCollection(familyId, "transactions", "date");
  const { data: accounts } = useFirestoreCollection(familyId, "accounts");
  const { data: categories } = useFirestoreCollection(familyId, "categories");
  const { data: family } = useFirestoreCollection(familyId, "members");
  const { data: creditCards } = useFirestoreCollection(familyId, "creditCards");
  const { data: loans } = useFirestoreCollection(familyId, "loans");
  const { data: vehicles } = useFirestoreCollection(familyId, "vehicles");
  const { data: vehicleLogs } = useFirestoreCollection(familyId, "vehicleLogs");
  const { data: bills } = useFirestoreCollection(familyId, "bills");

  const monthTxns = useMemo(() => {
    const mk = monthKey(cursor);
    return transactions.filter((t) => t.date && monthKey(new Date(t.date)) === mk);
  }, [transactions, cursor]);
  const monthIncome = useMemo(() => monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTxns]);
  const monthExpense = useMemo(() => monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTxns]);
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);
  const cardMap = useMemo(() => Object.fromEntries(creditCards.map((c) => [c.id, c])), [creditCards]);
  const catIdByName = useMemo(() => Object.fromEntries(categories.map((c) => [c.name, c.id])), [categories]);

  // Central place that maps a dashboard tap (e.g. "Monthly Income" card) to
  // the right tab / sub-tab / modal, so every stat on the dashboard is live.
  const navigate = useCallback((target) => {
    switch (target) {
      case "income": case "expense": setTab("transactions"); break;
      case "insights": setTab("stats"); break;
      case "accounts": setTab("money"); setMoneySub("accounts"); break;
      case "cards": setTab("money"); setMoneySub("cards"); break;
      case "loans": setTab("money"); setMoneySub("loans"); break;
      case "bills": setManage("bills"); break;
      default: break;
    }
  }, []);

  /* ---------- core transaction + balance helpers ---------- */
  // If a transaction is tagged with a creditCardId, it bumps that card's
  // usedLimit instead of debiting an account (the account only gets touched
  // later, when the card bill is actually paid via payCard).
  const addTransaction = useCallback(async (txn) => {
    const txnRef = doc(collection(db, "families", familyId, "transactions"));
    const acctRef = txn.accountId ? doc(db, "families", familyId, "accounts", txn.accountId) : null;
    const cardRef = txn.creditCardId ? doc(db, "families", familyId, "creditCards", txn.creditCardId) : null;
    await runTransaction(db, async (tx) => {
      let acctCurrent = 0, cardCurrent = 0;
      if (acctRef && !cardRef) {
        const acctSnap = await tx.get(acctRef);
        acctCurrent = acctSnap.exists() ? acctSnap.data().balance || 0 : 0;
      }
      if (cardRef) {
        const cardSnap = await tx.get(cardRef);
        cardCurrent = cardSnap.exists() ? cardSnap.data().usedLimit || 0 : 0;
      }
      tx.set(txnRef, { ...txn, createdBy: profile?.username || "", createdByName: profile?.name || "", createdAt: serverTimestamp() });
      if (cardRef) {
        tx.update(cardRef, { usedLimit: cardCurrent + (txn.type === "income" ? -txn.amount : txn.amount) });
      } else if (acctRef) {
        const delta = txn.type === "income" ? txn.amount : -txn.amount;
        tx.update(acctRef, { balance: acctCurrent + delta });
      }
    });
    return txnRef.id;
  }, [familyId, profile]);

  const addTransactionAndNotify = useCallback(async (txn) => {
    await addTransaction(txn);
    notify(txn.type === "income" ? "Income added" : "Expense added");
    setShowAdd(false);
  }, [addTransaction]);

  const deleteTransaction = useCallback(async (t) => {
    const txnRef = doc(db, "families", familyId, "transactions", t.id);
    const acctRef = t.accountId ? doc(db, "families", familyId, "accounts", t.accountId) : null;
    const cardRef = t.creditCardId ? doc(db, "families", familyId, "creditCards", t.creditCardId) : null;
    await runTransaction(db, async (tx) => {
      let acctCurrent = 0, cardCurrent = 0;
      let acctExists = false;
      if (acctRef && !cardRef) {
        const acctSnap = await tx.get(acctRef);
        acctExists = acctSnap.exists();
        acctCurrent = acctExists ? acctSnap.data().balance || 0 : 0;
      }
      if (cardRef) {
        const cardSnap = await tx.get(cardRef);
        cardCurrent = cardSnap.exists() ? cardSnap.data().usedLimit || 0 : 0;
      }
      tx.delete(txnRef);
      if (cardRef) {
        tx.update(cardRef, { usedLimit: Math.max(0, cardCurrent - (t.type === "income" ? -t.amount : t.amount)) });
      } else if (acctRef && acctExists) {
        const delta = t.type === "income" ? -t.amount : t.amount;
        tx.update(acctRef, { balance: acctCurrent + delta });
      }
    });
    notify("Transaction deleted");
  }, [familyId]);

  /* ---------- accounts ---------- */
  const addAccount = async (a) => { await addDoc(collection(db, "families", familyId, "accounts"), a); notify("Account added"); };
  const updateAccount = async (id, patch) => { await updateDoc(doc(db, "families", familyId, "accounts", id), patch); notify("Account updated"); };
  const deleteAccount = async (id) => { await deleteDoc(doc(db, "families", familyId, "accounts", id)); notify("Account removed"); };

  /* ---------- categories ---------- */
  const addCategory = async (c) => {
    const ref = await addDoc(collection(db, "families", familyId, "categories"), c);
    notify("Category added");
    return ref.id;
  };
  const deleteCategory = async (id) => { await deleteDoc(doc(db, "families", familyId, "categories", id)); };
  const updateCategory = async (id, patch) => { await updateDoc(doc(db, "families", familyId, "categories", id), patch); notify("Budget updated"); };

  /* ---------- credit cards ---------- */
  const addCard = async (c) => { await addDoc(collection(db, "families", familyId, "creditCards"), c); notify("Card added"); };
  const updateCard = async (id, patch) => { await updateDoc(doc(db, "families", familyId, "creditCards", id), patch); notify("Card updated"); };
  const deleteCard = async (id) => { await deleteDoc(doc(db, "families", familyId, "creditCards", id)); notify("Card removed"); };
  const payCard = async (id, amount, accountId) => {
    const card = creditCards.find((c) => c.id === id);
    if (!card) return;
    await updateDoc(doc(db, "families", familyId, "creditCards", id), {
      usedLimit: Math.max(0, card.usedLimit - amount),
      lastPaymentMonth: monthKey(new Date()),
    });
    await addTransaction({
      type: "expense", amount, accountId, paymentMode: "Netbanking",
      categoryId: catIdByName["Credit Card Payment"], note: `Payment to ${card.name}`, date: new Date().toISOString(),
    });
    notify("Card payment recorded");
  };

  /* ---------- loans ---------- */
  const addLoan = async (l) => { await addDoc(collection(db, "families", familyId, "loans"), l); notify("Loan added"); };
  const updateLoan = async (id, patch) => { await updateDoc(doc(db, "families", familyId, "loans", id), patch); notify("Loan updated"); };
  const deleteLoan = async (id) => { await deleteDoc(doc(db, "families", familyId, "loans", id)); notify("Loan removed"); };
  const payLoanEmi = async (id, accountId) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) return;
    const nextDue = loan.nextDueDate ? new Date(loan.nextDueDate) : new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    await updateDoc(doc(db, "families", familyId, "loans", id), {
      remainingBalance: Math.max(0, loan.remainingBalance - loan.emiAmount),
      nextDueDate: nextDue.toISOString().slice(0, 10),
    });
    await addTransaction({
      type: "expense", amount: loan.emiAmount, accountId, paymentMode: "Netbanking",
      categoryId: catIdByName["EMI"], note: `EMI - ${loan.name}`, date: new Date().toISOString(),
    });
    notify("EMI marked paid");
  };

  /* ---------- vehicles ---------- */
  const addVehicle = async (v) => { await addDoc(collection(db, "families", familyId, "vehicles"), v); notify("Vehicle added"); };
  const deleteVehicle = async (id) => { await deleteDoc(doc(db, "families", familyId, "vehicles", id)); notify("Vehicle removed"); };
  const addLog = async (log) => {
    const txnId = await addTransaction({
      type: "expense", amount: log.amount, accountId: log.accountId, paymentMode: "Cash",
      categoryId: catIdByName["Vehicle Maintenance"], note: log.note, date: log.date,
    });
    await addDoc(collection(db, "families", familyId, "vehicleLogs"), { ...log, txnId });
    notify("Vehicle expense logged");
  };
  const deleteLog = async (log) => {
    if (log.txnId) {
      const t = transactions.find((x) => x.id === log.txnId);
      if (t) await deleteTransaction(t);
    }
    await deleteDoc(doc(db, "families", familyId, "vehicleLogs", log.id));
  };

  /* ---------- bills ---------- */
  const addBill = async (b) => { await addDoc(collection(db, "families", familyId, "bills"), b); notify("Bill added"); };
  const updateBill = async (id, patch) => { await updateDoc(doc(db, "families", familyId, "bills", id), patch); notify("Bill updated"); };
  const deleteBill = async (id) => { await deleteDoc(doc(db, "families", familyId, "bills", id)); notify("Bill removed"); };
  const markBillPaid = async (id, accountId) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    const catId = catIdByName[bill.type] || catIdByName["Other"];
    await addTransaction({
      type: "expense", amount: bill.amount, accountId, paymentMode: "Netbanking",
      categoryId: catId, note: bill.name, date: new Date().toISOString(),
    });
    await updateDoc(doc(db, "families", familyId, "bills", id), { lastPaidMonth: monthKey(new Date()) });
    notify("Bill marked paid");
  };

  if (loading || !familyId || !pinLock.ready) {
    return <div className="flex-1 flex items-center justify-center text-muted text-sm">Syncing your family ledger…</div>;
  }

  if (pinLock.hasPin && !pinLock.unlocked) {
    return <LockScreen onUnlock={pinLock.tryUnlock} />;
  }

  return (
    <>
      <Header tab={tab} onSearch={() => setShowSearch(true)} profile={profile} />
      <div className="flex-1 overflow-y-auto pb-[90px]">
        {tab === "dashboard" && (
          <DashboardTab
            accounts={accounts} family={family} monthTxns={monthTxns}
            monthIncome={monthIncome} monthExpense={monthExpense}
            catMap={catMap} accMap={accMap} cardMap={cardMap}
            onQuickAdd={(t) => { setAddType(t); setShowAdd(true); }}
            onDelete={deleteTransaction}
            creditCards={creditCards} loans={loans} bills={bills}
            onNavigate={navigate}
          />
        )}
        {tab === "transactions" && (
          <TransactionsTab
            cursor={cursor} setCursor={setCursor} monthTxns={monthTxns}
            catMap={catMap} accMap={accMap} cardMap={cardMap} onDelete={deleteTransaction}
            monthIncome={monthIncome} monthExpense={monthExpense}
          />
        )}
        {tab === "stats" && (
          <StatsTab cursor={cursor} setCursor={setCursor} monthTxns={monthTxns} catMap={catMap} accMap={accMap}
            monthExpense={monthExpense} transactions={transactions} />
        )}
        {tab === "money" && (
          <MoneyTab
            sub={moneySub} setSub={setMoneySub}
            accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount}
            creditCards={creditCards} addCard={addCard} updateCard={updateCard} deleteCard={deleteCard} payCard={payCard}
            loans={loans} addLoan={addLoan} updateLoan={updateLoan} deleteLoan={deleteLoan} payLoanEmi={payLoanEmi}
          />
        )}
        {tab === "more" && (
          <MoreTab onManage={setManage} profile={profile} onLogout={logout} hasPin={pinLock.hasPin} />
        )}
      </div>

      <FAB onClick={() => { setAddType("expense"); setShowAdd(true); }} />
      <TabBar tab={tab} setTab={setTab} />

      {showAdd && (
        <AddTransactionModal
          type={addType} setType={setAddType}
          categories={categories} accounts={accounts} creditCards={creditCards}
          onClose={() => setShowAdd(false)} onSave={addTransactionAndNotify}
          addCategory={addCategory}
        />
      )}
      {manage === "categories" && (
        <ManageCategoriesModal categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} onClose={() => setManage(null)} />
      )}
      {manage === "budget" && (
        <BudgetModal categories={categories} monthTxns={monthTxns} updateCategory={updateCategory} onClose={() => setManage(null)} />
      )}
      {manage === "vehicles" && (
        <Modal title="Vehicles" onClose={() => setManage(null)}>
          <VehiclesTab vehicles={vehicles} addVehicle={addVehicle} deleteVehicle={deleteVehicle} logs={vehicleLogs} addLog={addLog} deleteLog={deleteLog} accounts={accounts} />
        </Modal>
      )}
      {manage === "bills" && (
        <Modal title="Recurring Bills" onClose={() => setManage(null)}>
          <BillsTab bills={bills} addBill={addBill} updateBill={updateBill} deleteBill={deleteBill} markPaid={markBillPaid} accounts={accounts} />
        </Modal>
      )}
      {manage === "reports" && (
        <ReportsModal transactions={transactions} onClose={() => setManage(null)} />
      )}
      {manage === "export" && (
        <ExportModal transactions={transactions} catMap={catMap} accMap={accMap} onClose={() => setManage(null)} />
      )}
      {manage === "security" && (
        <SecurityModal hasPin={pinLock.hasPin} onSet={pinLock.setPin} onRemove={pinLock.removePin} onClose={() => setManage(null)} />
      )}
      {showSearch && (
        <SearchModal transactions={transactions} catMap={catMap} accMap={accMap} cardMap={cardMap} onClose={() => setShowSearch(false)} />
      )}
      {toast && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[#ECEEF6] text-text px-[18px] py-2.5 rounded-xl text-[13px] font-semibold shadow-lg z-[100]">
          {toast}
        </div>
      )}
    </>
  );
}
