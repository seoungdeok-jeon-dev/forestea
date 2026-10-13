import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Forestea Admin" };

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
          This page is restricted to administrators only.
        </p>
        <Link href="/" className="mt-6 inline-block text-ink/70 hover:text-ink">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 md:py-16">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] text-ink">
        Settings
      </h1>
      <p className="mt-4 text-ink-soft leading-relaxed">
        Payments use Stripe. Set{" "}
        <code className="text-ink">STRIPE_SECRET_KEY</code> and{" "}
        <code className="text-ink">STRIPE_PUBLISHABLE_KEY</code> in{" "}
        <code className="text-ink">apps/api/.env.local</code> for local
        development, or in the Railway dashboard for production. Restart the API
        after changing keys.
      </p>
      <p className="mt-4 text-ink-soft leading-relaxed">
        Clover POS integration has been removed from the storefront. Menu and
        checkout no longer depend on Clover.
      </p>
      <Link
        href="/admin/posts"
        className="mt-8 inline-block text-[0.8rem] font-medium tracking-[0.04em] text-ink/70 transition-colors hover:text-ink"
      >
        Manage posts →
      </Link>
    </div>
  );
}
