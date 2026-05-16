"use client";

import React, { useState } from "react";
import ModalShell from "@/components/common/ModalShell";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import SelectableStickerOption from "@/components/sticker/SelectableStickerOption";
import { filterStickers } from "@/lib/utils";
import type { MockCollectionItem, MockSticker } from "@/data/types";

interface CreateTradeModalProps {
  myCollection: MockCollectionItem[];
  onClose: () => void;
  onSubmit: (sticker: MockSticker) => void;
}

export default function CreateTradeModal({
  myCollection,
  onClose,
  onSubmit,
}: CreateTradeModalProps) {
  const [selected, setSelected] = useState<MockSticker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const available = filterStickers(myCollection, searchQuery);

  return (
    <ModalShell
      title="Publicar intercambio"
      subtitle="Elegí la figurita que querés ofrecer"
      onClose={onClose}
    >
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        <div className="mb-4">
          <StickerSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        {available.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-base text-slate-500">
              {searchQuery
                ? "No se encontraron figuritas."
                : "No tenés figuritas disponibles."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {available.map((item) => (
              <SelectableStickerOption
                key={item.sticker.number}
                item={item}
                selected={selected?.number === item.sticker.number}
                onToggle={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 md:p-6 border-t border-slate-100">
        <button
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onSubmit(selected);
              onClose();
            }
          }}
          className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {selected ? `Publicar · ${selected.player.name}` : "Seleccioná una figurita"}
        </button>
      </div>
    </ModalShell>
  );
}
