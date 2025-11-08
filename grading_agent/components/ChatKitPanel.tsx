"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  CREATE_SESSION_ENDPOINT,
  WORKFLOW_ID,
} from "@/lib/config";
import { ErrorOverlay } from "./ErrorOverlay";
import type { ColorScheme } from "@/hooks/useColorScheme";

export type FactAction = {
  type: "save";
  factId: string;
  factText: string;
};

type ChatKitPanelProps = {
  theme: ColorScheme;
  onWidgetAction: (action: FactAction) => Promise<void>;
  onResponseEnd: () => void;
  onThemeRequest: (scheme: ColorScheme) => void;
};

type ErrorState = {
  script: string | null;
  session: string | null;
  integration: string | null;
  retryable: boolean;
};

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

const createInitialErrors = (): ErrorState => ({
  script: null,
  session: null,
  integration: null,
  retryable: false,
});

export function ChatKitPanel({
  theme,
  onWidgetAction,
  onResponseEnd,
  onThemeRequest,
}: ChatKitPanelProps) {
  const processedFacts = useRef(new Set<string>());
  const [errors, setErrors] = useState<ErrorState>(() => createInitialErrors());
  const [isInitializingSession, setIsInitializingSession] = useState(true);
  const isMountedRef = useRef(true);
  const [scriptStatus, setScriptStatus] = useState<
    "pending" | "ready" | "error"
  >(() =>
    isBrowser && window.customElements?.get("openai-chatkit")
      ? "ready"
      : "pending"
  );
  const [widgetInstanceKey, setWidgetInstanceKey] = useState(0);

  const setErrorState = useCallback((updates: Partial<ErrorState>) => {
    setErrors((current) => ({ ...current, ...updates }));
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    let timeoutId: number | undefined;

    const handleLoaded = () => {
      if (!isMountedRef.current) {
        return;
      }
      setScriptStatus("ready");
      setErrorState({ script: null });
    };

    const handleError = (event: Event) => {
      console.error("Failed to load chatkit.js for some reason", event);
      if (!isMountedRef.current) {
        return;
      }
      setScriptStatus("error");
      const detail = (event as CustomEvent<unknown>)?.detail ?? "unknown error";
      setErrorState({ script: `Error: ${detail}`, retryable: false });
      setIsInitializingSession(false);
    };

    window.addEventListener("chatkit-script-loaded", handleLoaded);
    window.addEventListener(
      "chatkit-script-error",
      handleError as EventListener
    );

    if (window.customElements?.get("openai-chatkit")) {
      handleLoaded();
    } else if (scriptStatus === "pending") {
      timeoutId = window.setTimeout(() => {
        if (!window.customElements?.get("openai-chatkit")) {
          handleError(
            new CustomEvent("chatkit-script-error", {
              detail:
                "ChatKit web component is unavailable. Verify that the script URL is reachable.",
            })
          );
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener("chatkit-script-loaded", handleLoaded);
      window.removeEventListener(
        "chatkit-script-error",
        handleError as EventListener
      );
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [scriptStatus, setErrorState]);

  const isWorkflowConfigured = Boolean(
    WORKFLOW_ID && !WORKFLOW_ID.startsWith("wf_replace")
  );

  useEffect(() => {
    if (!isWorkflowConfigured && isMountedRef.current) {
      setErrorState({
        session: "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.",
        retryable: false,
      });
      setIsInitializingSession(false);
    }
  }, [isWorkflowConfigured, setErrorState]);

  const handleResetChat = useCallback(() => {
    processedFacts.current.clear();
    if (isBrowser) {
      setScriptStatus(
        window.customElements?.get("openai-chatkit") ? "ready" : "pending"
      );
    }
    setIsInitializingSession(true);
    setErrors(createInitialErrors());
    setWidgetInstanceKey((prev) => prev + 1);
  }, []);

  const getClientSecret = useCallback(
    async (currentSecret: string | null) => {
      if (isDev) {
        console.info("[ChatKitPanel] getClientSecret invoked", {
          currentSecretPresent: Boolean(currentSecret),
          workflowId: WORKFLOW_ID,
          endpoint: CREATE_SESSION_ENDPOINT,
        });
      }

      if (!isWorkflowConfigured) {
        const detail =
          "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.";
        if (isMountedRef.current) {
          setErrorState({ session: detail, retryable: false });
          setIsInitializingSession(false);
        }
        throw new Error(detail);
      }

      if (isMountedRef.current) {
        if (!currentSecret) {
          setIsInitializingSession(true);
        }
        setErrorState({ session: null, integration: null, retryable: false });
      }

      try {
        const response = await fetch(CREATE_SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflow: { id: WORKFLOW_ID },
            chatkit_configuration: {
              file_upload: {
                enabled: true,
              },
            },
          }),
        });

        const raw = await response.text();

        if (isDev) {
          console.info("[ChatKitPanel] createSession response", {
            status: response.status,
            ok: response.ok,
            bodyPreview: raw.slice(0, 1600),
          });
        }

        let data: Record<string, unknown> = {};
        if (raw) {
          try {
            data = JSON.parse(raw) as Record<string, unknown>;
          } catch (parseError) {
            console.error(
              "Failed to parse create-session response",
              parseError
            );
          }
        }

        if (!response.ok) {
          const detail = extractErrorDetail(data, response.statusText);
          console.error("Create session request failed", {
            status: response.status,
            body: data,
          });
          throw new Error(detail);
        }

        const clientSecret = data?.client_secret as string | undefined;
        if (!clientSecret) {
          throw new Error("Missing client secret in response");
        }

        if (isMountedRef.current) {
          setErrorState({ session: null, integration: null });
        }

        return clientSecret;
      } catch (error) {
        console.error("Failed to create ChatKit session", error);
        const detail =
          error instanceof Error
            ? error.message
            : "Unable to start ChatKit session.";
        if (isMountedRef.current) {
          setErrorState({ session: detail, retryable: false });
        }
        throw error instanceof Error ? error : new Error(detail);
      } finally {
        if (isMountedRef.current && !currentSecret) {
          setIsInitializingSession(false);
        }
      }
    },
    [isWorkflowConfigured, setErrorState]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },

    theme: {
      colorScheme: theme === 'dark' ? 'dark' : 'light',
      radius: 'round',
      density: 'normal',
      color: {
        grayscale: {
          hue: 220,
          tint: 8,
          shade: 4
        },
        accent: {
          primary: '#6366f1',
          level: 1
        }
      },
      typography: {
        baseSize: 16
      }
    },
    composer: {
      placeholder: 'Ask a question or upload your assignment file...',
      attachments: {
        enabled: true,
        maxCount: 5,
        maxSize: 10485760
      },
      models: [
        {
          id: 'crisp',
          label: 'Crisp',
          description: 'Quick and concise feedback'
        },
        {
          id: 'chatty',
          label: 'Detailed',
          description: 'Comprehensive explanations'
        },
        {
          id: "clear",
          label: "Clear",
          description: "Simple and straightforward"
        }
      ],
    },
    disclaimer: {
      text: "🎓 This AI assistant provides automated grading help. Please verify results before final submission.",
      highContrast: true,
    },
    threadItemActions: {
      feedback:true,
      retry: true,

    },
    startScreen: {
      greeting: '👋 Welcome to your Grading Assistant! Upload your assignment to get started.',
      prompts: [
        {
          icon: 'star',
          label: 'Submit assignment for grading',
          prompt: 'I want to submit my assignment for grading'
        },
        {
          icon: 'chart',
          label: 'View my grades and feedback',
          prompt: 'Show me my current grades and feedback'
        },
        
      ],
    },
    
    onClientTool: async (invocation: {
      name: string;
      params: Record<string, unknown>;
    }) => {
      if (invocation.name === "switch_theme") {
        const requested = invocation.params.theme;
        if (requested === "light" || requested === "dark") {
          if (isDev) {
            console.debug("[ChatKitPanel] switch_theme", requested);
          }
          onThemeRequest(requested);
          return { success: true };
        }
        return { success: false };
      }

      if (invocation.name === "record_fact") {
        const id = String(invocation.params.fact_id ?? "");
        const text = String(invocation.params.fact_text ?? "");
        if (!id || processedFacts.current.has(id)) {
          return { success: true };
        }
        processedFacts.current.add(id);
        void onWidgetAction({
          type: "save",
          factId: id,
          factText: text.replace(/\s+/g, " ").trim(),
        });
        return { success: true };
      }

      return { success: false };
    },
    onResponseEnd: () => {
      onResponseEnd();
    },
    onResponseStart: () => {
      setErrorState({ integration: null, retryable: false });
    },
    onThreadChange: () => {
      processedFacts.current.clear();
    },
    onError: ({ error }: { error: unknown }) => {
      console.error("ChatKit error", error);
    },
  });

  const activeError = errors.session ?? errors.integration;
  const blockingError = errors.script ?? activeError;

  if (isDev) {
    console.debug("[ChatKitPanel] render state", {
      isInitializingSession,
      hasControl: Boolean(chatkit.control),
      scriptStatus,
      hasError: Boolean(blockingError),
      workflowId: WORKFLOW_ID,
    });
  }

  return (
    <div className="relative w-full h-full px-4 pb-6">
      {/* Modern floating card container */}
      <div className="relative flex h-[90vh] w-full rounded-[2rem] flex-col overflow-hidden 
                      bg-gradient-to-br from-white via-gray-50 to-gray-100
                      dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
                      shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
                      dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]
                      border border-gray-200/50 dark:border-gray-800/50
                      transition-all duration-500 ease-out
                      hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]
                      dark:hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)]">
        
        {/* Animated gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                        animate-gradient-x z-20" />
        
        {/* Decorative blur orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 
                        rounded-full blur-3xl pointer-events-none animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-indigo-400/20 
                        rounded-full blur-3xl pointer-events-none animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Header with glassmorphism effect */}
        <div className="relative px-6 py-5 border-b border-gray-200/70 dark:border-gray-800/70 
                        bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Animated icon container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md 
                                opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 
                                shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                              dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Grading Assistant
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                  AI-powered assignment evaluation
                </p>
              </div>
            </div>
            
            {/* Enhanced status indicator */}
            <div className="flex items-center gap-3">
              <div className={`
                relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
                transition-all duration-300 overflow-hidden
                ${!blockingError && !isInitializingSession
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/30'
                  : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-2 border-amber-500/30'
                }
              `}>
                <div className="relative">
                  <span className={`
                    block w-2.5 h-2.5 rounded-full
                    ${!blockingError && !isInitializingSession
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                      : 'bg-amber-500 shadow-lg shadow-amber-500/50'
                    }
                  `}>
                    {!blockingError && !isInitializingSession && (
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    )}
                  </span>
                </div>
                <span className="relative z-10">
                  {!blockingError && !isInitializingSession ? 'Online' : 'Connecting'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main ChatKit container with enhanced styling */}
        <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-950/30">
          <ChatKit
            key={widgetInstanceKey}
            control={chatkit.control}
            className={`
              h-full w-full
              transition-all duration-500 ease-out
              ${blockingError || isInitializingSession
                ? 'pointer-events-none opacity-0 scale-98 blur-sm'
                : 'opacity-100 scale-100 blur-0'
              }
            `}
          />
          
          {/* Premium loading state */}
          {isInitializingSession && !blockingError && (
            <div className="absolute inset-0 flex items-center justify-center 
                          bg-gradient-to-br from-white/95 via-gray-50/95 to-gray-100/95
                          dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-950/95
                          backdrop-blur-xl z-30">
              <div className="text-center space-y-8 px-8">
                {/* Animated loader */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent 
                                border-indigo-600 dark:border-indigo-400 animate-spin" 
                       style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-l-transparent 
                                border-purple-600 dark:border-purple-400 animate-spin" 
                       style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
                                  animate-pulse shadow-lg shadow-indigo-500/50" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Initializing Your Assistant
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Setting up secure connection and preparing your personalized grading environment
                  </p>
                </div>
                
                {/* Loading dots */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" 
                       style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" 
                       style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-pink-600 dark:bg-pink-400 animate-bounce" 
                       style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          <ErrorOverlay
            error={blockingError}
            fallbackMessage={null}
            onRetry={blockingError && errors.retryable ? handleResetChat : null}
            retryLabel="Restart Assistant"
          />
        </div>

        {/* Modern footer with branding */}
        <div className="relative px-6 py-4 border-t border-gray-200/70 dark:border-gray-800/70 
                        bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Secure & Private</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">Crafted by</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                            bg-gradient-to-r from-indigo-500/10 to-purple-500/10 
                            dark:from-indigo-500/20 dark:to-purple-500/20
                            border border-indigo-500/20 dark:border-indigo-500/30">
                <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
                               dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  psqasim
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractErrorDetail(
  payload: Record<string, unknown> | undefined,
  fallback: string
): string {
  if (!payload) {
    return fallback;
  }

  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}