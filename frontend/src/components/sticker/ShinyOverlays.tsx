import React from "react";

export default function ShinyOverlays() {
  return (
    <>
      {/* Golden tint */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-700/20"></div>

      {/* Sparkle dots */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,220,0.9) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      ></div>

      {/* Continuous sweep shine */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
          animation: "shineSweep 3s ease-in-out infinite",
        }}
      ></div>
    </>
  );
}
