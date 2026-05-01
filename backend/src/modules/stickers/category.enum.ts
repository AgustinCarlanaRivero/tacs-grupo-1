export const StickerTags = {
  REGULAR: "REGULAR",
  SHINY: "SHINY",
  NUEVO: "NUEVO",
  USADO: "USADO",
  DAÑADO: "DAÑADO"
} as const;

export type StickerTag = typeof StickerTags[keyof typeof StickerTags];

// Grupos mutuamente excluyentes
export const TYPE_TAGS: StickerTag[] = [StickerTags.REGULAR, StickerTags.SHINY];
export const CONDITION_TAGS: StickerTag[] = [StickerTags.NUEVO, StickerTags.USADO];