import Link from "next/link";
import type { ReactNode } from "react";

export function LegalDocument({
  eyebrow,
  title,
  effectiveDate,
  children,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
      <header className="border-b border-line pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">
          {eyebrow}
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          Effective date: {effectiveDate}
        </p>
      </header>

      <article className="space-y-10 py-10 text-[15px] leading-7 text-ink-soft">
        {children}
      </article>

      <nav className="flex gap-5 border-t border-line pt-8 text-sm">
        <Link className="text-ink-soft underline hover:text-ink" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="text-ink-soft underline hover:text-ink" href="/terms">
          Terms of Service
        </Link>
      </nav>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function LegalSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="pt-2 text-base font-semibold text-ink">{children}</h3>
  );
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-subtle">
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-line px-4 py-3 font-semibold text-ink"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="align-top">
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${index}`}
                  className="border-b border-line px-4 py-3 last:border-r-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
