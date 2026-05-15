"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { TwitterIcon } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  platform: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followersCount: number | null;
}

export default function ConnectedAccountsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      const twitter = data.find((a: Account) => a.platform === "twitter");
      setAccount(twitter || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccount(); }, []);

  const disconnect = async () => {
    if (!confirm("Weet je zeker dat je je X-account wilt ontkoppelen?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/accounts?platform=twitter", { method: "DELETE" });
      setAccount(null);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">X Account</h1>
        <p className="text-slate-500 mt-2">Beheer je verbonden X/Twitter-account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Card */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
          ) : account ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border-2 border-green-200 overflow-hidden"
            >
              {/* Header Banner */}
              <div className="h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="relative">
                    {account.avatarUrl ? (
                      <img src={account.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center">
                        <TwitterIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-3 border-white" />
                  </div>
                </div>
              </div>

              <div className="pt-12 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{account.displayName || account.username}</h3>
                      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.141.27.587.7 1.086 1.24 1.44s1.167.551 1.813.568c.647-.017 1.277-.213 1.818-.567s.972-.854 1.245-1.44c.604.223 1.26.27 1.897.14.634-.131 1.217-.437 1.687-.883.445-.47.75-1.054.882-1.69.13-.633.083-1.29-.14-1.896.587-.274 1.084-.705 1.438-1.246.355-.54.552-1.17.57-1.817zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
                    </div>
                    <p className="text-slate-500 mt-0.5">@{account.username}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="mt-6 flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{account.followersCount || "—"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">∞</p>
                    <p className="text-xs text-slate-500 mt-0.5">Posts beschikbaar</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <a href={`https://x.com/${account.username}`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Bekijk op X
                  </a>
                  <button
                    onClick={disconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    {disconnecting ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Ontkoppelen
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TwitterIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-bold text-lg">Geen X-account verbonden</p>
              <p className="text-slate-400 text-sm mt-2 mb-6">Klik hieronder om je account te koppelen via je API-keys.</p>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch("/api/accounts/connect", { method: "POST" });
                    if (res.ok) {
                      await fetchAccount();
                    } else {
                      const err = await res.json();
                      alert("Fout: " + (err.error || "Onbekende fout"));
                    }
                  } catch (e) {
                    alert("Kan niet verbinden. Check je API-keys.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                Verbind X Account
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduler Status */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Scheduler
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              De auto-scheduler draait elke minuut en publiceert tweets op het ingestelde tijdstip.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-400">ACTIEF</span>
            </div>
          </div>

          {/* API Credits Info */}
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
            <h4 className="text-sm font-bold text-blue-900 mb-3">API Credits</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <p>Elke tweet kost <strong>$0.01</strong> aan X API-credits.</p>
              <p>Beheer je credits via het <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" className="underline font-bold">X Developer Dashboard</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
