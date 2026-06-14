"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  type TemplateDTO,
} from "@/store/api/templateApi";

const templateFormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre para la plantilla"),
  number: z.number().int("Ingresá un número entero").positive("El número debe ser positivo"),
  playerName: z.string().trim().min(1, "Ingresá el nombre del jugador"),
  nationalTeam: z.string().trim().optional(),
  club: z.string().trim().optional(),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Ingresá una URL válida")
    .optional(),
  type: z.enum(["REGULAR", "SHINY"]),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;
const resolver = zodResolver(templateFormSchema as never) as Resolver<TemplateFormValues>;

interface TemplateFormModalProps {
  template?: TemplateDTO;
  onClose: () => void;
}

export default function TemplateFormModal({ template, onClose }: TemplateFormModalProps) {
  const isEdit = !!template;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver,
    defaultValues: template
      ? {
          name: template.name,
          number: template.sticker.number,
          playerName: template.sticker.player.name,
          nationalTeam: template.sticker.player.nationalTeam?.name ?? "",
          club: template.sticker.player.club?.name ?? "",
          imageUrl: template.sticker.player.image ?? "",
          type: template.sticker.type,
        }
      : { type: "REGULAR" },
  });

  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const isSaving = isCreating || isUpdating;

  async function submitForm(values: TemplateFormValues) {
    const nationalTeam = values.nationalTeam?.trim();
    const club = values.club?.trim();
    const imageUrl = values.imageUrl?.trim();
    const sticker = {
      number: values.number,
      state: "NEW" as const,
      type: values.type,
      description: "",
      player: {
        name: values.playerName.trim(),
        nationalTeam: nationalTeam ? { name: nationalTeam } : null,
        club: club ? { name: club } : null,
        image: imageUrl ? imageUrl : null,
      },
    };
    try {
      if (template) {
        await updateTemplate({ templateId: template._id, name: values.name.trim(), sticker }).unwrap();
      } else {
        await createTemplate({ name: values.name.trim(), sticker }).unwrap();
      }
      onClose();
    } catch {
      alert("No se pudo guardar la plantilla. Intentá nuevamente.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">
            {isEdit ? "Editar plantilla" : "Nueva plantilla"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="p-5 flex flex-col gap-4">
          <Field label="Nombre de la plantilla" required error={errors.name?.message}>
            <input type="text" {...register("name")} placeholder="Ej: Messi NEW" className="form-input" />
          </Field>

          <Field label="Número de figurita" required error={errors.number?.message}>
            <input
              type="number"
              min="1"
              {...register("number", { valueAsNumber: true })}
              placeholder="Ej: 10"
              className="form-input"
            />
          </Field>

          <Field label="Nombre del jugador" required error={errors.playerName?.message}>
            <input type="text" {...register("playerName")} placeholder="Ej: Lionel Messi" className="form-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Selección" error={errors.nationalTeam?.message}>
              <input type="text" {...register("nationalTeam")} placeholder="Ej: Argentina" className="form-input" />
            </Field>
            <Field label="Club" error={errors.club?.message}>
              <input type="text" {...register("club")} placeholder="Ej: Inter Miami" className="form-input" />
            </Field>
          </div>

          <Field label="URL de imagen" error={errors.imageUrl?.message}>
            <input type="url" {...register("imageUrl")} placeholder="https://..." className="form-input" />
          </Field>

          <Field label="Categoría" error={errors.type?.message}>
            <select {...register("type")} className="form-input">
              <option value="REGULAR">Regular</option>
              <option value="SHINY">Shiny ✦</option>
            </select>
          </Field>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 mt-2 bg-[#002B5E] hover:bg-[#003a7a] text-white font-bold text-sm uppercase tracking-wide disabled:opacity-40"
          >
            {isSaving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear plantilla"}
          </Button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
