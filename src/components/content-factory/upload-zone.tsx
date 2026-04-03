"use client";

import { useState, useCallback } from "react";
import { Upload, Film, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onTranscribe: (videoUrl: string) => Promise<void>;
}

export function UploadZone({ onTranscribe }: UploadZoneProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await onTranscribe(url.trim());
    } finally {
      setLoading(false);
    }
  }, [url, onTranscribe]);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Drop zone */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4">
          <Film className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">
            Glissez une vidéo ici ou entrez une URL
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MP4, MOV, WEBM — Max 500 Mo
          </p>
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <Input
            placeholder="https://... URL de la vidéo source"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={!url.trim() || loading}
            className="gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Transcrire
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
