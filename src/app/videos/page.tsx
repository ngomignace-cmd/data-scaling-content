"use client";

import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { VideoList } from "@/components/videos/video-list";

export default function VideosPage() {
  const handleSync = async () => {
    await fetch("/api/instagram/sync", { method: "POST" });
    window.location.reload();
  };

  return (
    <>
      <Header
        title="Vidéos"
        description="Gérez et publiez votre contenu Instagram"
        action={{
          label: "Sync Instagram",
          onClick: handleSync,
          icon: <RefreshCw className="h-4 w-4 mr-1" />,
        }}
      />
      <VideoList />
    </>
  );
}
