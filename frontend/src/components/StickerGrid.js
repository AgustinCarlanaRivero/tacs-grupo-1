import React from "react";
import StickerCard from "@/components/StickerCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const FILTERS = ["Todos", "Faltantes", "Repetidas"];

export default function StickerGrid({ collection }) {
  if (collection.length === 0) {
    return <EmptyState message="Aún no tenés figuritas en tu colección." actionLabel="Añadir figuritas" />;
  }

  return (
    <section>
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Mi Colección</h3>
        <div className="flex gap-2">
          {FILTERS.map((label, i) => (
            <Button
              key={label}
              variant={i === 0 ? "secondary" : "ghost"}
              size="sm"
              className={i === 0 ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "text-slate-500"}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {collection.map((item) => (
          <StickerCard key={item.sticker.number} item={item} />
        ))}
      </div>
    </section>
  );
}
