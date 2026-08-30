import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Activity, ShieldCheck, Database, CheckCircle2, TrendingUp, Layers, Cpu, Sparkles, Zap, Award } from 'lucide-react';
import { documentApi } from '../../services/api.js';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    documentApi.getStats()
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categoryBreakdown = stats?.categories ? Object.entries(stats.categories) : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
            System Analytics
          </span>
          <span className="text-slate-400 text-xs font-mono">• RAG Vector Index & Retrieval Health</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Knowledge Base & Engine Analytics
        </h1>
      </div>

      {/* Health Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-md hover:shadow-glow-blue transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Vector Store Health
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              Operational
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Total Indexed Chunks</span>
              <span className="font-mono text-white font-bold">{stats?.totalChunks || 0}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Embedding Dimension</span>
              <span className="font-mono text-sky-400 font-bold">768 Float32</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-400">Distance Metric</span>
              <span className="font-mono text-indigo-300 font-bold">Cosine Similarity (&lt;=&gt;)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-md glass-card-purple hover:shadow-glow-purple transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Grounding & Safety
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Active Guardrails
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Threshold Filtering</span>
              <span className="font-mono text-white font-bold">0.25 Cosine Score</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Anti-Hallucination Policy</span>
              <span className="font-mono text-emerald-400 font-bold">Enforced (Prompt Guard)</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-400">Out-of-Scope Strategy</span>
              <span className="font-mono text-amber-300 font-bold">Deterministic Fallback</span>
            </div>
          </div>
        </div>

        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-md glass-card-emerald hover:shadow-glow-emerald transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Retrieval Latency
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              Optimal
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Top-K Passages</span>
              <span className="font-mono text-white font-bold">K = 4 Chunks</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-white/[0.06]">
              <span className="text-slate-400">Chunk Size / Overlap</span>
              <span className="font-mono text-sky-400 font-bold">800 / 100 chars</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-400">Average Retrieval Latency</span>
              <span className="font-mono text-emerald-400 font-bold">&lt; 15 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-panel-elevated p-6 sm:p-7 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-lg">
        <h2 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 tracking-tight">
          <PieChart className="w-5 h-5 text-sky-400" />
          Document Distribution by Category
        </h2>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No categories indexed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} className="p-5 rounded-2xl glass-card border-white/[0.08] hover:border-sky-500/40 space-y-2 transition-all hover:scale-[1.02]">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{cat}</span>
                <p className="text-2xl font-extrabold font-display text-white">
                  {count} <span className="text-xs text-slate-400 font-normal">documents</span>
                </p>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05] mt-3">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#38bdf8]"
                    style={{ width: `${Math.min(100, (count / (stats?.totalDocuments || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

