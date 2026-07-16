"use client";
import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

export default function VoiceEntryButton({ categories, onParsed }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));

  const start = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    setListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const amountMatch = transcript.match(/(\d+(\.\d+)?)/);
      const amount = amountMatch ? amountMatch[1] : "";
      const lower = transcript.toLowerCase();
      const match = categories.find((c) => lower.includes(c.name.toLowerCase()));
      onParsed({ amount, categoryId: match?.id, note: transcript });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  if (!supported) return null;

  return (
    <button type="button" onClick={start}
      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${listening ? "bg-coral animate-pulse" : "bg-violet/15"}`}>
      {listening ? <MicOff size={15} className="text-white" /> : <Mic size={15} className="text-violet" />}
    </button>
  );
}
