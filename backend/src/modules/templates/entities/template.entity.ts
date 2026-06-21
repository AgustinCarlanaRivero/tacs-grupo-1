import { Sticker } from "../../stickers/entities/sticker.entity";

/**
 * Template: Autocompletado/template de un sticker
 * Permite guardar los datos de un sticker conocido para reutilizarlos rápidamente
 * Ejemplo: Guardar los datos de Messi, luego reutilizarlos como base para crear otro sticker
 */
export class Template {
  _id?: string;
  name: string; // Nombre descriptivo del template (ej: "Messi NEW")
  sticker: Sticker; // El sticker del que es template
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    sticker: Sticker,
    userId: string,
    _id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this._id = _id;
    this.name = name;
    this.sticker = sticker;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
