import React from "react";

interface QuantityBadgeProps {
  quantity: number;
}

export default function QuantityBadge({ quantity }: QuantityBadgeProps) {
  if (quantity <= 1) return null;

  return (
    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white bg-gray-900 shadow-md z-30">
      x{quantity}
    </div>
  );
}
