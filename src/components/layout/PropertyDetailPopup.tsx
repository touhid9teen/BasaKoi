"use client";

import type { Property } from "@/types";

interface PropertyDetailPopupProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetailPopup({
  property,
  onClose,
}: PropertyDetailPopupProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-6 sm:items-center sm:pb-0">
      {/* Backdrop */}
      <div
        className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="pointer-events-auto relative mx-4 w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-400 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-gray-800 line-clamp-2">{property.title}</h3>
            {property.status === "rented_out" && (
              <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">Rented</span>
            )}
          </div>

          {/* Rent */}
          <p className="mb-4 text-3xl font-bold tracking-tight text-emerald-600">
            ৳{property.rent_amount?.toLocaleString("en-BD")}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>

          {/* Details row */}
          <div className="mb-4 flex flex-wrap gap-2">
            {property.bedrooms && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
                {property.bedrooms} Bed
              </span>
            )}
            {property.bachelor_allowed !== null && (
              <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${
                property.bachelor_allowed
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              }`}>
                {property.bachelor_allowed ? "✓ Bachelor OK" : "✗ Family Only"}
              </span>
            )}
            {property.gas_type && property.gas_type !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                🏠 {property.gas_type === "natural" ? "Natural Gas" : "LPG"}
              </span>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-3">{property.description}</p>
          )}

          {/* Address */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}
            </span>
            <span>{new Date(property.created_at).toLocaleDateString("en-BD")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
