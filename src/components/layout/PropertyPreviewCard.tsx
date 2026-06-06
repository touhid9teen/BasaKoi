"use client";

import { useCallback } from "react";
import type { Property } from "@/types";

interface PropertyPreviewCardProps {
  property: Property;
  onClose: () => void;
}

const TENANT_BADGES: Record<string, { label: string; color: string }> = {
  family: { label: "👨‍👩‍👧‍👧 Family", color: "bg-blue-100 text-blue-700" },
  bachelor_male: { label: "👤 Bachelor", color: "bg-indigo-100 text-indigo-700" },
  bachelor_female: { label: "👩 Bachelor F", color: "bg-pink-100 text-pink-700" },
  any: { label: "🌟 Anyone", color: "bg-emerald-100 text-emerald-700" },
};

export default function PropertyPreviewCard({ property, onClose }: PropertyPreviewCardProps) {
  const handleCall = useCallback(() => {
    if (property.phone) window.location.href = `tel:${property.phone}`;
  }, [property.phone]);

  const handleWhatsApp = useCallback(() => {
    if (property.phone) {
      const text = encodeURIComponent(
        `Hi! I'm interested in "${property.title}" listed at ৳${property.rent_amount?.toLocaleString("en-BD")}/mo on BasaKoi.`
      );
      window.open(`https://wa.me/${property.phone.replace(/^0/, "88")}?text=${text}`, "_blank");
    }
  }, [property.phone]);

  const tenantBadge = property.tenant_type ? TENANT_BADGES[property.tenant_type] : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center">
      {/* Card — no backdrop, elevated shadow for professional look */}
      <div className="pointer-events-auto mx-4 mb-4 w-full max-w-lg rounded-2xl bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-all duration-300">
        {/* Top accent bar */}
        <div className="mx-auto h-1.5 w-16 rounded-full bg-emerald-400 mt-3 mb-2" />

        {/* ===== HEADER SECTION ===== */}
        <div className="px-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-gray-900 leading-snug flex-1">
              {property.title}
            </h3>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tags row */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {property.accommodation_type && (
              <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {property.accommodation_type === "full_flat" ? "🏢 Full Flat" : "🚪 Sublet Room"}
              </span>
            )}
            {tenantBadge && (
              <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${tenantBadge.color} border-current`}>
                {tenantBadge.label}
              </span>
            )}
          </div>

          {/* Rent */}
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-emerald-700">
              ৳{property.rent_amount?.toLocaleString("en-BD")}
            </span>
            <span className="text-sm font-medium text-gray-400">/mo</span>
          </div>
          {property.service_charge_included && (
            <p className="mt-0.5 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              All inclusive — service charge included
            </p>
          )}
        </div>

        {/* ===== SPECS GRID ===== */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-2">
            {property.bedrooms && (
              <div className="flex flex-col items-center rounded-xl bg-gray-50 px-1 py-2">
                <span className="text-lg">🛏️</span>
                <span className="mt-0.5 text-sm font-bold text-gray-900">{property.bedrooms}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bed</span>
              </div>
            )}
            {property.bathroom && (
              <div className="flex flex-col items-center rounded-xl bg-gray-50 px-1 py-2">
                <span className="text-lg">🚿</span>
                <span className="mt-0.5 text-sm font-bold text-gray-900">{property.bathroom}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bath</span>
              </div>
            )}
            {property.gas_type && property.gas_type !== "none" && (
              <div className="flex flex-col items-center rounded-xl bg-gray-50 px-1 py-2">
                <span className="text-lg">{property.gas_type === "natural" ? "🔥" : "🫧"}</span>
                <span className="mt-0.5 text-sm font-bold text-gray-900">{property.gas_type === "natural" ? "Gas" : "LPG"}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fuel</span>
              </div>
            )}
            {property.lift_available && (
              <div className="flex flex-col items-center rounded-xl bg-gray-50 px-1 py-2">
                <span className="text-lg">🛗</span>
                <span className="mt-0.5 text-sm font-bold text-gray-900">Yes</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lift</span>
              </div>
            )}

          </div>
        </div>

        {/* ===== DESCRIPTION + INSTRUCTIONS ===== */}
        {(property.description || property.special_instructions) && (
          <div className="px-5 py-3 border-b border-gray-100">
            {property.description && (
              <p className="text-sm leading-relaxed text-gray-700 font-medium">{property.description}</p>
            )}
            {property.special_instructions && (
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
                <p className="text-xs font-bold text-amber-800">📋 {property.special_instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== LOCATION + PHONE CONTACT ===== */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}</span>
          </div>
          {property.phone && (
            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-800">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span className="tracking-wide">{property.phone}</span>
            </div>
          )}
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="px-5 py-3.5 flex gap-3">
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/40 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call Owner
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-3.5 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
