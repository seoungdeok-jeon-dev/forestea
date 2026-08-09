import Link from "next/link";
import { CartSummary } from "@/components/cart-summary";

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display mb-2 text-4xl text-ink">Your cart</h1>
      <p className="mb-10 text-ink-soft">
        Adjust quantities, then proceed to checkout.
      </p>
      <CartSummary />
      <Link
        href="/checkout"
        className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent hover:bg-accent-hover"
      >
        Go to checkout
      </Link>
    </div>
  );
}
