// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 text-center"
      >
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Zap className="text-white w-8 h-8 fill-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PostFlow X</h1>
        <p className="text-slate-500 mt-2 mb-10">Voer je wachtwoord in om toegang te krijgen.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-slate-900 transition-all text-lg"
              autoFocus
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-500 text-sm font-bold justify-center"
            >
              <AlertCircle className="w-4 h-4" />
              Onjuist wachtwoord. Probeer het opnieuw.
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Inloggen..." : "Toegang verlenen"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-12">
          &copy; 2026 PostFlow Dedicated X Bot
        </p>
      </motion.div>
    </div>
  );
}
