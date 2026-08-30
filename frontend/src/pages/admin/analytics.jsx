import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Activity, ShieldCheck, Database, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
            System Analytics
          </span>
          <span className="text-slate-500 text-xs">• RAG Knowledge Index Health</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Knowledge Base & Performance Analytics
        </h1>
      </div>

      {/* Health Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vector Store Health</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Indexed Chunks</span>
              <span className="font-mono text-white font-bold">{stats?.totalChunks || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Embedding Dimension</span>
              <span className="font-mono text-sky-400 font-bold">768 Float32</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Distance Metric</span>
              <span className="font-mono text-indigo-300">Cosine Similarity (&lt;=&gt;)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grounding & Safety</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Guardrails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Threshold Filtering</span>
              <span className="font-mono text-white font-bold">0.25 Cosine Score</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Anti-Hallucination Policy</span>
              <span className="font-mono text-emerald-400 font-bold">Enforced (System Prompt)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Out-of-Scope Strategy</span>
              <span className="font-mono text-amber-300">Deterministic Fallback</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Retrieval Performance</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Optimal
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Top-K Passages</span>
              <span className="font-mono text-white font-bold">K = 4 Chunks</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Chunk Size / Overlap</span>
              <span className="font-mono text-sky-400 font-bold">800 / 100 chars</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Average Retrieval Latency</span>
              <span className="font-mono text-emerald-400 font-bold">&lt; 15 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-sky-400" />
          Document Distribution by Category
        </h2>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No categories indexed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">{cat}</span>
                <p className="text-2xl font-bold font-display text-white">{count} <span className="text-xs text-slate-400 font-normal">documents</span></p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-sky-500 h-full rounded-full"
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
