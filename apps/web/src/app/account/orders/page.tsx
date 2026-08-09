import { auth } from "@/auth";
import { MenuTabs } from "@/components/menu-tabs";
import { formatPrice } from "@/lib/api";
import { prisma } from "@forestea/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  CHECKOUT: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-subtle text-ink-muted",
};

export default async function OrdersPage() {
  const session = await auth();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          Order history
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">Previous</h1>
      </header>
      <MenuTabs />

      {!session?.user ? (
        <div className="py-16 text-center">
          <p className="text-ink-soft">Log in to see your previous orders.</p>
          <Link
            href="/login?callbackUrl=/account/orders"
            className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
          >
            Log in
          </Link>
        </div>
      ) : (
        <OrdersList userId={session.user.id} email={session.user.email ?? null} />
      )}
    </div>
  );
}

async function OrdersList({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      OR: [{ userId }, ...(email ? [{ customerEmail: email }] : [])],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">No orders yet.</p>
        <Link
          href="/menu"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
        >
          Order something
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-ink-muted">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLE[order.status] ?? "bg-subtle text-ink-muted"
                }`}
              >
                {order.status}
              </span>
              <span className="font-semibold text-ink">
                {formatPrice(order.totalCents)}
              </span>
            </div>
          </div>
          <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-ink-soft">
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
      ))}
    </div>
  );
}
