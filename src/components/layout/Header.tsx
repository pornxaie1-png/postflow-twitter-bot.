// @ts-nocheck
"use client";

import { Bell, Search, User, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "auth_session=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search posts, analytics, or accounts..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <Link href="/create">
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </Link>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}
