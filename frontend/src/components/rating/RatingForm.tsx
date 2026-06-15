"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useCreateRatingMutation } from "@/store/api/ratingApi";

interface RatingFormProps {
  /** Id del usuario que va a ser calificado (reviewee). */
  revieweeId: string;
  /** Nombre a mostrar del usuario calificado. */
  revieweeName: string;
  /** Se llama cuando la valoración se envió con éxito. */
  onSubmitted?: () => void;
}

export default function RatingForm({ revieweeId, revieweeName, onSubmitted }: RatingFormProps) {
  const [score, setScore] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);
  const [createRating, { isLoading }] = useCreateRatingMutation();

  async function submit() {
    if (score < 1) return;
    try {
      await createRating({
        userId: revieweeId,
        score,
        comment: comment.trim() || undefined,
      }).unwrap();
      setDone(true);
      onSubmitted?.();
    } catch {
      alert("No se pudo enviar la valoración.");
    }
  }

  if (done) {
    return (
      <p className="text-xs font-semibold text-green-700 bg-green-50 rounded px-3 py-2">
        ¡Gracias por valorar a {revieweeName}!
      </p>
    );
  }

  const active = hover || score;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
      <span className="text-xs font-semibold text-slate-600">Calificar a {revieweeName}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
            aria-label={`${n} estrella${n !== 1 ? "s" : ""}`}
          >
            <Star
              size={20}
              className={n <= active ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Comentario (opcional)"
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20"
      />
      <button
        onClick={submit}
        disabled={score < 1 || isLoading}
        className="py-1.5 text-xs font-bold text-white bg-[#002B5E] hover:bg-[#003d85] rounded transition-colors disabled:opacity-40"
      >
        {isLoading ? "Enviando..." : "Enviar valoración"}
      </button>
    </div>
  );
}
