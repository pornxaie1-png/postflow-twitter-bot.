"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Target, 
  Layers, 
  Plus, 
  TrendingUp, 
  ArrowRight,
  Clock,
  MoreHorizontal,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  _count?: {
    posts: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Target className="w-3 h-3" />
            Strategische Planning
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Plan Campagne</h1>
          <p className="text-slate-500 max-w-md">Beheer je groei-strategieën en groepeer je content voor maximale impact.</p>
        </div>
        
        <button className="px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
          <Plus className="w-5 h-5" />
          Nieuwe Campagne
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <TrendingUp className="w-6 h-6 text-blue-600 mb-4" />
          <p className="text-slate-500 text-sm font-semibold mb-1">Actieve Campagnes</p>
          <p className="text-3xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <Layers className="w-6 h-6 text-purple-600 mb-4" />
          <p className="text-slate-500 text-sm font-semibold mb-1">Totaal Ingepland</p>
          <p className="text-3xl font-bold">
            {campaigns.reduce((acc, curr) => acc + (curr._count?.posts || 0), 0)} Tweets
          </p>
        </div>
        <div className="p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
          <div className="relative z-10">
            <Zap className="w-6 h-6 text-yellow-400 mb-4" />
            <p className="text-slate-400 text-sm font-semibold mb-1">Conversie Ratio</p>
            <p className="text-3xl font-bold">2.4%</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors" />
        </div>
      </div>

      {/* Campaigns List */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Actieve Strategieën
          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{campaigns.length}</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {campaign.status}
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-900">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{campaign.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-8">{campaign.description || 'Geen beschrijving opgegeven.'}</p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                          {j}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {campaign._count?.posts || 0} Tweets ingepland
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-20 bg-slate-50 rounded-[3rem] text-center space-y-4 border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Nog geen campagnes</h3>
              <p className="text-sm text-slate-500">Begin met het plannen van je eerste campagne voor betere resultaten.</p>
            </div>
            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:border-slate-900 transition-all">
              Maak je eerste campagne
            </button>
          </div>
        )}
      </section>

      {/* Pro Tip */}
      <div className="bg-blue-50 rounded-[2rem] p-8 flex items-start gap-6 border border-blue-100">
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900">Pro Tip: Gebruik Campagnes voor Groei</h4>
          <p className="text-sm text-blue-700 leading-relaxed max-w-2xl">
            Door tweets te groeperen in campagnes kun je beter analyseren welke "vibe" het beste werkt voor je account. 
            Probeer een campagne van 7 dagen met consistente hashtags voor het beste resultaat op X.
          </p>
        </div>
      </div>
    </div>
  );
}
