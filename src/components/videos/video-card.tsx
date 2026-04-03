"use client";

import { Eye, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types/content";
import { POST_FORMAT_LABELS } from "@/lib/utils/constants";

interface VideoCardProps {
  post: Post;
  onPublish?: (postId: string) => void;
}

export function VideoCard({ post, onPublish }: VideoCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] max-h-48 bg-muted flex items-center justify-center">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground text-sm">Pas de preview</div>
        )}
        <Badge
          className="absolute top-2 left-2"
          variant={post.status === "published" ? "default" : "secondary"}
        >
          {post.status === "published" ? "Publié" : post.status === "draft" ? "Brouillon" : post.status}
        </Badge>
        <Badge className="absolute top-2 right-2" variant="outline">
          {POST_FORMAT_LABELS[post.format] ?? post.format}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-3">
          {post.title}
        </h3>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.views.toLocaleString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {post.likes.toLocaleString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {post.comments.toLocaleString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            {post.saves.toLocaleString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {post.shares.toLocaleString("fr-FR")}
          </div>
          <div className="flex items-center gap-1 text-emerald-500 font-medium">
            {post.leads_generated} leads
          </div>
        </div>

        {/* Publish button */}
        {post.status === "draft" && onPublish && (
          <button
            onClick={() => onPublish(post.id)}
            className="mt-3 w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Push to Instagram
          </button>
        )}
      </CardContent>
    </Card>
  );
}
