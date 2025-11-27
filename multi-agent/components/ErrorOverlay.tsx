"use client";

import type { ReactNode } from "react";

type ErrorOverlayProps = {
  error: string | null;
  fallbackMessage?: ReactNode;
  onRetry?: (() => void) | null;
  retryLabel?: string;
};

export function ErrorOverlay({
  error,
  fallbackMessage,
  onRetry,
  retryLabel,
}: ErrorOverlayProps) {
  if (!error && !fallbackMessage) {
    return null;
  }

  const content = error ?? fallbackMessage;

  if (!content) {
    return null;
  }

  const isError = !!error;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-center rounded-[inherit] animate-fadeIn"
      style={{
        background: `linear-gradient(135deg, rgba(248, 247, 244, 0.95) 0%, rgba(248, 247, 244, 0.92) 100%)`,
      }}
    >
      <style>{`
        :root[data-color-scheme="dark"] + * .error-overlay {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(15, 20, 25, 0.92) 100%) !important;
        }
      `}</style>
      <div className="pointer-events-auto mx-auto w-full max-w-md animate-slideIn">
        <div
          className="rounded-2xl shadow-zen-lg p-8 text-center border"
          style={{
            borderColor: isError ? "var(--secondary)" : "var(--border)",
            background: isError
              ? "rgba(212, 117, 109, 0.08)"
              : "rgba(79, 123, 167, 0.05)",
          }}
        >
          {/* Icon */}
          <div className="mb-4 text-4xl">
            {isError ? "⚠️" : "⟳"}
          </div>

          {/* Message */}
          <div
            className="text-base font-medium leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {content}
          </div>

          {/* Retry Button */}
          {error && onRetry ? (
            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-zen focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: "var(--primary)",
                color: "white",
                focusVisibleRingColor: "var(--primary)",
              }}
              onClick={onRetry}
            >
              {retryLabel ?? "Restart chat"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
