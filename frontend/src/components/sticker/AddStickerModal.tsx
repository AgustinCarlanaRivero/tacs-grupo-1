"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

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
        formState: { errors },
    } = useForm<AddStickerFormValues>({
        resolver: addStickerFormResolver,
        defaultValues: {
            type: "REGULAR",
            quantity: 1,
        },
    });

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

                    <Button
                        type="submit"
                        className="w-full py-2.5 mt-2 bg-[#002B5E] hover:bg-[#003a7a] text-white font-bold text-sm uppercase tracking-wide"
                    >
                        Agregar figurita
                    </Button>
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
