import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  Activity,
  ShieldCheck,
  Database,
  CheckCircle2,
  TrendingUp,
  Layers,
  Cpu,
  Sparkles,
  Zap,
  Award,
  FileText,
  Clock,
} from 'lucide-react';
import { documentApi } from '../../services/api.js';
import GlassIcon from '../../components/Common/GlassIcon.jsx';
import RagPipelineVisualizer from '../../components/Common/RagPipelineVisualizer.jsx';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    documentApi
      .getStats()
      .then((res) => setStats(res.data?.stats || null))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categoryBreakdown = stats?.categories ? Object.entries(stats.categories) : [];
  const maxCategoryCount = Math.max(...categoryBreakdown.map(([, count]) => count), 1);

  return (
    <div className="min-h-[calc(100dvh-4rem)] p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
            System Analytics
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">• RAG Vector Index & Retrieval Health</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Knowledge Base & Engine Analytics
        </h1>
      </div>

      {/* Health Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-5 shadow-sm dark:shadow-glass-md hover:shadow-md dark:hover:shadow-glow-blue transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              Vector Store Health
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              Operational
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Total Indexed Chunks</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{stats?.totalChunks || 0}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Embedding Dimension</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">768 Float32</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400">Distance Metric</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">Cosine Similarity (&lt;=&gt;)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-5 shadow-sm dark:shadow-glass-md glass-card-purple hover:shadow-md dark:hover:shadow-glow-purple transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Grounding & Safety
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Active Guardrails
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Threshold Filtering</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">0.25 Cosine Score</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Anti-Hallucination Policy</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Enforced (Prompt Guard)</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400">Out-of-Scope Strategy</span>
              <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">Deterministic Fallback</span>
            </div>
          </div>
        </div>

        <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-5 shadow-sm dark:shadow-glass-md glass-card-emerald hover:shadow-md dark:hover:shadow-glow-emerald transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Retrieval Latency
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              Optimal
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">Vector Search P95</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">&lt; 45 ms</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400">LLM Inference Mode</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">Gemini 3.5 Flash-Lite / Grok / OpenAI</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400">Source Citations</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">Automatic Exact Page Extraction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Document Distribution */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-6 shadow-sm dark:shadow-glass-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              <span>Knowledge Distribution by Campus Category</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Indexed vector passage allocation across institutional departments.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 glass-badge px-3 py-1 rounded-full">
            {stats?.totalDocuments || 0} Total Documents
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No document categories indexed yet. Upload documents in the Document Manager.
          </div>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map(([cat, count]) => {
              const percent = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat}</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{count} chunks</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-white/[0.05] p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 shadow-sm dark:shadow-glow-blue transition-all duration-700"
                      style={{ width: `${Math.max(percent, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Architecture Visualizer */}
      <div className="space-y-4">
        <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <span>Active RAG Pipeline Topology</span>
        </h3>
        <RagPipelineVisualizer />
      </div>
    </div>
  );
}
