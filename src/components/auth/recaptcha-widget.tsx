"use client";

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";

const SCRIPT_V2 = "https://www.google.com/recaptcha/api.js?render=explicit";

let recaptchaMountCounter = 0;

export interface ReCaptchaWidgetProps {
  siteKey: string;
  onTokenChange?: (token: string | null) => void;
  theme?: "light" | "dark";
  className?: string;
  /** "2" = checkbox, "3" = invisible. Default "2" for v2 keys. */
  version?: "2" | "3";
}

declare global {
  interface Window {
    grecaptcha?: {
      render?: (container: HTMLElement, options: { sitekey: string; callback?: (token: string) => void; "expired-callback"?: () => void; theme?: string }) => number;
      ready?: (cb: () => void) => void;
      execute?: (siteKey: string, options: { action: string }) => Promise<string>;
      reset?: (widgetId: number) => void;
      getResponse?: (widgetId?: number) => string;
    };
    ___grecaptcha_cfg?: unknown;
  }
}

export interface ReCaptchaHandle {
  getToken: () => Promise<string>;
}

export const ReCaptchaWidget = forwardRef<ReCaptchaHandle, ReCaptchaWidgetProps>(
  function ReCaptchaWidget({ siteKey, onTokenChange, theme = "light", className = "", version }, ref) {
    const versionToUse = version ?? (process.env.NEXT_PUBLIC_RECAPTCHA_VERSION as "2" | "3") ?? "2";
    const [mountKey] = useState(() => ++recaptchaMountCounter);
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    const handleToken = useCallback(
      (token: string | null) => {
        onTokenChange?.(token);
      },
      [onTokenChange]
    );

    useImperativeHandle(
      ref,
      () => ({
        getToken: () =>
          new Promise<string>((resolve, reject) => {
            if (versionToUse === "3") {
              if (!window.grecaptcha?.ready || !window.grecaptcha?.execute) {
                reject(new Error("reCAPTCHA v3 not loaded"));
                return;
              }
              window.grecaptcha.ready!(() => {
                window.grecaptcha!.execute!(siteKey, { action: "register" }).then(resolve).catch(reject);
              });
            } else {
              const token = window.grecaptcha?.getResponse?.() ?? "";
              if (token) resolve(token);
              else reject(new Error("reCAPTCHA not completed"));
            }
          }),
      }),
      [siteKey, versionToUse]
    );

    useEffect(() => {
      if (!siteKey) return;

      if (versionToUse === "3") {
        const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        const hasV3 = typeof window !== "undefined" && window.grecaptcha?.execute;
        const hasV3Script = document.querySelector(`script[src*="render="]`);
        if (!hasV3 && !hasV3Script) {
          const script = document.createElement("script");
          script.src = scriptUrl;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
        return () => {};
      }

      const renderWidget = () => {
        if (!containerRef.current || !window.grecaptcha?.render) return;
        containerRef.current.innerHTML = "";
        const widgetContainer = document.createElement("div");
        containerRef.current.appendChild(widgetContainer);
        try {
          widgetIdRef.current = window.grecaptcha.render(widgetContainer, {
            sitekey: siteKey,
            callback: (token: string) => handleToken(token),
            "expired-callback": () => handleToken(null),
            theme,
          });
        } catch (e) {
          console.error("reCAPTCHA render error:", e);
        }
      };

      const loadScript = () => {
        if (!containerRef.current) return;
        if (window.grecaptcha?.render) {
          renderWidget();
          return;
        }
        const script = document.createElement("script");
        script.src = SCRIPT_V2;
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      };

      // Use requestAnimationFrame to ensure DOM/ref is ready
      const rafId = requestAnimationFrame(() => loadScript());
      return () => {
        cancelAnimationFrame(rafId);
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        widgetIdRef.current = null;
      };
    }, [siteKey, theme, handleToken, versionToUse]);

    if (!siteKey) return null;

    if (versionToUse === "3") {
      return (
        <div className={className} data-testid="recaptcha-widget-v3">
          <small className="text-muted-foreground text-xs">
            This site is protected by reCAPTCHA.
          </small>
        </div>
      );
    }

    return (
      <div
        key={mountKey}
        ref={containerRef}
        className={`min-h-[78px] flex items-center justify-center ${className}`}
        data-testid="recaptcha-widget"
      />
    );
  }
);

export function getRecaptchaResponse(): string {
  if (typeof window === "undefined" || !window.grecaptcha?.getResponse) return "";
  return window.grecaptcha.getResponse() || "";
}
