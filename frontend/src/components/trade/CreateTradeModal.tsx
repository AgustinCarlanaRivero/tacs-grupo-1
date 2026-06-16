"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import ModalShell from "@/components/common/ModalShell";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import SelectableStickerOption from "@/components/sticker/SelectableStickerOption";
import { filterStickers } from "@/lib/utils";
import type { MockCollectionItem, MockSticker } from "@/data/types";
import {
  directTradePostCreateRequestSchema,
  type PostCreateRequest,
} from "@/lib/schemas/postSchema";

type TradeFormValues = Extract<PostCreateRequest, { type: "DIRECT_TRADE" }>;

const tradeFormResolver = zodResolver(
  directTradePostCreateRequestSchema as never
) as Resolver<TradeFormValues>;

interface CreateTradeModalProps {
  myCollection: MockCollectionItem[];
  onClose: () => void;
  onSubmit: (payload: PostCreateRequest) => void | Promise<void>;
}

export default function CreateTradeModal({
  myCollection,
  onClose,
  onSubmit,
}: CreateTradeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    resolver: tradeFormResolver,
    defaultValues: {
      type: "DIRECT_TRADE",
      stickerId: 0,
      quantity: 1,
    },
  });

  const available = filterStickers(myCollection, searchQuery);
  // react-hook-form's watch() no se puede memoizar; el React Compiler hace
  // bailout de este componente a propósito.
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStickerId = watch("stickerId");
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedQuantity = watch("quantity");
  const selected =
    myCollection.find((item) => item.sticker.number === selectedStickerId)
      ?.sticker ?? null;

  function selectSticker(sticker: MockSticker) {
    setValue("stickerId", sticker.number, {
      shouldDirty: true,
      shouldValidate: true,
    });
    // Al cambiar de figurita, la cantidad vuelve a 1.
    setValue("quantity", 1, { shouldDirty: true, shouldValidate: true });
  }

  function changeQuantity(_sticker: MockSticker, quantity: number) {
    setValue("quantity", quantity, { shouldDirty: true, shouldValidate: true });
  }

  async function submitForm(values: TradeFormValues) {
    await onSubmit(values);
  }

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
                selectedQuantity={
                  selected?.number === item.sticker.number ? selectedQuantity : 1
                }
                onToggle={selectSticker}
                onQuantityChange={changeQuantity}
              />
            ))}
          </div>
        )}
        {errors.stickerId && (
          <p className="mt-3 text-xs text-red-500">
            Seleccioná una figurita para publicar.
          </p>
        )}
      </div>

      <div className="shrink-0 p-4 md:p-6 border-t border-slate-100">
        <button
          type="button"
          disabled={!selected || isSubmitting}
          onClick={() => void handleSubmit(submitForm)()}
          className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting
            ? "Publicando..."
            : selected
              ? `Publicar · ${selected.player.name}`
              : "Seleccioná una figurita"}
        </button>
      </div>
    </ModalShell>
  );
}
