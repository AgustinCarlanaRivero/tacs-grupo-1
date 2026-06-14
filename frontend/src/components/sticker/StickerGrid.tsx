"use client";

import React, { useState } from "react";
import StickerCard from "@/components/sticker/StickerCard";
import EmptyState from "@/components/common/EmptyState";
import AddStickerModal, { type AddStickerSubmit } from "@/components/sticker/AddStickerModal";
import { Plus } from "lucide-react";
import type { MockCollectionItem } from "@/data/types";

const GRID_CLASSES =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5";

interface SectionHeaderProps {
  title: string;
  onAdd: () => void;
}

function SectionHeader({ title, onAdd }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#002B5E] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <Plus size={16} strokeWidth={2.5} />
        Agregar
      </button>
    </div>
  );
}

interface StickerGridProps {
  collection?: MockCollectionItem[];
  missingStickers?: MockCollectionItem[];
  onAddToCollection?: (item: AddStickerSubmit) => void;
  onAddMissing?: (item: AddStickerSubmit) => void;
  /** Habilita editar cantidad / eliminar en las tarjetas (colección propia). */
  editable?: boolean;
}

export default function StickerGrid({
  collection = [],
  missingStickers = [],
  onAddToCollection = () => {},
  onAddMissing = () => {},
  editable = false,
}: StickerGridProps) {
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showAddMissing, setShowAddMissing] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHeader title="Mi Colección" onAdd={() => setShowAddToCollection(true)} />
        {collection.length === 0 ? (
          <EmptyState
            message="Aún no tenés figuritas en tu colección."
            actionLabel="Añadir figuritas"
            onAction={() => setShowAddToCollection(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {collection.map((item) => (
              <StickerCard key={item.sticker.number} item={item} editable={editable} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Figuritas Faltantes" onAdd={() => setShowAddMissing(true)} />
        {missingStickers.length === 0 ? (
          <EmptyState
            message="No tenés figuritas faltantes registradas."
            actionLabel="Agregar faltante"
            onAction={() => setShowAddMissing(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {missingStickers.map((item) => (
              <StickerCard key={item.sticker.number} item={item} missing editable={editable} />
            ))}
          </div>
        )}
      </section>

      {showAddToCollection && (
        <AddStickerModal
          title="Agregar figurita a mi colección"
          onClose={() => setShowAddToCollection(false)}
          onSubmit={onAddToCollection}
        />
      )}
      {showAddMissing && (
        <AddStickerModal
          title="Agregar figurita faltante"
          onClose={() => setShowAddMissing(false)}
          onSubmit={onAddMissing}
        />
      )}
    </div>
  );
}
