import React from "react";

export default function PlayerImage({ src, alt, className = "" }) {
  return (
    <img
      src={src || "/placeholder.png"}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover object-top ${className}`}
    />
  );
}
