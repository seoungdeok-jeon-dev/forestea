import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <div className="mx-auto w-full min-h-[calc(100svh-5rem)] max-w-5xl px-6 pt-12 pb-8 md:pt-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl text-ink md:text-5xl">
          Almost there
        </h1>
      </header>
      <CheckoutForm
        initialName={session?.user?.name ?? undefined}
        initialEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
