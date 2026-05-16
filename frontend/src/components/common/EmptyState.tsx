import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message = "No hay contenido disponible.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-white border border-dashed border-slate-200">
      <p className="text-slate-500 mb-4">{message}</p>
      {actionLabel && (
        <Button onClick={onAction} className="bg-slate-800 hover:bg-slate-700 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
