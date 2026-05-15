"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Heart,
  BarChart3, 
  Plus,
  ArrowUpRight,
  Clock,
  MessageCircle,
  Repeat2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { TwitterIcon } from "@/components/icons/SocialIcons";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn, formatNumber } from "@/lib/utils";

interface DashboardClientProps {
  accounts: any[];
  stats: {
    totalFollowers: number;
    scheduledCount: number;
    publishedCount: number;
    totalPosts: number;
  };
  nextPost: any | null;
}

interface TwitterStats {
  profile: {
    name: string;
    username: string;
    avatar: string;
    bio: string;
    createdAt: string;
  };
  metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    like_count: number;
    media_count: number;
  };
  recentTweets: {
    id: string;
    text: string;
    createdAt: string;
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  }[];
}

export default function DashboardClient({ accounts, stats, nextPost }: DashboardClientProps) {
  const [liveData, setLiveData] = useState<TwitterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/twitter/stats");
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLiveData(); }, []);

  const metrics = liveData?.metrics;
  const profile = liveData?.profile;

  const displayStats = [
    { 
      name: "Followers", 
      value: metrics ? formatNumber(metrics.followers_count) : formatNumber(stats.totalFollowers), 
      sub: metrics ? `${formatNumber(metrics.following_count)} following` : "",
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      name: "Tweets", 
      value: metrics ? formatNumber(metrics.tweet_count) : "—", 
      sub: metrics ? `${formatNumber(metrics.media_count)} met media` : "",
      icon: TwitterIcon, 
      color: "text-slate-900", 
      bg: "bg-slate-100" 
    },
    { 
      name: "Likes gegeven", 
      value: metrics ? formatNumber(metrics.like_count) : "—", 
      sub: "Totaal",
      icon: Heart, 
      color: "text-red-500", 
      bg: "bg-red-50" 
    },
    { 
      name: "Ingepland", 
      value: stats.scheduledCount.toString(), 
      sub: `${stats.publishedCount} gepubliceerd`,
      icon: Clock, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header with live profile */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile ? `Welkom, ${profile.name}` : "Dashboard"}
              </h1>
              {profile && (
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.141.27.587.7 1.086 1.24 1.44s1.167.551 1.813.568c.647-.017 1.277-.213 1.818-.567s.972-.854 1.245-1.44c.604.223 1.26.27 1.897.14.634-.131 1.217-.437 1.687-.883.445-.47.75-1.054.882-1.69.13-.633.083-1.29-.14-1.896.587-.274 1.084-.705 1.438-1.246.355-.54.552-1.17.57-1.817zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {profile ? `@${profile.username}` : "Live X-statistieken laden..."}
              {lastRefresh && (
                <span className="text-slate-400 ml-2">· Bijgewerkt {lastRefresh.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLiveData} 
            disabled={loading}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-40"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <Link href="/create">
            <button className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              <Plus className="w-4 h-4" />
              Nieuwe Tweet
            </button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-colors", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              {loading && !liveData ? (
                <div className="w-16 h-5 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                  {stat.sub}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{stat.name}</p>
            {loading && !liveData ? (
              <div className="w-20 h-9 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tweets */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recente Tweets</h2>
            <a href={`https://x.com/${profile?.username || "ItsLunaNoir_"}`} target="_blank" className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
              Bekijk op X <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          
          <div className="space-y-4">
            {loading && !liveData ? (
              [1, 2, 3].map(i => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl animate-pulse h-28" />
              ))
            ) : liveData?.recentTweets && liveData.recentTweets.length > 0 ? (
              liveData.recentTweets.map((tweet, i) => (
                <motion.a
                  key={tweet.id}
                  href={`https://x.com/${profile?.username}/status/${tweet.id}`}
                  target="_blank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="block p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group"
                >
                  <p className="text-sm text-slate-900 leading-relaxed line-clamp-2">{tweet.text}</p>
                  <div className="flex items-center gap-5 mt-3 text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs group-hover:text-red-400 transition-colors">
                      <Heart className="w-3.5 h-3.5" /> {tweet.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs group-hover:text-green-500 transition-colors">
                      <Repeat2 className="w-3.5 h-3.5" /> {tweet.retweets}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs group-hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> {tweet.replies}
                    </span>
                    {tweet.impressions > 0 && (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Eye className="w-3.5 h-3.5" /> {formatNumber(tweet.impressions)}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] font-medium">
                      {new Date(tweet.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.a>
              ))
            ) : (
              <div className="p-12 text-center">
                <TwitterIcon className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Nog geen tweets gevonden.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Profile + Bio */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="h-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
            <div className="px-6 pb-6 -mt-8">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-lg animate-pulse" />
              )}
              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900">{profile?.name || "—"}</h3>
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.141.27.587.7 1.086 1.24 1.44s1.167.551 1.813.568c.647-.017 1.277-.213 1.818-.567s.972-.854 1.245-1.44c.604.223 1.26.27 1.897.14.634-.131 1.217-.437 1.687-.883.445-.47.75-1.054.882-1.69.13-.633.083-1.29-.14-1.896.587-.274 1.084-.705 1.438-1.246.355-.54.552-1.17.57-1.817zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
                </div>
                <p className="text-xs text-slate-500">@{profile?.username || "—"}</p>
                {profile?.bio && (
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{profile.bio}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{metrics ? formatNumber(metrics.followers_count) : "—"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{metrics ? formatNumber(metrics.following_count) : "—"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{metrics ? formatNumber(metrics.tweet_count) : "—"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tweets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduler Status */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduler
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              De auto-scheduler draait elke minuut en publiceert tweets automatisch.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-400">ACTIEF</span>
            </div>
          </div>

          {/* Quick action */}
          <Link href="/create" className="block">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl hover:bg-blue-100 transition-all group">
              <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Snel tweeten
              </h4>
              <p className="text-xs text-blue-700">Klik hier om een nieuwe tweet te schrijven en direct te plaatsen.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <span className={cn("w-2 h-2 rounded-full", nextPost ? "bg-green-400 animate-pulse" : "bg-slate-500")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {nextPost ? `Volgende tweet: ${new Date(nextPost.scheduledAt).toLocaleString("nl-NL")}` : "Geen tweets ingepland"}
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">
            {nextPost ? "Keep the momentum going." : "Plan je volgende tweets."}
          </h2>
          <p className="text-slate-400 max-w-md">
            {nextPost 
              ? "Je hebt een tweet klaarstaan. Consistentie is de sleutel tot groei." 
              : "Consistentie is de sleutel tot groei. Plan je content vooruit."}
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/create">
              <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-95">
                Nieuwe Tweet
              </button>
            </Link>
            <Link href="/calendar">
              <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all">
                Kalender
              </button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
