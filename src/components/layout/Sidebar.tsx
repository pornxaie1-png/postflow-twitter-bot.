"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Settings,
  Zap,
  Target
} from "lucide-react";
import { TwitterIcon } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Plan Campagne", href: "/strategy", icon: Target },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Nieuwe Tweet", href: "/create", icon: PlusCircle },
  { name: "X Account", href: "/accounts", icon: TwitterIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];


export default function Sidebar() {
  const pathname = usePathname();
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        const count = data.filter((p: any) => p.status === "scheduled").length;
        setScheduledCount(count);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className="w-64 border-r border-slate-200 h-screen bg-white flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Zap className="text-white w-5 h-5 fill-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">PostFlow</span>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">X</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">X Bot</p>
          <p className="text-sm text-slate-900 mb-3">
            {scheduledCount !== null 
              ? scheduledCount > 0 
                ? `${scheduledCount} tweets ingepland.`
                : "Geen tweets ingepland."
              : "Laden..."}
          </p>
          <a href="/create" className="block w-full py-2 bg-slate-900 text-white text-center rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Nieuwe Tweet
          </a>
        </div>
      </div>
    </aside>
  );
}
