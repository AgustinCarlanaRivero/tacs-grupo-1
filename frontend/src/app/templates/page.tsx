"use client";

import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import RequireAuth from "@/components/layout/RequireAuth";
import EmptyState from "@/components/common/EmptyState";
import TemplateFormModal from "@/components/template/TemplateFormModal";
import Toast, { type ToastVariant } from "@/components/common/Toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useGetTemplatesQuery,
  useDeleteTemplateMutation,
  type TemplateDTO,
} from "@/store/api/templateApi";

function TemplatesContent() {
  const { data: templates = [], isLoading } = useGetTemplatesQuery();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TemplateDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  async function handleDelete(template: TemplateDTO) {
    if (!window.confirm(`¿Eliminar la plantilla "${template.name}"?`)) return;
    try {
      await deleteTemplate(template._id).unwrap();
      setToast({ message: `Plantilla "${template.name}" eliminada.`, variant: "success" });
    } catch {
      setToast({ message: "No se pudo eliminar la plantilla.", variant: "error" });
    }
  }

  return (
    <main className="container mx-auto px-4 pb-24 max-w-2xl">
      <PageHeader
        title="Mis plantillas"
        subtitle="Guardá datos de figuritas para reutilizarlos al cargar tu colección."
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#002B5E] hover:bg-[#003a7a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Nueva plantilla
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          message="No tenés plantillas todavía."
          actionLabel="Crear plantilla"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="font-bold text-slate-800">{template.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  #{template.sticker.number} · {template.sticker.player.name}
                  {template.sticker.player.nationalTeam?.name
                    ? ` · ${template.sticker.player.nationalTeam.name}`
                    : ""}
                  {template.sticker.type === "SHINY" ? " · ✦ Shiny" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditing(template)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(template)}
                  className="p-2 text-[#BF0A30] hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <TemplateFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={(message) => setToast({ message, variant: "success" })}
        />
      )}
      {editing && (
        <TemplateFormModal
          template={editing}
          onClose={() => setEditing(null)}
          onSuccess={(message) => setToast({ message, variant: "success" })}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

export default function TemplatesPage() {
  return (
    <RequireAuth>
      <TemplatesContent />
    </RequireAuth>
  );
}
