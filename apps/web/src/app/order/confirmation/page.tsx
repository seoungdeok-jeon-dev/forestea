import Link from "next/link";
import { formatPrice, getOrder } from "@/lib/api";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-ink-soft">No order ID provided.</p>
        <Link href="/" className="mt-4 inline-block text-accent underline">
          Back home
        </Link>
      </div>
    );
  }

  let order: import("@/lib/api").OrderRecord | null = null;
  try {
    order = await getOrder(id);
  } catch {
    order = null;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-subtle text-3xl text-ink">
        ✓
      </span>
      <h1 className="font-display mt-6 text-3xl text-ink">
        Order confirmed
      </h1>
      <p className="mt-3 text-ink-soft">
        Thank you! We&apos;ll have your order ready for pickup soon.
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6 text-left text-sm text-ink">
          <p>
            <span className="text-ink-soft">Order ID:</span>{" "}
            <span className="font-mono">{order.id}</span>
          </p>
          {order.cloverOrderId && (
            <p className="mt-2">
              <span className="text-ink-soft">Clover order:</span>{" "}
              <span className="font-mono">{order.cloverOrderId}</span>
            </p>
          )}
          <p className="mt-2">
            <span className="text-ink-soft">Status:</span> {order.status}
          </p>
          <p className="mt-2 font-semibold text-ink">
            Total: {formatPrice(order.totalCents)}
          </p>
          <ul className="mt-4 space-y-1 border-t border-line pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent hover:bg-accent-hover"
      >
        Back to menu
      </Link>
    </div>
  );
}
