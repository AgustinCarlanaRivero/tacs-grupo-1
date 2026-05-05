"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import StickerGrid from "@/components/sticker/StickerGrid";
import { mockStickers, mockMissingStickers } from "@/data/mock-stickers";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader title="¡Hola, Coleccionista!" subtitle="Acá están tus figuritas del Mundial 2026." />
      <StickerGrid collection={mockStickers} missingStickers={mockMissingStickers} />
    </main>
  );
}
