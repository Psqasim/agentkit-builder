"use client";

import { useCallback, useState } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [showStatus, setShowStatus] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);

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
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center justify-center py-8 px-4 sm:py-12">
        <div className="w-full max-w-5xl">
          {/* Header with animation */}
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3">
              <span style={{ color: "var(--primary)" }}>Multi-Agent</span>
              <br />
              <span style={{ color: "var(--foreground)" }} className="font-extralight">
                Orchestrator
              </span>
            </h1>
            <div className="h-1 w-16 mx-auto rounded-full" style={{ background: "var(--secondary)" }} />
            <p className="mt-4 text-sm tracking-wide" style={{ color: "var(--muted)" }}>
              マルチエージェント / AI Productivity Unified System
            </p>
          </div>

          {/* Status Section */}
          {showStatus && (
            <div className="mb-10 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
              <IntegrationStatus isLoading={!isSessionReady} />
              <button
                onClick={() => setShowStatus(false)}
                className="mt-4 mx-auto block text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--muted)" }}
              >
                Hide status
              </button>
            </div>
          )}

          {/* Chat Panel Container */}
          <div
            className="animate-fadeInUp rounded-3xl border overflow-hidden"
            style={{
              borderColor: "var(--border)",
              animationDelay: "400ms",
            }}
          >
            <ChatKitPanel
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
              onSessionReady={() => setIsSessionReady(true)}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center animate-fadeInUp" style={{ animationDelay: "600ms" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Made with OPENAI AGENT KIT BUILDER • Multi-Agent System
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
