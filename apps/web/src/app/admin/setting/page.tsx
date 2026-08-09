import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingContent } from "./setting-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/setting");
  }
  if (session.user.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Admin Access Required</h1>
        <p className="mt-3 text-ink-soft">
          This page is restricted to administrators only. Please contact the owner to request access.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<p className="p-16 text-center">Loading…</p>}>
      <SettingContent />
    </Suspense>
  );
}
