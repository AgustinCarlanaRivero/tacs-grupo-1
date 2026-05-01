"use client";

import React, { useState } from "react";
import StickerCard from "@/components/StickerCard";
import EmptyState from "@/components/EmptyState";
import AddStickerModal from "@/components/AddStickerModal";
import { Plus } from "lucide-react";

const GRID_CLASSES = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5";

function SectionHeader({ title, count, onAdd, addLabel }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        {count !== undefined && (
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#002B5E] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <Plus size={16} strokeWidth={2.5} />
        {addLabel}
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
    setLocalCollection((prev) => [...prev, newItem]);
  }

  function handleAddMissing(newItem) {
    // Las faltantes siempre tienen quantity 0
    setLocalMissing((prev) => [...prev, { ...newItem, quantity: 0 }]);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* --- Mi Colección --- */}
      <section>
        <SectionHeader
          title="Mi Colección"
          count={localCollection.length}
          onAdd={() => setShowAddToCollection(true)}
          addLabel="Agregar"
        />

        {localCollection.length === 0 ? (
          <EmptyState
            message="Aún no tenés figuritas en tu colección."
            actionLabel="Añadir figuritas"
            onAction={() => setShowAddToCollection(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {localCollection.map((item) => (
              <StickerCard key={item.sticker.number} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* --- Figuritas Faltantes --- */}
      <section>
        <SectionHeader
          title="Figuritas Faltantes"
          count={localMissing.length}
          onAdd={() => setShowAddMissing(true)}
          addLabel="Agregar"
        />

        {localMissing.length === 0 ? (
          <EmptyState
            message="No tenés figuritas faltantes registradas."
            actionLabel="Agregar faltante"
            onAction={() => setShowAddMissing(true)}
          />
        ) : (
          <div className={GRID_CLASSES}>
            {localMissing.map((item) => (
              <StickerCard key={item.sticker.number} item={item} missing />
            ))}
          </div>
        )}
      </section>

      {/* --- Modales --- */}
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
