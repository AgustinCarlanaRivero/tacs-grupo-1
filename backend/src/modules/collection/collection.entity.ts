import { CollectionItem } from "./collection-item.interface"
import { Sticker } from "../stickers/sticker.entity"
import { BadRequestError, NotFoundError } from "../../shared/errors/http-errors"

export class Collection {
  items: CollectionItem[]
  missingStickers: Sticker[]

  constructor(items: CollectionItem[] = [], missingStickers: Sticker[] = []) {
    this.items = items
    this.missingStickers = missingStickers
  }

  /**
   * Obtiene un item de la coleccion por sticker ID
   */
  getItemByStickerId(stickerId: number): CollectionItem | undefined {
    return this.items.find(item => item.sticker.number === stickerId)
  }

  /**
   * Verifica si posee una figurita
   */
  hasSticker(stickerId: number): boolean {
    return !!this.getItemByStickerId(stickerId)
  }

  /**
   * Obtiene la cantidad de una figurita
   */
  getQuantity(stickerId: number): number {
    return this.getItemByStickerId(stickerId)?.quantity || 0
  }

  /**
   * Agregar un item a la coleccion
   */
  addItem(collectionItem: CollectionItem): void {
    const existing = this.getItemByStickerId(collectionItem.sticker.number)
    if (existing) {
      existing.quantity += collectionItem.quantity
    } else {
      this.items.push(collectionItem)
    }
  }

  /**
   * Actualizar la cantidad de un item
   */
  updateItemQuantity(stickerId: number, newQuantity: number): void {
    if (newQuantity < 0) {
      throw new BadRequestError("Quantity cannot be negative")
    }
    const item = this.getItemByStickerId(stickerId)
    if (!item) {
      throw new NotFoundError(`Sticker #${stickerId} not in collection`)
    }
    item.quantity = newQuantity
  }

  /**
   * Eliminar un item de la coleccion
   */
  removeItem(stickerId: number): void {
    const index = this.items.findIndex(item => item.sticker.number === stickerId)
    if (index === -1) {
      throw new NotFoundError(`Sticker #${stickerId} not in collection`)
    }
    this.items.splice(index, 1)
  }

  /**
   * Verifica si una figurita esta en la lista de faltantes
   */
  isMissing(stickerId: number): boolean {
    return this.missingStickers.some(s => s.number === stickerId)
  }

  /**
   * Agregar una figurita a la lista de faltantes
   */
  addMissing(sticker: Sticker): void {
    if (!this.isMissing(sticker.number)) {
      this.missingStickers.push(sticker)
    }
  }

  /**
   * Eliminar una figurita de la lista de faltantes
   */
  removeMissing(stickerId: number): void {
    const index = this.missingStickers.findIndex(s => s.number === stickerId)
    if (index === -1) {
      throw new NotFoundError(`Sticker #${stickerId} not in missing list`)
    }
    this.missingStickers.splice(index, 1)
  }

  /**
   * Obtiene el total de figuritas unicas poseidas
   */
  getTotalUnique(): number {
    return this.items.length
  }

  /**
   * Obtiene el total de figuritas (contando cantidad)
   */
  getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * Obtiene el total de figuritas faltantes
   */
  getTotalMissing(): number {
    return this.missingStickers.length
  }

  /**
   * Calcula el progreso de completitud (%)
   */
  getProgress(totalStickers: number): number {
    if (totalStickers === 0) return 0
    return Math.round((this.getTotalUnique() / totalStickers) * 100)
  }

  /**
   * Verifica si la coleccion esta completa
   */
  isComplete(totalStickers: number): boolean {
    return this.getTotalUnique() === totalStickers && this.getTotalMissing() === 0
  }
}
