"use client";

import { useRef } from "react";
import { PostCard, type PostCardData } from "@/components/post-card";
import { useRevealOnScroll } from "@/components/menu-item-card";

export function NewsGrid({ posts }: { posts: PostCardData[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(rootRef, [posts.length]);

  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <div ref={rootRef} className="space-y-16 md:space-y-20">
      {featured ? (
        <PostCard post={featured} variant="feature" revealDelayMs={0} />
      ) : null}

      {rest.length > 0 ? (
        <div>
          <p className="mb-2 text-[0.68rem] font-medium tracking-[0.18em] text-ink-muted">
            Earlier
          </p>
          <div className="border-b border-black/5">
            {rest.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                variant="row"
                revealDelayMs={Math.min(40 + index * 50, 220)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
