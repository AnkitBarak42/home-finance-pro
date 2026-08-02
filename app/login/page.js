"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, User, KeyRound, LogIn, UserPlus, Users, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TABS = [
  { key: "login", label: "Log In" },
  { key: "create", label: "New Family" },
  { key: "join", label: "Join Family" },
];

export default function LoginPage() {
  const { login, signUpCreateFamily, signUpJoinFamily } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    username: "", password: "", name: "", familyName: "", familyId: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchTab = (k) => {
    setTab(k);
    setError("");
    setCreatedCode("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tab === "login") {
        await login(form.username, form.password);
        router.replace("/dashboard");
      } else if (tab === "create") {
        const familyId = await signUpCreateFamily({
          name: form.name,
          username: form.username,
          password: form.password,
          familyName: form.familyName,
        });
        setCreatedCode(familyId);
      } else if (tab === "join") {
        await signUpJoinFamily({
          name: form.name,
          username: form.username,
          password: form.password,
          familyId: form.familyId.trim(),
        });
        router.replace("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 relative overflow-hidden bg-[#0B0D14] min-h-screen">
      {/* Ambient color glow, purely decorative */}
      <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-amber/20 blur-[80px]" />
      <div className="pointer-events-none absolute top-40 -right-20 w-72 h-72 rounded-full bg-violet/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 left-10 w-56 h-56 rounded-full bg-mint/10 blur-[80px]" />

      <div className="relative mb-8 text-center">
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-coral via-amber to-violet flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(245,166,35,0.35)]">
          <Wallet size={28} className="text-white" strokeWidth={2.4} />
        </div>
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Home<span className="bg-gradient-to-r from-coral via-amber to-violet bg-clip-text text-transparent">Finance</span> Pro
        </h1>
        <p className="text-[#8890A6] text-[13px] mt-1.5">Your personal ledger, synced everywhere</p>
      </div>

      <div className="relative bg-[#151822] border border-[#23273A] rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        {/* Tab switcher */}
        <div className="flex bg-[#0F1117] border border-[#23273A] rounded-2xl p-1 mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={`flex-1 text-[12.5px] font-bold py-2.5 rounded-xl transition-colors ${
                tab === t.key ? "bg-[#23273A] text-white" : "text-[#8890A6]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {createdCode ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-mint/15 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-mint" />
            </div>
            <p className="text-white font-bold text-[15px] mb-1.5">Family created!</p>
            <p className="text-[#8890A6] text-[13px] mb-4">
              Share this invite code with family members so they can join:
            </p>
            <div className="bg-[#0F1117] border border-[#23273A] rounded-2xl py-3.5 mb-5">
              <span className="text-[20px] font-mono font-bold tracking-widest text-amber">{createdCode}</span>
            </div>
            <button
              onClick={() => router.replace("/dashboard")}
              className="w-full font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white transition-transform active:scale-[0.98] bg-gradient-to-br from-violet to-violet2 shadow-fab"
            >
              <Home size={17} />
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-[13px] text-[#8890A6] mb-5">
              {tab === "login" && "Log in to continue"}
              {tab === "create" && "Start a new family workspace"}
              {tab === "join" && "Join your family's workspace"}
            </p>

            <form onSubmit={submit} className="space-y-3">
              {tab !== "login" && (
                <Field label="Your Name" icon={<User size={14} />}>
                  <input required className="input" value={form.name} onChange={set("name")} placeholder="e.g. Priya Sharma" />
                </Field>
              )}

              <Field label="Username" icon={<User size={14} />}>
                <input required className="input" value={form.username} onChange={set("username")} placeholder="e.g. priya_sharma"
                  autoCapitalize="none" autoCorrect="off" />
              </Field>

              <Field label="Password" icon={<KeyRound size={14} />}>
                <input required type="password" className="input" value={form.password} onChange={set("password")}
                  placeholder={tab === "login" ? "Enter your password" : "At least 6 characters"} minLength={tab !== "login" ? 6 : undefined} />
              </Field>

              {tab === "create" && (
                <Field label="Family Name (optional)" icon={<Users size={14} />}>
                  <input className="input" value={form.familyName} onChange={set("familyName")} placeholder="e.g. Sharma Family" />
                </Field>
              )}

              {tab === "join" && (
                <Field label="Family Invite Code" icon={<Users size={14} />}>
                  <input required className="input" value={form.familyId} onChange={set("familyId")} placeholder="Code shared by your family admin"
                    autoCapitalize="none" autoCorrect="off" />
                </Field>
              )}

              {error && <div className="text-coral text-[12.5px] bg-coral/10 border border-coral/30 rounded-xl px-3.5 py-2.5">{error}</div>}

              <button disabled={busy}
                className="w-full font-bold py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-2 disabled:opacity-50 text-white transition-transform active:scale-[0.98] bg-gradient-to-br from-violet to-violet2 shadow-fab">
                {tab === "login" && <LogIn size={17} />}
                {tab === "create" && <UserPlus size={17} />}
                {tab === "join" && <Users size={17} />}
                {busy
                  ? "Please wait…"
                  : tab === "login" ? "Log In" : tab === "create" ? "Create Family" : "Join Family"}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%; background: #0F1117; border: 1px solid #23273A; border-radius: 14px;
          padding: 12px 14px; color: #EDEFF7; font-size: 14.5px; outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .input:focus { border-color: #5B4FE8; box-shadow: 0 0 0 3px rgba(91,79,232,0.2); }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <div className="text-[11.5px] text-[#8890A6] font-semibold mb-1.5 flex items-center gap-1.5">{icon}{label}</div>
      {children}
    </div>
  );
}
