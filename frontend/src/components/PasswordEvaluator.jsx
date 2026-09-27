import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Activity, ShieldAlert, Key, Zap, CheckCircle, AlertTriangle, Fingerprint, Network, Hash, Layers } from 'lucide-react';
import zxcvbn from 'zxcvbn';

export default function PasswordEvaluator() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Live Metrics State
  const [liveMetrics, setLiveMetrics] = useState({
    entropy: 0,
    patterns: [],
    diversity: 0
  });

  const hashPasswordSHA1 = async (pw) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  // The debounced side of the analysis (Network Heavy & Custom Heuristics)
  const executeBreachCheck = async (pwd, zResult) => {
    setLoading(true);
    try {
      let aiScore = zResult.score;
      let feedback = [];

      // --- ENTERPRISE-GRADE CUSTOM HEURISTICS ---
      
      // Calculate Diversity
      let divScore = 0;
      if (/[a-z]/.test(pwd)) divScore++;
      if (/[A-Z]/.test(pwd)) divScore++;
      if (/[0-9]/.test(pwd)) divScore++;
      if (/[^a-zA-Z0-9]/.test(pwd)) divScore++;

      // 1. Extreme Length & Diversity Gates
      if (pwd.length < 8) {
         aiScore = Math.min(aiScore, 1);
         feedback.push("Passwords under 8 characters are instantly guessable by modern hardware.");
      } else if (pwd.length < 12) {
         aiScore = Math.min(aiScore, 2);
         feedback.push("Passwords under 12 characters are vulnerable to targeted brute-force attacks.");
      } else if (pwd.length < 14 && aiScore === 4) {
         aiScore = 3;
         feedback.push("Ultimate military-grade security requires a minimum length of 14+ characters.");
      }

      if (divScore < 3 && aiScore > 2) {
         aiScore = Math.min(aiScore, 2);
         feedback.push("Must contain at least 3 character types (Upper, Lower, Number, Symbol) for high security.");
      } else if (divScore < 4 && aiScore === 4) {
         aiScore = 3;
         feedback.push("Ultimate security requires all 4 character types fully mixed.");
      }

      // 2. Repetition & Walk Penalties
      if (/(.)\1{2,}/.test(pwd)) {
         aiScore = Math.min(aiScore, 2);
         feedback.push("Avoid repeating the same character sequentially (e.g., 'aaa' or '111').");
      }
      if (/(123|qwer|asdf|zxcv|password|admin)/i.test(pwd)) {
         aiScore = Math.min(aiScore, 1);
         feedback.push("Contains an extremely common sequence or bad dictionary word (e.g., '123', 'qwer').");
      }

      // 3. Alphabetical / Name Penalties
      if (/^[a-zA-Z]+$/.test(pwd)) {
        aiScore = Math.min(aiScore, 2);
        feedback.push("Letters-only strings are trivial to crack against leaked dictionaries. Inject entropy.");
      }
      if (/^([A-Z][a-z]+){2,}$/.test(pwd)) {
         aiScore = Math.min(aiScore, 1);
         feedback.push("Combining CapitalizedWords is a well-known pattern (CamelCase). Interleave symbols and digits internally.");
      }

      // 4. Predictable Additions (the "Cheating" Penalty)
      if (/^[a-zA-Z]+[!@#$%^&*()_+]?[0-9]{1,4}$/.test(pwd) || /^[0-9]{1,4}[a-zA-Z]+[!@#$%^&*()_+]?$/.test(pwd)) {
         aiScore = Math.min(aiScore, 2);
         feedback.push("Appending numbers/symbols at the ends of words is the most common human habit. Sprinkle them inside the core phrase instead.");
      }
      // ==========================================

      if (zResult.feedback.warning) feedback.push(zResult.feedback.warning);
      feedback = feedback.concat(zResult.feedback.suggestions);

      // Remove duplicate feedback messages
      feedback = Array.from(new Set(feedback));

      if (aiScore < 4 && feedback.length === 0) feedback.push("Add more random words, numbers, or symbols to improve strength.");
      if (aiScore === 4 && feedback.length === 0) feedback.push("This password is highly secure and unpredictable!");

      // API Check
      const sha1Hash = await hashPasswordSHA1(pwd);
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://cerberus-v5b5.onrender.com/api/password/breach-check/${prefix}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      let breachCount = 0;
      let breached = false;
      const match = data.suffixes.find(s => s.hash_suffix === suffix);
      if (match) {
         breached = true;
         breachCount = match.count;
      }

      let finalVerdict = false;
      let userMessage = "";
      
      if (breached) {
        finalVerdict = false;
        userMessage = "🚨 DANGER: This password has been found in known data breaches. Change it immediately!";
      } else if (aiScore < 4) {
        finalVerdict = false;
        userMessage = `⚠️ WARNING: Security Score ${aiScore}/4. This password is too predictable or common. Please use a stronger phrase.`;
      } else {
        finalVerdict = true;
        userMessage = "✅ SAFE: This is a strong, highly secure password that has never been breached.";
      }

      setResult({
        final_verdict: finalVerdict,
        user_message: userMessage,
        strength_analysis: {
           score: aiScore,
           max_score: 4,
           feedback: feedback,
           estimated_guesses_to_crack: zResult.guesses
        },
        breach_check: {
           breached: breached,
           breach_count: breachCount
        }
      });
    } catch (error) {
      console.error("Failed to check password:", error);
      setResult({
          final_verdict: false,
          user_message: "⚠️ Error contacting the API.",
          strength_analysis: { score: 0, max_score: 4, feedback: ["API Connection Failed."], estimated_guesses_to_crack: 0 },
          breach_check: { breached: false, breach_count: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Live Typing Effect
  useEffect(() => {
    if (!password) {
        setResult(null);
        setLiveMetrics({ entropy: 0, patterns: [], diversity: 0 });
        return;
    }

    // 1. Sync Computations (Instant)
    let divScore = 0;
    if (/[a-z]/.test(password)) divScore++;
    if (/[A-Z]/.test(password)) divScore++;
    if (/[0-9]/.test(password)) divScore++;
    if (/[^a-zA-Z0-9]/.test(password)) divScore++;

    const zxcvbnResult = zxcvbn(password);
    
    // Extract unique patterns like 'dictionary', 'spatial', 'repeat'
    const patterns = Array.from(new Set(zxcvbnResult.sequence.map(item => item.pattern)));
    const entropy = Math.round(Math.log2(zxcvbnResult.guesses || 1));

    setLiveMetrics({ entropy, patterns, diversity: divScore });

    // 2. Debounced Fetch (Wait 500ms before hitting API)
    setLoading(true);
    const timer = setTimeout(() => {
        executeBreachCheck(password, zxcvbnResult);
    }, 500);

    return () => clearTimeout(timer);
  }, [password]);

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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Live Strength Evaluator</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium transition-colors duration-300">Instant AI analysis as you type</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                placeholder="Start typing a password..."
                value={password}
                autoComplete="off"
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Dynamic Live Signal Monitor */}
          {password && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 animate-in fade-in duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded p-2.5 flex flex-col items-center justify-center text-center">
                <Fingerprint className="h-4 w-4 text-purple-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">Entropy</span>
                <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{liveMetrics.entropy} bits</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded p-2.5 flex flex-col items-center justify-center text-center">
                <Layers className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">Diversity</span>
                <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{liveMetrics.diversity}/4</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded p-2.5 flex flex-col items-center justify-center text-center">
                 <Network className="h-4 w-4 text-emerald-500 mb-1" />
                 <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">Pattern Flags</span>
                 <span className="text-xs font-bold text-gray-900 dark:text-white uppercase mt-0.5 truncate w-full px-1" title={liveMetrics.patterns.join(', ')}>
                     {liveMetrics.patterns.length > 0 ? liveMetrics.patterns[0] : 'None'}
                 </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded p-2.5 flex flex-col items-center justify-center text-center">
                 {loading ? (
                    <Activity className="h-4 w-4 text-cyan-500 mb-1 animate-spin" />
                 ) : (
                    <Hash className={`h-4 w-4 mb-1 ${result?.breach_check?.breached ? 'text-rose-500' : 'text-gray-500'}`} />
                 )}
                 <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">Breaches</span>
                 <span className={`text-sm font-black font-mono ${result?.breach_check?.breached ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>
                    {loading ? '...' : result?.breach_check?.breach_count?.toLocaleString() || 0}
                 </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      <div className="p-6 bg-gray-50 dark:bg-slate-950/50 flex-grow transition-colors duration-300">
        {!result && !loading && !password && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 space-y-3 py-10 transition-colors">
            <Activity className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">Awaiting password input for analysis...</p>
          </div>
        )}

        {result && password && (
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
