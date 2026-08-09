"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  formatPrice,
  type CartModifier,
  type MenuItemDetail,
} from "@/lib/api";
import { cartUnitPrice } from "@/lib/cart-utils";

interface Props {
  item: MenuItemDetail;
  editLineId?: string;
  returnTo?: string;
}

function groupLabel(group: MenuItemDetail["modifierGroups"][0]): string {
  if (group.minRequired > 0) {
    const max =
      group.maxAllowed === 1
        ? "Required · choose 1"
        : `Required · choose ${group.minRequired}${group.maxAllowed > 0 ? `–${group.maxAllowed}` : "+"}`;
    return max;
  }
  if (group.maxAllowed === 1) return "Optional · choose up to 1";
  if (group.maxAllowed > 1) return `Optional · up to ${group.maxAllowed}`;
  return "Optional";
}

export function ItemConfigurator({ item, editLineId, returnTo }: Props) {
  const router = useRouter();
  const { addToCart, updateLine, getLine } = useCart();
  const existing = editLineId ? getLine(editLineId) : undefined;

  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of item.modifierGroups) init[g.id] = [];
    if (existing) {
      for (const m of existing.modifiers) {
        const list = init[m.groupId] ?? [];
        list.push(m.id);
        init[m.groupId] = list;
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

  function toggleModifier(
    group: MenuItemDetail["modifierGroups"][0],
    modId: string,
  ) {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      const isSelected = current.includes(modId);
      let next: string[];

      if (group.maxAllowed === 1) {
        next = isSelected ? [] : [modId];
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        <span aria-hidden>←</span>
        {backLabel}
      </Link>

      <header className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
          Menu item
        </p>
        <h1 className="font-display mt-2 text-4xl text-ink md:text-5xl">
          {item.name}
        </h1>
        {item.description ? (
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {item.description}
          </p>
        ) : null}
        <p className="mt-4 text-2xl font-semibold text-ink">
          {formatPrice(item.price)}
          <span className="ml-2 text-sm font-normal text-ink-muted">
            base · {formatPrice(unitTotal)} with selections
          </span>
        </p>
      </header>

      {item.modifierGroups.length > 0 ? (
        <div className="mt-10 space-y-8">
          {item.modifierGroups.map((group) => (
            <fieldset
              key={group.id}
              className="rounded-2xl border border-line bg-card p-6"
            >
              <legend className="px-1 text-sm font-semibold text-ink">
                {group.name}
                <span className="ml-2 font-normal text-ink-muted">
                  {groupLabel(group)}
                </span>
              </legend>
              <div className="mt-4 space-y-2">
                {group.modifiers.map((mod) => {
                  const checked = (selected[group.id] ?? []).includes(mod.id);
                  const inputType =
                    group.maxAllowed === 1 ? "radio" : "checkbox";

                  return (
                    <label
                      key={mod.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                        checked
                          ? "border-accent bg-subtle"
                          : "border-line hover:border-accent/50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type={inputType}
                          name={`group-${group.id}`}
                          checked={checked}
                          onChange={() => toggleModifier(group, mod.id)}
                          className="h-4 w-4 accent-forest-700"
                        />
                        <span className="text-sm font-medium text-ink">
                          {mod.name}
                        </span>
                      </span>
                      <span className="text-sm text-ink-soft">
                        {mod.price > 0 ? `+${formatPrice(mod.price)}` : "Included"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-card p-6">
        <span className="text-sm font-medium text-ink-soft">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-ink hover:bg-subtle"
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-semibold text-ink">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-ink hover:bg-subtle"
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
        disabled={item.available === false}
        className="mt-8 w-full rounded-full bg-accent py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
      >
        {editLineId ? "Update cart" : "Add to cart"} · {formatPrice(unitTotal * quantity)}
      </button>
    </div>
  );
}
