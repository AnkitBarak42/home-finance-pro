"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, signUpCreateFamily, signUpJoinFamily } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | create | join
  const [form, setForm] = useState({ name: "", email: "", password: "", familyName: "", familyId: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else if (mode === "create") {
        await signUpCreateFamily(form);
      } else {
        await signUpJoinFamily(form);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-coral/15 flex items-center justify-center mx-auto mb-4">
          <Wallet size={26} className="text-coral" />
        </div>
        <h1 className="text-2xl font-bold text-text">Home Finance Pro</h1>
        <p className="text-muted text-sm mt-1">Realtime family ledger, synced everywhere</p>
      </div>

      <div className="flex bg-ink border border-border rounded-xl p-1 mb-6">
        {[["login", "Log In"], ["create", "New Family"], ["join", "Join Family"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${mode === k ? "bg-coral/20 text-coral" : "text-muted"}`}>
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode !== "login" && (
          <Field label="Your name">
            <input required className="input" value={form.name} onChange={set("name")} placeholder="e.g. Priya" />
          </Field>
        )}
        <Field label="Email">
          <input required type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input required type="password" minLength={6} className="input" value={form.password} onChange={set("password")} placeholder="At least 6 characters" />
        </Field>
        {mode === "create" && (
          <Field label="Family name">
            <input className="input" value={form.familyName} onChange={set("familyName")} placeholder="e.g. Sharma Family" />
          </Field>
        )}
        {mode === "join" && (
          <Field label="Family code">
            <input required className="input" value={form.familyId} onChange={set("familyId")} placeholder="Ask an admin for the code" />
          </Field>
        )}

        {error && <div className="text-coral text-xs bg-coral/10 border border-coral/30 rounded-lg px-3 py-2">{error}</div>}

        <button disabled={busy} className="w-full bg-coral text-ink font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
          {mode === "login" ? <LogIn size={16} /> : <Users size={16} />}
          {busy ? "Please wait…" : mode === "login" ? "Log In" : mode === "create" ? "Create Family & Start" : "Join Family"}
        </button>
      </form>

      {mode === "create" && (
        <p className="text-muted text-xs text-center mt-4 leading-relaxed">
          You'll get a unique family code after signup — share it with up to 4 family members so their entries sync in realtime.
        </p>
      )}

      <style jsx global>{`
        .input {
          width: 100%; background: #0F1117; border: 1px solid #262B3B; border-radius: 12px;
          padding: 11px 13px; color: #EDEFF7; font-size: 14px; outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-muted2 font-semibold mb-1.5">{label}</div>
      {children}
    </div>
  );
}
