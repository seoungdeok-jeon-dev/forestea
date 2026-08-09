"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { progressDone, progressStart, subscribeProgress } from "@/lib/progress-bus";

interface ProgressContextValue {
  /** Generic ref-counted hold (route loading boundaries, async fetches). */
  begin: () => void;
  end: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Safety net: never let a navigation hold the bar open forever. */
const NAV_WATCHDOG_MS = 8000;

function TopProgressBar({ progress, visible }: { progress: number; visible: boolean }) {
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      aria-hidden={!visible}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={visible ? Math.round(pct) : 0}
    >
      <div
        className={`h-full transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="top-progress-bar relative h-full origin-left rounded-r-full bg-gradient-to-r from-forest-400 via-forest-600 to-forest-500 shadow-[0_0_10px_rgba(61,107,79,0.45)]"
          style={{ width: `${pct}%` }}
        />
        {visible && pct > 2 && pct < 100 ? (
          <div
            className="top-progress-peg absolute top-0 h-full w-16 -translate-x-full rounded-full bg-forest-300/80 blur-[2px]"
            style={{ left: `${pct}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // Active signals. The bar is shown while ANY of these keep it busy and
  // completes the instant they all clear.
  const holdCount = useRef(0); // route loading boundaries + async fetches
  const navActive = useRef(false); // in-flight client-side navigation

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navWatchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBusy = useCallback(
    () => holdCount.current > 0 || navActive.current,
    [],
  );

  const stopTick = useCallback(() => {
    if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
  }, []);

  const beginTrickle = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setVisible(true);
    setProgress((p) => (p < 0.08 || p >= 1 ? 0.1 : p));
    if (tick.current) return;
    tick.current = setInterval(() => {
      setProgress((p) => (p >= 0.9 ? p : Math.min(p + (1 - p) * 0.1, 0.9)));
    }, 130);
  }, []);

  const complete = useCallback(() => {
    stopTick();
    setProgress(1);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      hideTimer.current = null;
    }, 240);
  }, [stopTick]);

  // Single source of truth: reconcile the visible bar with the active signals.
  const reconcile = useCallback(() => {
    if (isBusy()) {
      beginTrickle();
    } else {
      complete();
    }
  }, [isBusy, beginTrickle, complete]);

  const begin = useCallback(() => {
    holdCount.current += 1;
    reconcile();
  }, [reconcile]);

  const end = useCallback(() => {
    holdCount.current = Math.max(0, holdCount.current - 1);
    reconcile();
  }, [reconcile]);

  const navStart = useCallback(() => {
    navActive.current = true;
    if (navWatchdog.current) clearTimeout(navWatchdog.current);
    navWatchdog.current = setTimeout(() => {
      navActive.current = false;
      reconcile();
    }, NAV_WATCHDOG_MS);
    reconcile();
  }, [reconcile]);

  const navEnd = useCallback(() => {
    navActive.current = false;
    if (navWatchdog.current) {
      clearTimeout(navWatchdog.current);
      navWatchdog.current = null;
    }
    reconcile();
  }, [reconcile]);

  // Async fetches drive the generic hold count through the module bus.
  useEffect(
    () => subscribeProgress({ onStart: begin, onDone: end }),
    [begin, end],
  );

  useEffect(
    () => () => {
      stopTick();
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (navWatchdog.current) clearTimeout(navWatchdog.current);
    },
    [stopTick],
  );

  const value = useMemo<ProgressContextValue>(() => ({ begin, end }), [begin, end]);

  return (
    <ProgressContext.Provider value={value}>
      <TopProgressBar progress={progress} visible={visible} />
      <NavigationProgressBridge onNavStart={navStart} onNavComplete={navEnd} />
      {children}
    </ProgressContext.Provider>
  );
}

function NavigationProgressBridge({
  onNavStart,
  onNavComplete,
}: {
  onNavStart: () => void;
  onNavComplete: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const isFirst = useRef(true);

  // A committed route change means the navigation finished — clear it.
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    onNavComplete();
  }, [routeKey, onNavComplete]);

  // Show the bar immediately on intent (link click), before the route commits.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      onNavStart();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [onNavStart]);

  return null;
}

/** Call from route `loading.tsx` — holds the bar while a segment is suspending. */
export function RouteLoadingProgress() {
  const ctx = useContext(ProgressContext);

  useEffect(() => {
    const begin = ctx?.begin ?? progressStart;
    const end = ctx?.end ?? progressDone;
    begin();
    return () => end();
  }, [ctx]);

  return null;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    return { begin: progressStart, end: progressDone };
  }
  return ctx;
}
