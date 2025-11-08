"use client";

import { useCallback } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden
                    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
                    dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-600/20 rounded-full 
                      mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full 
                      mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-400/30 dark:bg-pink-600/20 
                      rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] 
                    bg-[size:64px_64px] pointer-events-none opacity-20 dark:opacity-10" />

      {/* Main content container */}
      <div className="relative w-full max-w-6xl mx-auto z-10 pt-6">
        {/* Header section */}
        <div className="text-center mb-8 px-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
                        border border-gray-200 dark:border-gray-800
                        shadow-lg shadow-indigo-500/10 dark:shadow-indigo-500/20">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              AI-Powered Education Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                           dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400
                           bg-clip-text text-transparent animate-gradient-x">
              Grade Smarter
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Experience intelligent assignment evaluation with real-time feedback and comprehensive analysis
          </p>
        </div>

        {/* ChatKit Panel */}
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
        />

        {/* Feature highlights */}
        <div className="mt-8 px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="group p-5 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                          border border-gray-200/50 dark:border-gray-800/50
                          hover:bg-white/80 dark:hover:bg-gray-900/80
                          transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 
                            flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Instant Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get immediate grading results with detailed explanations</p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                          border border-gray-200/50 dark:border-gray-800/50
                          hover:bg-white/80 dark:hover:bg-gray-900/80
                          transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 
                            flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Secure & Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your assignments are encrypted and never shared</p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                          border border-gray-200/50 dark:border-gray-800/50
                          hover:bg-white/80 dark:hover:bg-gray-900/80
                          transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 
                            flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Smart Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered insights to improve your performance</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}