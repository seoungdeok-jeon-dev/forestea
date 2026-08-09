"use client";

import { deletePost, togglePublish } from "@/app/admin/posts/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostRowActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean }>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(() => togglePublish(id))}
        className="text-sm font-medium text-ink-soft underline hover:text-ink disabled:opacity-50"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm("Delete this post?")) void run(() => deletePost(id));
        }}
        className="text-sm font-medium text-red-700 underline hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
