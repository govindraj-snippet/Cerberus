import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Activity, Database, AlertTriangle, CheckCircle, DatabaseZap, BrainCircuit, Cpu } from 'lucide-react';

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://cerberus-v5b5.onrender.com/api/url/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to scan URL:", error);
      setResult({
          url: url,
          final_verdict: false,
          user_message: "⚠️ Error contacting the Cerberus Intelligence API.",
          database_check: { is_safe: false, note: "API Connection Failed." },
          ai_analysis: { 
            risk_score: 100, 
            risk_level: "High", 
            features_analyzed: {
                "length": url.length,
                "status": "Incomplete Scan"
            } 
          }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRiskBar = (score) => {
    let colorClass = "bg-emerald-500 shadow-emerald-500/50";
    if (score >= 40 && score <= 74) colorClass = "bg-amber-500 shadow-amber-500/50";
    if (score >= 75) colorClass = "bg-rose-500 shadow-rose-500/50";

    return (
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
        <div className={`${colorClass} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${score}%` }}></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 p-6 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 rounded-lg">
                <Search size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">URL Threat Intelligence</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium transition-colors duration-300">Powered by Custom Trained RandomForest Model</p>
            </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-slate-400">
            <Cpu size={12} className="animate-pulse" />
            <span>Neural Engine Active</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <form onSubmit={handleScan} className="flex flex-col space-y-4">
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldAlert className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                id="url-input"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-500 sm:text-sm transition-colors shadow-sm dark:shadow-slate-900/20"
                placeholder="https://example.com/login-verify-account"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md shadow-cyan-500/20 dark:shadow-cyan-900/20 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "RUN MULTI-LAYER ANALYTICS"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="p-6 bg-gray-50 dark:bg-slate-950/50 flex-grow transition-colors duration-300 overflow-y-auto">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 space-y-3 py-10 transition-colors">
            <Activity className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">Internal Brain Warm; Awaiting target URL...</p>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
            {/* Final Verdict Banner */}
            <div className={`w-full p-6 rounded-xl flex items-start space-x-4 shadow-xl border-l-[6px] transition-colors ${
              result.final_verdict 
                ? 'bg-white dark:bg-slate-800 border-emerald-500 dark:border-emerald-600 text-slate-800 dark:text-slate-100 shadow-emerald-500/5' 
                : 'bg-white dark:bg-slate-800 border-rose-500 dark:border-rose-600 text-slate-800 dark:text-slate-100 shadow-rose-500/5'
            }`}>
              <div className="mt-1 flex-shrink-0">
                {result.final_verdict ? <ShieldCheck className="h-8 w-8 text-emerald-500" /> : <ShieldAlert className="h-8 w-8 text-rose-500" />}
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight italic">
                  Systems Verdict: {result.final_verdict ? "CLEARED" : "BLOCK ADVISED"}
                </h3>
                <p className="mt-1 text-sm font-medium leading-relaxed opacity-80">
                  {result.user_message}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center space-x-1"><Database size={12}/> <span>Static DB: {result.database_check.is_safe ? "CLEAN" : "FLAGGED"}</span></span>
                    <span className="flex items-center space-x-1"><BrainCircuit size={12}/> <span>AI Core: {result.ai_analysis.risk_level} RISK</span></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Analysis Section */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-cyan-500/5">
                    <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between transition-colors">
                        <div className="flex items-center space-x-2">
                        <BrainCircuit className="h-5 w-5 text-cyan-500" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Zero-Day AI Prediction</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        result.ai_analysis.risk_level === 'Safe' ? 'bg-emerald-500/10 text-emerald-500' : 
                        result.ai_analysis.risk_level === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                        'bg-amber-500/10 text-amber-500'
                        }`}>
                        {result.ai_analysis.risk_level}
                        </span>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Neural Convergence Score</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{result.ai_analysis.risk_score}%</span>
                        </div>
                        {renderRiskBar(result.ai_analysis.risk_score)}
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 italic leading-tight uppercase font-medium">
                            Model analyzed 15 lexical features from the Kaggle Phishing Dataset to generate this probability.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {Object.entries(result.ai_analysis.features_analyzed).map(([key, val]) => (
                                <div key={key} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{key === 'phish_hints' ? 'Keyword Hints' : key}</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        {key === 'phish_hints' && val > 0 ? (
                                            <span className="text-rose-500 flex items-center gap-1">
                                                {val} <AlertTriangle size={10} />
                                            </span>
                                        ) : val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Database Check Section */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-cyan-500/5 flex flex-col">
                    <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between transition-colors">
                        <div className="flex items-center space-x-2">
                        <DatabaseZap className="h-5 w-5 text-indigo-500" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Global Threat Database</h4>
                        </div>
                        <div className={`h-2.5 w-2.5 rounded-full ${result.database_check.is_safe ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                    </div>
                    <div className="p-5 flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Security Vendors</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white">
                                    {result.database_check.stats ? 
                                        (result.database_check.stats.harmless + result.database_check.stats.malicious + result.database_check.stats.suspicious) 
                                        : '94'}
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Malicious Flags</span>
                                <span className={`text-lg font-black ${result.database_check.is_safe ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {result.database_check.stats ? result.database_check.stats.malicious : 0}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                                <span className="font-bold text-slate-900 dark:text-white uppercase mr-1">Status:</span>
                                {result.database_check.note}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

