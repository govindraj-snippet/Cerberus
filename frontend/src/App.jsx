import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import UrlScanner from './components/UrlScanner';
import PasswordEvaluator from './components/PasswordEvaluator';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    // Check local storage or default to dark
    const storedTheme = localStorage.getItem('theme');
    // Our plan defaults to dark mode unless strictly set to light
    const shouldBeDark = storedTheme === 'light' ? false : true;
    
    setIsDarkMode(shouldBeDark);
  }, []);

  // Update DOM and local storage when state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center">
      {/* Header section */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 py-4 px-6 md:px-10 sticky top-0 z-10 backdrop-blur-sm dark:bg-slate-900/90 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-cyan-600 border border-slate-700 dark:border-cyan-500 shadow-sm shadow-cyan-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              </svg>
            </div>
            <div>
               <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase transition-colors">Cerberus Core</h1>
               <div className="text-xs font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase hidden sm:block">Security Analysis Platform</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Split Screen Layout */}
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-8 items-start h-full">
          {/* Left Column: URL Threat Scanner */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-300">
            <UrlScanner />
          </section>

          {/* Right Column: Password Strength Evaluator */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-300">
            <PasswordEvaluator />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
