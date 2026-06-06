"use client";

/**
 * Fixed crosshair displayed in the exact center of the map.
 * The user pans the map to position this crosshair over their desired location,
 * then clicks confirm to drop a pin at `map.getCenter()`.
 */
export default function Crosshair() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {/* Outer ring for visibility */}
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-emerald-400/60" />

        {/* Inner circle */}
        <div className="absolute h-8 w-8 rounded-full border-2 border-white shadow-lg shadow-black/40" />

        {/* Center dot */}
        <div className="absolute h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />

        {/* Crosshair lines */}
        <div className="absolute h-10 w-0.5 rounded-full bg-white/70 shadow-sm" />
        <div className="absolute w-10 h-0.5 rounded-full bg-white/70 shadow-sm" />
      </div>

      {/* Label */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Drag map to position pin
      </div>
    </div>
  );
}
