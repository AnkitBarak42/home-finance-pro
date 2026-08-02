"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, User, KeyRound, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await login(form.username, form.password);
      router.replace("/dashboard");
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
        <p className="text-center text-[13px] text-[#8890A6] mb-5">Log in to continue</p>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Username" icon={<User size={14} />}>
            <input required className="input" value={form.username} onChange={set("username")} placeholder="e.g. priya_sharma"
              autoCapitalize="none" autoCorrect="off" />
          </Field>
          <Field label="Password" icon={<KeyRound size={14} />}>
            <input required type="password" className="input" value={form.password} onChange={set("password")} placeholder="Enter your password" />
          </Field>

          {error && <div className="text-coral text-[12.5px] bg-coral/10 border border-coral/30 rounded-xl px-3.5 py-2.5">{error}</div>}

          <button disabled={busy}
            className="w-full font-bold py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-2 disabled:opacity-50 text-white transition-transform active:scale-[0.98] bg-gradient-to-br from-violet to-violet2 shadow-fab">
            <LogIn size={17} />
            {busy ? "Please wait…" : "Log In"}
          </button>
        </form>
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
