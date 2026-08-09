import { RouteLoadingProgress } from "@/context/progress-context";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <RouteLoadingProgress />
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="logo-loader-ring absolute inset-0 rounded-full border border-accent/40" />
        <span className="logo-loader-ring absolute inset-0 rounded-full border border-accent/40 [animation-delay:0.5s]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Loading"
          className="logo-loader h-12 w-auto dark:invert"
        />
      </div>
    </div>
  );
}
