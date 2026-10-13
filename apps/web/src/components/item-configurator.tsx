"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  formatPrice,
  type CartModifier,
  type MenuItemDetail,
  type MenuModifierGroup,
} from "@/lib/api";
import { cartUnitPrice } from "@/lib/cart-utils";
import { menuImageFor } from "@/lib/menu-images";

interface Props {
  item: MenuItemDetail;
  editLineId?: string;
  returnTo?: string;
}

type GroupKind = "size" | "sweetness" | "toppings" | "generic";

function groupKind(group: MenuModifierGroup): GroupKind {
  const name = group.name.toLowerCase();
  if (/\bsize\b|사이즈/.test(name)) return "size";
  if (/sweet|sugar|당도|당/.test(name)) return "sweetness";
  if (/topping|pearl|boba|add-?on|토핑/.test(name)) return "toppings";
  return "generic";
}

function groupHint(group: MenuModifierGroup): string {
  if (group.minRequired > 0) {
    return group.maxAllowed === 1
      ? "Required · choose 1"
      : `Required · choose ${group.minRequired}${group.maxAllowed > 0 ? `–${group.maxAllowed}` : "+"}`;
  }
  if (group.maxAllowed === 1) return "Optional · choose up to 1";
  if (group.maxAllowed > 1) return `Optional · up to ${group.maxAllowed}`;
  return "Optional";
}

function optionLabel(name: string): { title: string; note?: string } {
  const [title, ...rest] = name.split("·").map((part) => part.trim());
  return { title, note: rest.length ? rest.join(" · ") : undefined };
}

function toppingSwatch(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("crystal")) return "#d9efe4";
  if (n.includes("boba") || n.includes("pearl") || n.includes("tapioca")) return "#2a1810";
  if (n.includes("jelly")) return "#1f3d2a";
  if (n.includes("aloe")) return "#9dcfb0";
  if (n.includes("bean")) return "#7a2e24";
  if (n.includes("pudding")) return "#e6c37a";
  if (n.includes("foam") || n.includes("cream")) return "#f3ece0";
  if (n.includes("oat") || n.includes("milk")) return "#e8d9b8";
  return "#3d6b4f";
}

function CupMark({ large, active }: { large: boolean; active: boolean }) {
  return (
    <svg
      viewBox="0 0 32 44"
      className={`${large ? "h-11 w-8" : "h-9 w-6"} ${
        active ? "text-accent" : "text-ink-muted/50"
      }`}
      fill="none"
      aria-hidden
    >
      <path
        d="M6 6h20l-2.2 30.5a4 4 0 0 1-4 3.5h-7.6a4 4 0 0 1-4-3.5L6 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 12h16" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
    </svg>
  );
}

function defaultsFor(groups: MenuModifierGroup[]): Record<string, string[]> {
  const init: Record<string, string[]> = {};
  for (const group of groups) {
    if (group.minRequired === 1 && group.maxAllowed === 1) {
      const preferred =
        groupKind(group) === "sweetness"
          ? group.modifiers.find((mod) => /50%|half/i.test(mod.name))
          : undefined;
      const pick = preferred ?? group.modifiers.find((mod) => mod.available) ?? group.modifiers[0];
      init[group.id] = pick ? [pick.id] : [];
    } else {
      init[group.id] = [];
    }
  }
  return init;
}

