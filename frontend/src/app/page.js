import React from "react";
import StickerCard from "@/components/StickerCard";
import { mockStickers } from "@/data/mock-stickers";
import { Button } from "@/components/ui/button";

export default function Home() {
  const collection = mockStickers;
  
  const totalStickers = collection.length;
  const totalOwned = collection.filter(item => item.quantity > 0).length;
  const progress = Math.round((totalOwned / totalStickers) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1">Mundial 2026</h1>
          </div>
          <nav>
            <Button variant="outline" className="text-sm font-medium">
              Iniciar Sesión
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        {/* Dashboard/Stats */}
        <section className="my-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">¡Hola, Coleccionista!</h2>
              <p className="text-slate-500 mt-2 text-lg">Acá están tus figuritas del Mundial 2026.</p>
            </div>
          </div>
        </section>

        {/* Filters / Actions (Visual Mock) */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Mi Colección</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-slate-200 hover:bg-slate-300 text-slate-700">Todos</Button>
            <Button variant="ghost" size="sm" className="text-slate-500">Faltantes</Button>
            <Button variant="ghost" size="sm" className="text-slate-500">Repetidas</Button>
          </div>
        </div>

        {/* Sticker Grid */}
        {collection.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collection.map((item) => (
              <StickerCard key={item.sticker.number} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 mb-4">Aún no tienes figuritas en tu colección.</p>
            <Button className="bg-usa hover:bg-usa/90">Añadir figuritas</Button>
          </div>
        )}
      </main>
    </div>
  );
}
