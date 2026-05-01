"use client";

import React, { useState } from "react";
import StickerCard from "@/components/sticker/StickerCard";
import EmptyState from "@/components/common/EmptyState";
import AddStickerModal from "@/components/sticker/AddStickerModal";
import { Plus } from "lucide-react";

const GRID_CLASSES = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5";

function SectionHeader({ title, onAdd }) {
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

export default function StickerGrid({ collection, missingStickers = [] }) {
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showAddMissing, setShowAddMissing] = useState(false);
  const [localCollection, setLocalCollection] = useState(collection);
  const [localMissing, setLocalMissing] = useState(missingStickers);

  function handleAddToCollection(newItem) {
    setLocalCollection(prev => [...prev, newItem]);
  }

  function handleAddMissing(newItem) {
    setLocalMissing(prev => [...prev, { ...newItem, quantity: 0 }]);
  }

  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHeader title="Mi Colección" onAdd={() => setShowAddToCollection(true)} />
        {localCollection.length === 0 ? (
          <EmptyState
            message="Aún no tenés figuritas en tu colección."
            actionLabel="Añadir figuritas"
            onAction={() => setShowAddToCollection(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {localCollection.map(item => (
              <StickerCard key={item.sticker.number} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Figuritas Faltantes" onAdd={() => setShowAddMissing(true)} />
        {localMissing.length === 0 ? (
          <EmptyState
            message="No tenés figuritas faltantes registradas."
            actionLabel="Agregar faltante"
            onAction={() => setShowAddMissing(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {localMissing.map(item => (
              <StickerCard key={item.sticker.number} item={item} missing />
            ))}
          </div>
        )}
      </section>

      {showAddToCollection && (
        <AddStickerModal
          title="Agregar figurita a mi colección"
          onClose={() => setShowAddToCollection(false)}
          onSubmit={handleAddToCollection}
        />
      )}
      {showAddMissing && (
        <AddStickerModal
          title="Agregar figurita faltante"
          onClose={() => setShowAddMissing(false)}
          onSubmit={handleAddMissing}
        />
      )}
    </div>
  );
}