export function ItemConfigurator({
  item,
  editLineId,
  returnTo,
}: Props) {
  const router = useRouter();
  const heroImage = menuImageFor(item.name, item.image);
  const { addToCart, updateLine, getLine } = useCart();
  const existing = editLineId ? getLine(editLineId) : undefined;

  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init = defaultsFor(item.modifierGroups);
    if (existing) {
      for (const group of item.modifierGroups) init[group.id] = [];
      for (const mod of existing.modifiers) {
        const list = init[mod.groupId] ?? [];
        list.push(mod.id);
        init[mod.groupId] = list;
      }
    }
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  const selectedModifiers = useMemo(() => {
    const mods: CartModifier[] = [];
    for (const group of item.modifierGroups) {
      for (const modId of selected[group.id] ?? []) {
        const mod = group.modifiers.find((m) => m.id === modId);
        if (mod) {
          mods.push({
            id: mod.id,
            groupId: group.id,
            groupName: group.name,
            name: mod.name,
            price: mod.price,
          });
        }
      }
    }
    return mods;
  }, [item.modifierGroups, selected]);

  const unitTotal = cartUnitPrice({
    lineId: "",
    itemId: item.id,
    name: item.name,
    basePrice: item.price,
    quantity: 1,
    modifiers: selectedModifiers,
  });

  const summary = selectedModifiers
    .map((mod) => optionLabel(mod.name).title)
    .join(" · ");

  function toggleModifier(group: MenuModifierGroup, modId: string) {
    setError(null);
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      const isSelected = current.includes(modId);
      let next: string[];

      if (group.maxAllowed === 1) {
        next = isSelected && group.minRequired === 0 ? [] : [modId];
      } else if (isSelected) {
        next = current.filter((id) => id !== modId);
      } else if (group.maxAllowed > 0 && current.length >= group.maxAllowed) {
        return prev;
      } else {
        next = [...current, modId];
      }

      return { ...prev, [group.id]: next };
    });
  }

  function validate(): string | null {
    for (const group of item.modifierGroups) {
      const count = selected[group.id]?.length ?? 0;
      if (count < group.minRequired) {
        return `Please choose ${group.minRequired} option(s) for "${group.name}".`;
      }
      if (group.maxAllowed > 0 && count > group.maxAllowed) {
        return `Too many options for "${group.name}".`;
      }
    }
    return null;
  }

  function handleSubmit() {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    const payload = {
      itemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      modifiers: selectedModifiers,
    };

    if (editLineId) {
      updateLine(editLineId, payload);
      router.push(returnTo ?? "/checkout");
    } else {
      addToCart(payload);
      router.push(returnTo ?? "/menu");
    }
  }

  const backHref = returnTo ?? (editLineId ? "/checkout" : "/menu");
  const backLabel = editLineId ? "Back to cart" : "Back to menu";
  const addDisabled = item.available === false;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-0">
      <div className="relative lg:sticky lg:top-20 lg:h-[calc(100svh-5rem)] lg:self-start">
        {heroImage ? (
          <div className="relative aspect-[4/5] overflow-hidden bg-forest-950 sm:aspect-[5/6] lg:aspect-auto lg:h-full">
            <Image
              src={heroImage}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              quality={90}
              priority
              className="object-cover object-bottom"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-forest-950/70 to-transparent lg:hidden"
            />
            <Link
              href={backHref}
              className="absolute left-4 top-4 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-cream-50/90 px-4 text-sm font-medium text-forest-950 backdrop-blur-sm transition hover:bg-cream-50 lg:hidden"
            >
              <span aria-hidden>←</span>
              {backLabel}
            </Link>
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-subtle text-6xl lg:h-full lg:aspect-auto">
            <span aria-hidden>🌿</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pb-16 lg:pt-12 xl:px-16">
        <Link
          href={backHref}
          className="mb-8 hidden items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-ink lg:inline-flex"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>

        <header>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-ink-muted">
            Customize
          </p>
          <h1 className="font-display mt-2 text-3xl leading-[1.05] text-ink sm:text-4xl md:text-5xl">
            {item.name}
          </h1>
          {item.description ? (
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              {item.description}
            </p>
          ) : null}
          <p className="mt-5 text-2xl font-semibold tracking-tight text-ink">
            {formatPrice(unitTotal)}
          </p>
          {summary ? (
            <p className="mt-1.5 text-sm text-ink-muted">{summary}</p>
          ) : null}
        </header>

        {item.modifierGroups.length > 0 ? (
          <div className="mt-10 space-y-10">
            {item.modifierGroups.map((group) => {
              const kind = groupKind(group);
              return (
                <fieldset key={group.id}>
                  <legend className="w-full">
                    <span className="block text-[0.7rem] font-medium uppercase tracking-[0.24em] text-ink-muted">
                      {group.name}
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">
                      {groupHint(group)}
                    </span>
                  </legend>
                  <div className="mt-4">
                    {kind === "size" ? (
                      <SizeOptions
                        group={group}
                        selected={selected[group.id] ?? []}
                        onToggle={toggleModifier}
                      />
                    ) : kind === "sweetness" ? (
                      <SweetnessOptions
                        group={group}
                        selected={selected[group.id] ?? []}
                        onToggle={toggleModifier}
                      />
                    ) : kind === "toppings" ? (
                      <ToppingOptions
                        group={group}
                        selected={selected[group.id] ?? []}
                        onToggle={toggleModifier}
                      />
                    ) : (
                      <GenericOptions
                        group={group}
                        selected={selected[group.id] ?? []}
                        onToggle={toggleModifier}
                      />
                    )}
                  </div>
                </fieldset>
              );
            })}
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
          <span className="text-sm font-medium text-ink-soft">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-lg text-ink transition hover:bg-subtle"
            >
              −
            </button>
            <span className="w-8 text-center text-lg font-semibold text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-lg text-ink transition hover:bg-subtle"
            >
              +
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={addDisabled}
          className="mt-8 hidden w-full rounded-full bg-accent py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:opacity-50 lg:block"
        >
          {editLineId ? "Update cart" : "Add to cart"} ·{" "}
          {formatPrice(unitTotal * quantity)}
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={addDisabled}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
        >
          {editLineId ? "Update cart" : "Add to cart"} ·{" "}
          {formatPrice(unitTotal * quantity)}
        </button>
      </div>
    </div>
  );
}

function SizeOptions({
  group,
  selected,
  onToggle,
}: {
  group: MenuModifierGroup;
  selected: string[];
  onToggle: (group: MenuModifierGroup, id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {group.modifiers.map((mod, index) => {
        const checked = selected.includes(mod.id);
        const { title, note } = optionLabel(mod.name);
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onToggle(group, mod.id)}
            aria-pressed={checked}
            className={`flex min-h-[7.5rem] flex-col items-start justify-between rounded-3xl border px-5 py-4 text-left transition ${
              checked
                ? "border-accent bg-subtle"
                : "border-line hover:border-accent/40"
            }`}
          >
            <span className="flex w-full items-start justify-between gap-3">
              <span>
                <span className="block text-base font-semibold text-ink">{title}</span>
                {note ? (
                  <span className="mt-0.5 block text-sm text-ink-muted">{note}</span>
                ) : null}
              </span>
              <CupMark large={index > 0} active={checked} />
            </span>
            <span className="text-sm font-medium text-ink-soft">
              {mod.price > 0 ? `+${formatPrice(mod.price)}` : "Included"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SweetnessOptions({
  group,
  selected,
  onToggle,
}: {
  group: MenuModifierGroup;
  selected: string[];
  onToggle: (group: MenuModifierGroup, id: string) => void;
}) {
  const active = group.modifiers.find((mod) => selected.includes(mod.id));
  const activeLabel = active ? optionLabel(active.name) : undefined;

  return (
    <div>
      <div className="flex overflow-hidden rounded-full bg-subtle p-1">
        {group.modifiers.map((mod) => {
          const checked = selected.includes(mod.id);
          const percent = optionLabel(mod.name).title;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onToggle(group, mod.id)}
              aria-pressed={checked}
              className={`min-h-[44px] flex-1 rounded-full px-1 text-[0.8rem] font-semibold transition sm:text-sm ${
                checked
                  ? "bg-accent text-on-accent shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {percent.replace(/\s.*/, "")}
            </button>
          );
        })}
      </div>
      {activeLabel ? (
        <p className="mt-3 text-sm text-ink-muted">
          {activeLabel.note ?? activeLabel.title}
        </p>
      ) : null}
    </div>
  );
}

function ToppingOptions({
  group,
  selected,
  onToggle,
}: {
  group: MenuModifierGroup;
  selected: string[];
  onToggle: (group: MenuModifierGroup, id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {group.modifiers.map((mod) => {
        const checked = selected.includes(mod.id);
        const { title } = optionLabel(mod.name);
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onToggle(group, mod.id)}
            aria-pressed={checked}
            className={`flex min-h-[72px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
              checked
                ? "border-accent bg-subtle"
                : "border-line hover:border-accent/40"
            }`}
          >
            <span
              aria-hidden
              className={`h-10 w-10 shrink-0 rounded-full ring-1 ${
                checked ? "ring-accent" : "ring-line"
              }`}
              style={{ backgroundColor: toppingSwatch(mod.name) }}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-snug text-ink">
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                {mod.price > 0 ? `+${formatPrice(mod.price)}` : "Included"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GenericOptions({
  group,
  selected,
  onToggle,
}: {
  group: MenuModifierGroup;
  selected: string[];
  onToggle: (group: MenuModifierGroup, id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {group.modifiers.map((mod) => {
        const checked = selected.includes(mod.id);
        const { title, note } = optionLabel(mod.name);
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onToggle(group, mod.id)}
            aria-pressed={checked}
            className={`flex w-full min-h-[52px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              checked
                ? "border-accent bg-subtle"
                : "border-line hover:border-accent/40"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{title}</span>
              {note ? (
                <span className="block text-xs text-ink-muted">{note}</span>
              ) : null}
            </span>
            <span className="shrink-0 text-sm text-ink-soft">
              {mod.price > 0 ? `+${formatPrice(mod.price)}` : "Included"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
