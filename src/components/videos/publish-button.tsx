"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishButtonProps {
  postId: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function PublishButton({ postId, disabled, onSuccess }: PublishButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      if (res.ok) {
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePublish}
      disabled={disabled || loading}
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Upload className="h-3 w-3" />
      )}
      Push to Instagram
    </Button>
  );
}
