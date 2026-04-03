"use client";

import { useState, useEffect } from "react";
import { VideoCard } from "./video-card";
import type { Post } from "@/types/content";

export function VideoList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/leads"); // TODO: create /api/posts endpoint
        if (res.ok) {
          setPosts(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handlePublish = async (postId: string) => {
    const res = await fetch("/api/instagram/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, status: "published" as const } : p
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Aucune vidéo</p>
        <p className="text-sm mt-1">
          Synchronisez vos insights Instagram ou uploadez du contenu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <VideoCard key={post.id} post={post} onPublish={handlePublish} />
      ))}
    </div>
  );
}
