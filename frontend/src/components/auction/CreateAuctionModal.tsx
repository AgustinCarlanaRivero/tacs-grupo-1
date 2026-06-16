"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Resolver,
  type UseFormRegister,
} from "react-hook-form";
import ModalShell from "@/components/common/ModalShell";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import SelectableStickerOption from "@/components/sticker/SelectableStickerOption";
import { filterStickers } from "@/lib/utils";
import type { MockCollectionItem, MockSticker } from "@/data/types";
import {
  auctionPostCreateRequestSchema,
  type PostCreateRequest,
} from "@/lib/schemas/postSchema";

const DURATIONS: Array<{ label: string; hours: number }> = [
  { label: "1 hora", hours: 1 },
  { label: "6 horas", hours: 6 },
  { label: "24 horas", hours: 24 },
  { label: "48 horas", hours: 48 },
];

const STEP_LABELS = ["Figurita", "Mínimo", "Duración"];

type AuctionFormValues = Extract<PostCreateRequest, { type: "AUCTION" }>;

const auctionFormResolver = zodResolver(
  auctionPostCreateRequestSchema as never
) as Resolver<AuctionFormValues>;

function getEndsAtIso(durationHours: number) {
  return new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
}

interface StepStickerProps {
  myCollection: MockCollectionItem[];
  selected: MockSticker | null;
  selectedQuantity: number;
  onSelect: (sticker: MockSticker) => void;
  onQuantityChange: (sticker: MockSticker, quantity: number) => void;
}

function StepSticker({
  myCollection,
  selected,
  selectedQuantity,
  onSelect,
  onQuantityChange,
}: StepStickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const available = filterStickers(myCollection, searchQuery);

  return (
    <div className="flex flex-col gap-4">
      <StickerSearchInput value={searchQuery} onChange={setSearchQuery} />
      {available.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-base text-slate-500 text-center">
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
              onToggle={onSelect}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StepMinimumRequirementProps {
  register: UseFormRegister<AuctionFormValues>;
  error?: string;
}

function StepMinimumRequirement({
  register,
  error,
}: StepMinimumRequirementProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Indicá cuántas figuritas como mínimo debe incluir cada oferta.
      </p>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Mínimo requerido
        </span>
        <input
          type="number"
          min="1"
          {...register("minimumRequirement", { valueAsNumber: true })}
          className="form-input"
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </label>
    </div>
  );
}

interface StepDurationProps {
  duration: number;
  onSelect: (hours: number) => void;
}

function StepDuration({ duration, onSelect }: StepDurationProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">¿Cuánto tiempo estará activa la subasta?</p>
      <div className="grid grid-cols-2 gap-3">
        {DURATIONS.map((d) => (
          <button
            type="button"
            key={d.hours}
            onClick={() => onSelect(d.hours)}
            className={`flex flex-col items-center justify-center gap-2 py-8 border-2 rounded-2xl transition-all ${
              duration === d.hours
                ? "border-[#002B5E] bg-blue-50 text-[#002B5E]"
                : "border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <Clock
              size={22}
              className={duration === d.hours ? "text-[#002B5E]" : "text-slate-400"}
            />
            <span className="font-bold text-base">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface CreateAuctionModalProps {
  myCollection: MockCollectionItem[];
  onClose: () => void;
  onSubmit: (payload: PostCreateRequest) => void | Promise<void>;
}

export default function CreateAuctionModal({
  myCollection,
  onClose,
  onSubmit,
}: CreateAuctionModalProps) {
  const [step, setStep] = useState<number>(1);
  const [duration, setDuration] = useState<number>(24);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuctionFormValues>({
    resolver: auctionFormResolver,
    defaultValues: {
      type: "AUCTION",
      stickerId: 0,
      quantity: 1,
      endsAt: getEndsAtIso(duration),
      minimumRequirement: 1,
    },
  });

  // react-hook-form's watch() no se puede memoizar; el React Compiler hace
  // bailout de este componente a propósito.
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStickerId = watch("stickerId");
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedQuantity = watch("quantity");
  const minimumRequirement = watch("minimumRequirement");
  const selectedSticker =
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

  function selectDuration(hours: number) {
    setDuration(hours);
    setValue("endsAt", getEndsAtIso(hours), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitForm(values: AuctionFormValues) {
    await onSubmit({
      ...values,
      endsAt: getEndsAtIso(duration),
    });
  }

  const canNext =
    step === 1
      ? !!selectedSticker
      : step === 2
        ? Number.isInteger(minimumRequirement) && minimumRequirement > 0
        : true;

  return (
    <ModalShell
      title="Publicar subasta"
      subtitle={`Paso ${step} de 3 · ${STEP_LABELS[step - 1]}`}
      onClose={onClose}
    >
      <div className="flex gap-1.5 px-4 pt-3 pb-1 shrink-0">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${
              s <= step ? "bg-[#002B5E]" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {step === 1 && (
          <StepSticker
            myCollection={myCollection}
            selected={selectedSticker}
            selectedQuantity={selectedQuantity}
            onSelect={selectSticker}
            onQuantityChange={changeQuantity}
          />
        )}
        {step === 2 && (
          <StepMinimumRequirement
            register={register}
            error={errors.minimumRequirement?.message}
          />
        )}
        {step === 3 && (
          <StepDuration duration={duration} onSelect={selectDuration} />
        )}
      </div>

      <div className="shrink-0 p-4 md:p-6 border-t border-slate-100 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-3 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          disabled={!canNext || isSubmitting}
          onClick={() =>
            step < 3 ? setStep((s) => s + 1) : void handleSubmit(submitForm)()
          }
          className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {step < 3
            ? "Siguiente"
            : isSubmitting
              ? "Publicando..."
              : "Publicar subasta"}
        </button>
      </div>
    </ModalShell>
  );
}
