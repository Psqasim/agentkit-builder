"use client";

import { useEffect, useState } from "react";

type Integration = {
  id: string;
  name: string;
  icon: string;
  status: "connected" | "pending" | "disconnected";
  description: string;
};

type IntegrationStatusProps = {
  isLoading?: boolean;
};

export function IntegrationStatus({ isLoading = false }: IntegrationStatusProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate checking integration status
    // In production, this would call your API to check if integrations are connected
    setIntegrations([
      {
        id: "gmail",
        name: "Gmail",
        icon: "✉️",
        status: isLoading ? "pending" : "disconnected",
        description: "Send and draft emails",
      },
      {
        id: "drive",
        name: "Google Drive",
        icon: "📄",
        status: isLoading ? "pending" : "disconnected",
        description: "Read and write sheets",
      },
      {
        id: "general",
        name: "AI Assistant",
        icon: "🤖",
        status: "connected",
        description: "General questions & answers",
      },
    ]);
  }, [isLoading]);

  if (!mounted) return null;

  const connected = integrations.filter((i) => i.status === "connected").length;
  const total = integrations.length;

  return (
    <div className="w-full animate-fadeInUp">
      {/* Status Header */}
      <div className="mb-6 text-center">
        <h3 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
          システム統合状態 / Integration Status
        </h3>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {connected} of {total} systems connected
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {integrations.map((integration, index) => (
          <div
            key={integration.id}
            className="animate-slideIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`group relative overflow-hidden rounded-xl border border-[var(--border)] p-4 backdrop-blur-sm transition-all duration-500 hover:shadow-zen ${
                integration.status === "connected"
                  ? "bg-white/50 dark:bg-slate-800/50"
                  : integration.status === "pending"
                    ? "bg-yellow-50/30 dark:bg-yellow-900/10"
                    : "bg-slate-50/30 dark:bg-slate-800/20"
              }`}
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 -z-10 transition-opacity duration-500 ${
                  integration.status === "connected" ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background:
                    integration.status === "connected"
                      ? `linear-gradient(135deg, rgba(79, 123, 167, 0.1) 0%, rgba(107, 163, 156, 0.05) 100%)`
                      : "transparent",
                }}
              />

              {/* Status indicator dot */}
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    integration.status === "connected"
                      ? "animate-pulse-glow bg-green-500"
                      : integration.status === "pending"
                        ? "animate-pulse bg-yellow-400"
                        : "bg-slate-400"
                  }`}
                />
              </div>

              {/* Icon */}
              <div className="mb-2 text-2xl">{integration.icon}</div>

              {/* Name & Description */}
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                {integration.name}
              </h4>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {integration.description}
              </p>

              {/* Status text */}
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    integration.status === "connected"
                      ? "text-green-600 dark:text-green-400"
                      : integration.status === "pending"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {integration.status === "connected" && "✓ Connected"}
                  {integration.status === "pending" && "⟳ Checking..."}
                  {integration.status === "disconnected" && "○ Not Connected"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info message */}
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-blue-50/50 p-4 dark:bg-blue-900/10">
        <p className="text-xs leading-relaxed text-[var(--foreground)]">
          <span className="font-semibold">ℹ️ Note:</span> To enable email sending and sheet management, add your APIs in{" "}
          <a
            href="https://platform.openai.com/agent-builder/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            OpenAI Agent Builder
          </a>
          {" "}and connect Gmail and Google Drive integrations in your workflow.
        </p>
      </div>
    </div>
  );
}
