// @ts-nocheck
"use client";


import { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Smile,
  Calendar,
  Clock,
  Upload,
  Eye,
  CheckCircle2,
  Trash2,
  Zap,
  AlertCircle,
  Send,
  AtSign,
  Hash,
  Sparkles,
  Copy,
  ChevronDown,
  Target
} from "lucide-react";
import { TwitterIcon } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";



const NICHE_OPTIONS = [
  "Lingerie / Boudoir", "Cosplay", "GFE (Girlfriend Experience)", "Fetish",
  "Solo", "Couples", "Alt / Goth", "Fitness", "Curves / Thick", "Petite",
  "Custom Content", "PPV / Exclusives", "General",
];

interface AIResult {
  enhanced: string;
  hashtags: string[];
  reasoning: string;
  alternatives: string[];
}

const CHAR_LIMIT = 280;

interface ConnectedAccount { platform: string; username: string; avatarUrl?: string; displayName?: string; }

export default function CreatePostPage() {
  const router = useRouter();
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Enhancer state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState("General");

  // Campaign state
  const [strategy, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const handleEnhance = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: content, niche: selectedNiche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResult(data);
    } catch (err: any) {
      setFeedback({ type: "error", msg: "AI Error: " + err.message });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAI = (text: string, hashtags?: string[]) => {
    const tags = hashtags ? "\n\n" + hashtags.join(" ") : "";
    setContent(text + tags);
    setShowAI(false);
  };

  const twitterAccount = connectedAccounts.find(a => a.platform === "twitter");

  useEffect(() => {
    fetch("/api/accounts").then(r => r.json()).then(setConnectedAccounts);
    fetch("/api/strategy").then(r => r.json()).then(setCampaigns);
  }, []);

  // We need a separate state for the preview URL vs the server path
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMedia(null); // will be set after upload
    }
  };

  const handleSubmit = async (publishNow: boolean) => {
    if (!content.trim()) { setFeedback({ type: "error", msg: "Schrijf eerst iets." }); return; }
    if (!twitterAccount) { setFeedback({ type: "error", msg: "Verbind eerst je X-account." }); return; }

    setIsSubmitting(true);
    setFeedback(null);

    const scheduledAt = !publishNow && scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      : null;

    try {
      // Step 1: Upload media file to server if present
      let uploadedMediaPath: string | null = null;
      if (mediaFile) {
        const formData = new FormData();
        formData.append("file", mediaFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        uploadedMediaPath = uploadData.url; // e.g. "/uploads/abc123.jpg"
      }

      // Step 2: Create post with the file path
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          platforms: ["twitter"], 
          scheduledAt,
          mediaPath: uploadedMediaPath,
          campaignId: selectedCampaign || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Er ging iets mis");

      setFeedback({
        type: "success",
        msg: scheduledAt
          ? `Tweet ingepland voor ${new Date(scheduledAt).toLocaleString()}!`
          : "Tweet geplaatst! 🚀",
      });
      setContent("");
      setMedia(null);
      setTimeout(() => router.push("/calendar"), 1500);
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const charPercent = Math.min((charCount / CHAR_LIMIT) * 100, 100);
  const isOverLimit = charCount > CHAR_LIMIT;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* LEFT: COMPOSER */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nieuwe Tweet</h1>
            <p className="text-slate-500 mt-2">Schrijf, plan en publiceer rechtstreeks naar X.</p>
          </header>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold",
                  feedback.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                )}
              >
                {feedback.type === "success"
                  ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                  : <AlertCircle className="w-5 h-5 shrink-0" />}
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No account warning */}
          {!twitterAccount && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Geen X-account verbonden</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  <a href="/accounts" className="underline font-bold">Verbind je account</a> om te kunnen posten.
                </p>
              </div>
            </div>
          )}

          {/* Connected account badge */}
          {twitterAccount && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="relative">
                {twitterAccount.avatarUrl ? (
                  <img src={twitterAccount.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                    <TwitterIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">@{twitterAccount.username}</p>
                <p className="text-xs text-green-600 font-semibold">Verbonden · Klaar om te posten</p>
              </div>
            </div>
          )}

          {/* Campaign Selector */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Campagne Strategy</h2>
            <div className="bg-white rounded-[1.5rem] p-4 border border-slate-100 flex items-center gap-4 focus-within:border-slate-900 transition-all">
              <div className="p-2 bg-slate-50 rounded-xl">
                <Target className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <select 
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="">Geen Campagne (Standaard)</option>
                  {strategy.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Link href="/strategy" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider px-2 py-1 bg-slate-50 rounded-md">
                Manage
              </Link>
            </div>
          </section>


          {/* Content */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tweet</h2>
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="12" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                    <circle
                      cx="14" cy="14" r="12" fill="none"
                      stroke={isOverLimit ? "#ef4444" : charPercent > 80 ? "#f59e0b" : "#0f172a"}
                      strokeWidth="2.5"
                      strokeDasharray={`${charPercent * 0.754} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  isOverLimit ? "text-red-500" : charPercent > 80 ? "text-amber-500" : "text-slate-400"
                )}>
                  {CHAR_LIMIT - charCount}
                </span>
              </div>
            </div>
            <div className="relative border-2 border-slate-100 rounded-2xl focus-within:border-slate-900 transition-all overflow-hidden">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Wat wil je delen?"
                className="w-full h-48 p-5 text-lg bg-slate-50/30 focus:bg-white focus:outline-none resize-none transition-colors"
              />
              <div className="flex items-center gap-2 p-3 bg-white border-t border-slate-100">
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Smile className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Hash className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><AtSign className="w-5 h-5" /></button>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Media</h2>
            {mediaPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 group">
                <img src={mediaPreview} alt="Upload preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => { setMediaPreview(null); setMediaFile(null); setMedia(null); }} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-900 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Klik om media te uploaden</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, MP4</p>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
              </div>
            )}
          </section>

          {/* Schedule */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Inplannen (optioneel)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:border-slate-900 outline-none transition-all" />
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:border-slate-900 outline-none transition-all" />
              </div>
            </div>
          </section>

          <footer className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !content || !twitterAccount || isOverLimit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
              Tweet Nu
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !content || !twitterAccount || isOverLimit || (!scheduleDate || !scheduleTime)}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Inplannen</>
              )}
            </button>
          </footer>
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-[420px] bg-slate-50 p-8 flex flex-col overflow-y-auto">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-8">
          <Eye className="w-5 h-5" />
          Live Preview
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          <div className="p-5 space-y-3">
            <div className="flex gap-3">
              <div className="shrink-0">
                {twitterAccount?.avatarUrl ? (
                  <img src={twitterAccount.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[15px] font-bold truncate">{twitterAccount?.displayName || "LunaNoir"}</p>
                  <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.141.27.587.7 1.086 1.24 1.44s1.167.551 1.813.568c.647-.017 1.277-.213 1.818-.567s.972-.854 1.245-1.44c.604.223 1.26.27 1.897.14.634-.131 1.217-.437 1.687-.883.445-.47.75-1.054.882-1.69.13-.633.083-1.29-.14-1.896.587-.274 1.084-.705 1.438-1.246.355-.54.552-1.17.57-1.817zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
                </div>
                <p className="text-sm text-slate-500">@{twitterAccount?.username || "account"} · nu</p>
                <p className="text-[15px] mt-2 leading-relaxed whitespace-pre-wrap">
                  {content || <span className="text-slate-400 italic">Je tweet verschijnt hier…</span>}
                </p>
              </div>
            </div>
            {mediaPreview && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 ml-[60px]">
                <img src={mediaPreview} className="w-full object-cover" alt="" />
              </div>
            )}
            {/* Fake engagement bar */}
            <div className="flex items-center justify-between ml-[60px] pt-2 text-slate-400">
              <button className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-green-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 p-5 bg-white/80 border border-slate-100 rounded-2xl">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
              <Zap className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Tweet Nu</strong> publiceert direct op X. <strong>Inplannen</strong> slaat hem op en de scheduler publiceert automatisch op het ingestelde tijdstip.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
