"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
    useCreateTemplateMutation,
    useGetTemplatesQuery,
} from "@/store/api/templateApi";

const addStickerFormSchema = z.object({
    number: z
        .number()
        .int("Ingresá un número entero")
        .positive("El número debe ser positivo"),
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
    quantity: z
        .number()
        .int("Ingresá una cantidad entera")
        .positive("La cantidad debe ser positiva"),
});

type AddStickerFormValues = z.infer<typeof addStickerFormSchema>;
const addStickerFormResolver = zodResolver(
    addStickerFormSchema as never
) as Resolver<AddStickerFormValues>;

export interface AddStickerSubmit {
    sticker: {
        number: number;
        player: {
            name: string;
            nationalTeam: { name: string } | null;
            club: { name: string } | null;
            image: string | null;
        };
        type: AddStickerFormValues["type"];
    };
    quantity: number;
}

interface AddStickerModalProps {
    title: ReactNode;
    onClose: () => void;
    onSubmit: (item: AddStickerSubmit) => void;
}

export default function AddStickerModal({
    title,
    onClose,
    onSubmit,
}: AddStickerModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = useForm<AddStickerFormValues>({
        resolver: addStickerFormResolver,
        defaultValues: {
            type: "REGULAR",
            quantity: 1,
        },
    });

    const { data: templates = [] } = useGetTemplatesQuery();
    const [createTemplate, { isLoading: isSavingTemplate }] = useCreateTemplateMutation();

    function applyTemplate(templateId: string) {
        const template = templates.find((t) => t._id === templateId);
        if (!template) return;
        const { sticker } = template;
        reset({
            number: sticker.number,
            playerName: sticker.player.name,
            nationalTeam: sticker.player.nationalTeam?.name ?? "",
            club: sticker.player.club?.name ?? "",
            imageUrl: sticker.player.image ?? "",
            type: sticker.type,
            quantity: 1,
        });
    }

    async function saveAsTemplate() {
        const values = getValues();
        if (!values.number || !values.playerName?.trim()) {
            alert("Completá al menos el número y el nombre del jugador para guardar la plantilla.");
            return;
        }
        const name = window.prompt("Nombre de la plantilla", values.playerName.trim());
        if (!name?.trim()) return;

        const nationalTeam = values.nationalTeam?.trim();
        const club = values.club?.trim();
        const imageUrl = values.imageUrl?.trim();
        try {
            await createTemplate({
                name: name.trim(),
                sticker: {
                    number: values.number,
                    state: "NEW",
                    type: values.type,
                    description: "",
                    player: {
                        name: values.playerName.trim(),
                        nationalTeam: nationalTeam ? { name: nationalTeam } : null,
                        club: club ? { name: club } : null,
                        image: imageUrl ? imageUrl : null,
                    },
                },
            }).unwrap();
        } catch {
            alert("No se pudo guardar la plantilla. Intentá nuevamente.");
        }
    }

    function submitForm(values: AddStickerFormValues) {
        const nationalTeam = values.nationalTeam?.trim();
        const club = values.club?.trim();
        const imageUrl = values.imageUrl?.trim();

        onSubmit({
            sticker: {
                number: values.number,
                player: {
                    name: values.playerName.trim(),
                    nationalTeam: nationalTeam ? { name: nationalTeam } : null,
                    club: club ? { name: club } : null,
                    image: imageUrl ? imageUrl : null,
                },
                type: values.type,
            },
            quantity: values.quantity,
        });
        onClose();
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
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(submitForm)}
                    className="p-5 flex flex-col gap-4"
                >
                    {templates.length > 0 && (
                        <FormField label="Usar plantilla">
                            <select
                                defaultValue=""
                                onChange={(e) => applyTemplate(e.target.value)}
                                className="form-input"
                            >
                                <option value="">Elegí una plantilla...</option>
                                {templates.map((t) => (
                                    <option key={t._id} value={t._id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    )}

                    <FormField
                        label="Número de figurita"
                        required
                        error={errors.number?.message}
                    >
                        <input
                            type="number"
                            min="1"
                            {...register("number", { valueAsNumber: true })}
                            placeholder="Ej: 10"
                            className="form-input"
                        />
                    </FormField>

                    <FormField
                        label="Nombre del jugador"
                        required
                        error={errors.playerName?.message}
                    >
                        <input
                            type="text"
                            {...register("playerName")}
                            placeholder="Ej: Lionel Messi"
                            className="form-input"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Selección"
                            error={errors.nationalTeam?.message}
                        >
                            <input
                                type="text"
                                {...register("nationalTeam")}
                                placeholder="Ej: Argentina"
                                className="form-input"
                            />
                        </FormField>
                        <FormField label="Club" error={errors.club?.message}>
                            <input
                                type="text"
                                {...register("club")}
                                placeholder="Ej: Inter Miami"
                                className="form-input"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="URL de imagen"
                        error={errors.imageUrl?.message}
                    >
                        <input
                            type="url"
                            {...register("imageUrl")}
                            placeholder="https://..."
                            className="form-input"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Categoría"
                            error={errors.type?.message}
                        >
                            <select
                                {...register("type")}
                                className="form-input"
                            >
                                <option value="REGULAR">Regular</option>
                                <option value="SHINY">Shiny ✦</option>
                            </select>
                        </FormField>
                        <FormField
                            label="Cantidad"
                            error={errors.quantity?.message}
                        >
                            <input
                                type="number"
                                min="1"
                                {...register("quantity", {
                                    valueAsNumber: true,
                                })}
                                className="form-input"
                            />
                        </FormField>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <Button
                            type="submit"
                            className="w-full py-2.5 bg-[#002B5E] hover:bg-[#003a7a] text-white font-bold text-sm uppercase tracking-wide"
                        >
                            Agregar figurita
                        </Button>
                        <button
                            type="button"
                            onClick={saveAsTemplate}
                            disabled={isSavingTemplate}
                            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#002B5E] bg-slate-100 hover:bg-slate-200 rounded transition-colors disabled:opacity-40"
                        >
                            <Save size={14} />
                            Guardar como plantilla
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface FormFieldProps {
    label: ReactNode;
    required?: boolean;
    error?: string;
    children: ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
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
