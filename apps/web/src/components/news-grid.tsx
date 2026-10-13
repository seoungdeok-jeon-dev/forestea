"use client";

import { useRef } from "react";
import { PostCard, type PostCardData } from "@/components/post-card";
import { useRevealOnScroll } from "@/components/menu-item-card";

export function NewsGrid({ posts }: { posts: PostCardData[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(gridRef, [posts.length]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 xl:grid-cols-4"
    >
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          revealDelayMs={Math.min(index * 70, 280)}
        />
      ))}
    </div>
  );
}
