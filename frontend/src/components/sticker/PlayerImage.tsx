import React from "react";

interface PlayerImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export default function PlayerImage({ src, alt, className = "" }: PlayerImageProps) {
  return (
    <img
      src={src || "/placeholder.png"}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover object-top ${className}`}
    />
  );
}
