"use client";

import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video, Clock, MoreVertical } from "lucide-react";
import { InstagramIcon, TwitterIcon, LinkedinIcon } from "@/components/icons/SocialIcons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  accounts: {
    account: {
      platform: string;
    };
  }[];
}

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500",
  twitter: "bg-slate-900",
  linkedin: "bg-blue-600",
  tiktok: "bg-cyan-400",
};

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case "instagram": return <InstagramIcon className={className} />;
    case "twitter": return <TwitterIcon className={className} />;
    case "linkedin": return <LinkedinIcon className={className} />;
    case "tiktok": return <Video className={className} />;
    default: return null;
  }
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{format(currentMonth, "MMMM yyyy")}</h1>
        <p className="text-slate-500 mt-1">Review and manage your publishing schedule.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              view === "month" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >Month</button>
          <button
            onClick={() => setView("week")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              view === "week" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >Week</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50">
            Today
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-3">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dayPosts = posts.filter(p => {
          const postDate = p.scheduledAt || p.publishedAt;
          return postDate && isSameDay(new Date(postDate), cloneDay);
        });

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[140px] p-2 border-r border-b border-slate-200 transition-all group overflow-hidden cursor-pointer",
              !isSameMonth(day, monthStart) ? "bg-slate-50" : "bg-white",
              isSameDay(day, new Date()) ? "bg-blue-50" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={cn(
                "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                isSameDay(day, new Date()) ? "bg-slate-900 text-white" : "text-slate-400 group-hover:text-slate-900"
              )}>
                {formattedDate}
              </span>
              {dayPosts.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400">{dayPosts.length} posts</span>
              )}
            </div>
            <div className="space-y-1.5">
              {dayPosts.map(post => (
                post.accounts.map(acc => (
                  <motion.div
                    key={`${post.id}-${acc.account.platform}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:brightness-95 transition-all shadow-sm text-white",
                      platformColors[acc.account.platform] || "bg-slate-400"
                    )}
                  >
                    <PlatformIcon platform={acc.account.platform} className="w-3 h-3" />
                    <span className="text-[10px] font-bold truncate">
                      {format(new Date(post.scheduledAt || post.publishedAt || ""), "HH:mm")}
                    </span>
                  </motion.div>
                ))
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-t border-l border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50">{rows}</div>;
  };

  const selectedDayPosts = posts.filter(p => {
    const postDate = p.scheduledAt || p.publishedAt;
    return postDate && isSameDay(new Date(postDate), selectedDate);
  });
  const upcomingPosts = posts
    .filter(p => p.scheduledAt && new Date(p.scheduledAt) >= new Date())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {renderHeader()}
      <div className="bg-white rounded-3xl p-1 shadow-xl shadow-slate-200/50 border border-slate-200">
        {renderDays()}
        {renderCells()}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Insights */}
        <div className="lg:col-span-2 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Post Insights</h2>
            <p className="text-slate-400 text-sm mb-8">Detailed view for {format(selectedDate, "MMMM d, yyyy")}</p>

            <div className="space-y-4">
              {selectedDayPosts.length === 0 && (
                <p className="text-slate-500 italic">No posts scheduled for this day. Click a date on the calendar to inspect it.</p>
              )}
              {selectedDayPosts.map(post => (
                <div key={post.id} className="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex -space-x-2">
                    {post.accounts.map(acc => (
                      <div key={acc.account.platform} className={cn("p-3 rounded-xl border-2 border-slate-900", platformColors[acc.account.platform] || "bg-slate-400")}>
                        <PlatformIcon platform={acc.account.platform} className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-1 line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 
                        {format(new Date(post.scheduledAt || post.publishedAt || ""), "HH:mm")}
                      </span>
                      <span className="capitalize">{post.status}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Upcoming Queue */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Upcoming Queue</h2>
          <div className="space-y-4">
            {upcomingPosts.map((post, index) => (
              <div key={post.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={cn("w-1.5 h-1.5 rounded-full", index === 0 ? "bg-slate-900" : "bg-slate-200")} />
                  {index < upcomingPosts.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {format(new Date(post.scheduledAt || ""), "MMM d")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-1">
                      {post.accounts.map(acc => (
                        <div key={acc.account.platform} className={cn("p-1 rounded-md", platformColors[acc.account.platform])}>
                          <PlatformIcon platform={acc.account.platform} className="w-2.5 h-2.5 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-4 bg-slate-50 rounded-2xl text-slate-900 text-sm font-bold hover:bg-slate-100 transition-all">
            View Full Queue
          </button>
        </div>
      </div>
    </div>
  );
}
