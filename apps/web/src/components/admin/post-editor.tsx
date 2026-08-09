"use client";

import { createPost } from "@/app/admin/posts/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostEditor() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createPost(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save post.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-line bg-card px-4 py-2.5 text-ink outline-none focus:border-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
    >
      <h2 className="font-display text-xl text-ink">New post</h2>

      <div>
        <label className="block text-sm font-medium text-ink-soft" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" required className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-soft" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className={inputClass} defaultValue="NEW_MENU">
            <option value="NEW_MENU">New Menu</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-soft" htmlFor="coverImage">
            Cover image URL
          </label>
          <input
            id="coverImage"
            name="coverImage"
            placeholder="/uploads/ube.png or https://…"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft" htmlFor="excerpt">
          Excerpt (short summary)
        </label>
        <input id="excerpt" name="excerpt" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft" htmlFor="body">
          Body
        </label>
        <textarea id="body" name="body" required rows={8} className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="published" defaultChecked />
        Publish immediately
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-accent px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save post"}
      </button>
    </form>
  );
}
