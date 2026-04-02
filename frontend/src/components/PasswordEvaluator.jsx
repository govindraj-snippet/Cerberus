import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Activity, ShieldAlert, Key, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PasswordEvaluator() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/password/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to check password:", error);
      // Fallback for UI testing if backend is unreachable
      setResult({
          final_verdict: false,
          user_message: "⚠️ Error contacting the Cerberus API.",
          strength_analysis: { score: 0, max_score: 4, feedback: ["API Connection Failed."], estimated_guesses_to_crack: 0 },
          breach_check: { breached: false, breach_count: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStrengthMeter = (score, maxScore) => {
    const segments = [];
    for (let i = 1; i <= maxScore; i++) {
        let colorClass = "bg-gray-200 dark:bg-slate-700";
        if (i <= score) {
            if (score <= 1) colorClass = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
            else if (score <= 2) colorClass = "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
            else if (score <= 3) colorClass = "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]";
            else colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        }
        segments.push(
            <div key={i} className={`h-2.5 flex-1 rounded-sm ${colorClass} transition-all duration-500`}></div>
        );
    }
    return <div className="flex space-x-1.5 mt-2">{segments}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 p-6 flex items-center space-x-3 transition-colors duration-300">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 rounded-lg">
          <Key size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Password Strength Evaluator</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium transition-colors duration-300">Test complexity and check historic data breaches</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <form onSubmit={handleCheck} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="password-input" className="sr-only">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password-input"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-500 sm:text-sm font-mono tracking-wider transition-colors shadow-sm dark:shadow-slate-900/20"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md shadow-cyan-500/20 dark:shadow-cyan-900/20 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Check Password"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="p-6 bg-gray-50 dark:bg-slate-950/50 flex-grow transition-colors duration-300">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 space-y-3 py-10 transition-colors">
            <Activity className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">Awaiting password input for analysis...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
            {/* Final Verdict Banner */}
            <div className={`w-full p-4 rounded-lg flex items-start space-x-3 shadow-md border transition-colors ${
                result.breach_check.breached ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300' : 
                result.final_verdict ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 
                'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
            }`}>
              <div className="mt-0.5 flex-shrink-0">
                {result.breach_check.breached ? <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-500" /> : 
                 result.final_verdict ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> : 
                 <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />}
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide">
                  {result.breach_check.breached ? "Critical Vulnerability" : 
                   result.final_verdict ? "Secure Password" : "Improvement Needed"}
                </h3>
                <p className={`mt-1 text-sm font-semibold ${
                    result.breach_check.breached ? 'text-rose-800 dark:text-rose-200' : 
                    result.final_verdict ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
                }`}>
                  {result.user_message}
                </p>
              </div>
            </div>

            {/* Strength Analysis Section */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm transition-colors duration-300">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex items-center space-x-2 transition-colors">
                  <Zap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Strength Analysis</h4>
                </div>
                <div className="p-4 space-y-5">
                    {/* Meter */}
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Complexity Score</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white transition-colors">{result.strength_analysis.score} <span className="text-gray-400 dark:text-slate-500 font-medium text-sm">/ {result.strength_analysis.max_score}</span></span>
                        </div>
                        {renderStrengthMeter(result.strength_analysis.score, result.strength_analysis.max_score)}
                    </div>

                    {/* Guesses */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-md p-3 flex justify-between items-center transition-colors">
                         <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Est. Guesses to Crack</span>
                         <span className="text-base font-bold font-mono text-gray-900 dark:text-cyan-300 transition-colors">
                             {result.strength_analysis.estimated_guesses_to_crack.toLocaleString()}
                         </span>
                    </div>

                    {/* Feedback */}
                    {result.strength_analysis.feedback && result.strength_analysis.feedback.length > 0 && (
                         <div>
                             <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Feedback</h5>
                             <ul className="space-y-1.5">
                                 {result.strength_analysis.feedback.map((item, idx) => (
                                     <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-slate-300 transition-colors">
                                         <span className="text-cyan-500 dark:text-cyan-400 mr-2 font-bold">•</span>
                                         {item}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    )}
                </div>
            </div>

            {/* Breach Check Section */}
            <div className={`rounded-lg overflow-hidden shadow-sm transition-all duration-300 ${
                result.breach_check.breached ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-500 dark:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
                  result.breach_check.breached ? 'border-rose-200 dark:border-rose-800/50 bg-rose-100 dark:bg-rose-900/40' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80'
              }`}>
                <div className="flex items-center space-x-2">
                  <ShieldAlert className={`h-5 w-5 ${result.breach_check.breached ? 'text-rose-700 dark:text-rose-400' : 'text-gray-500 dark:text-slate-400'}`} />
                  <h4 className={`text-sm font-bold ${result.breach_check.breached ? 'text-rose-900 dark:text-rose-100' : 'text-gray-900 dark:text-white'}`}>Database Breach Verify</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-widest border ${
                  result.breach_check.breached ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-700 dark:border-rose-400 shadow-sm animate-pulse' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }`}>
                  {result.breach_check.breached ? "HACKED" : "Safe"}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                   <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${result.breach_check.breached ? 'text-rose-700 dark:text-rose-400' : 'text-gray-500 dark:text-slate-400'}`}>
                       Times Found in Breaches
                   </p>
                   <p className={`text-3xl font-black ${result.breach_check.breached ? 'text-rose-700 dark:text-rose-400 font-mono tracking-tighter' : 'text-gray-900 dark:text-white'}`}>
                       {result.breach_check.breach_count.toLocaleString()}
                   </p>
                </div>
                {result.breach_check.breached && (
                     <div className="hidden sm:block text-right text-xs font-semibold text-rose-600 dark:text-rose-400 opacity-90 max-w-[150px] leading-tight">
                         This password has been exposed in known data leaks. Do not use it.
                     </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
