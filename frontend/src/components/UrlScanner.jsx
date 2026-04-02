import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Activity, Database, AlertTriangle, CheckCircle, DatabaseZap } from 'lucide-react';

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
      const response = await fetch('http://localhost:8000/api/url/scan', {
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
      // Fallback for UI testing if backend is unreachable
      setResult({
          url: url,
          final_verdict: false,
          user_message: "⚠️ Error contacting the Cerberus API.",
          database_check: { is_safe: false, note: "API Connection Failed." },
          ai_analysis: { risk_score: 100, risk_level: "High", features_analyzed: {} }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRiskBar = (score) => {
    let colorClass = "bg-emerald-500 shadow-emerald-500/50";
    if (score >= 30 && score <= 49) colorClass = "bg-amber-500 shadow-amber-500/50";
    if (score >= 50) colorClass = "bg-rose-500 shadow-rose-500/50";

    return (
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
        <div className={`${colorClass} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${score}%` }}></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 p-6 flex items-center space-x-3 transition-colors duration-300">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 rounded-lg">
          <Search size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">URL Threat Scanner</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium transition-colors duration-300">Analyze links for phishing and malicious patterns</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <form onSubmit={handleScan} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="url-input" className="sr-only">URL to scan</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldAlert className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                id="url-input"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-500 sm:text-sm transition-colors shadow-sm dark:shadow-slate-900/20"
                placeholder="https://example.com/"
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
            ) : "Scan URL"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="p-6 bg-gray-50 dark:bg-slate-950/50 flex-grow transition-colors duration-300">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 space-y-3 py-10 transition-colors">
            <Activity className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">Awaiting URL input for analysis...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
            {/* Final Verdict Banner */}
            <div className={`w-full p-4 rounded-lg flex items-start space-x-3 shadow-md border transition-colors ${
              result.final_verdict 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
            }`}>
              <div className="mt-0.5 flex-shrink-0">
                {result.final_verdict ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-500" />}
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide">
                  {result.final_verdict ? "Scan Completed" : "Critical Threat Detected"}
                </h3>
                <p className={`mt-1 text-sm font-semibold ${result.final_verdict ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                  {result.user_message}
                </p>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors duration-300">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">AI Component Analysis</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  result.ai_analysis.risk_level === 'Safe' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' : 
                  result.ai_analysis.risk_level === 'High' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400' : 
                  'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400'
                }`}>
                  {result.ai_analysis.risk_level} RISK
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Risk Score</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{result.ai_analysis.risk_score} <span className="text-gray-400 dark:text-slate-500 font-medium">/ 100</span></span>
                  </div>
                  {renderRiskBar(result.ai_analysis.risk_score)}
                </div>

                <div className="mt-4 border border-gray-100 dark:border-slate-700 rounded-md overflow-hidden transition-colors">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Feature Used</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {Object.entries(result.ai_analysis.features_analyzed).map(([key, val]) => (
                        <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 font-medium font-mono text-xs">{key}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-gray-900 dark:text-white font-bold">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Database Check Section */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors duration-300">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-2">
                  <DatabaseZap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Database Verification</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${
                  result.database_check.is_safe 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}>
                  {result.database_check.is_safe ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Note:</span> {result.database_check.note}
                </p>
                {result.database_check.threat_type && (
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="font-semibold text-gray-900 dark:text-white">Threat Type:</span> {result.database_check.threat_type}
                  </p>
                )}
                {result.database_check.details && (
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="font-semibold text-gray-900 dark:text-white">Details:</span> {result.database_check.details}
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
