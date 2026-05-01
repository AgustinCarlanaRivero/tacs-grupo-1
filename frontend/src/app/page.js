import React from "react";
import PageHeader from "@/components/common/PageHeader";
import StickerGrid from "@/components/sticker/StickerGrid";
import { mockStickers, mockMissingStickers } from "@/data/mock-stickers";

export default function Home() {
  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader title="¡Hola, Coleccionista!" subtitle="Acá están tus figuritas del Mundial 2026." />
      <StickerGrid collection={mockStickers} missingStickers={mockMissingStickers} />
    </main>
  );
}
