"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  GeoLocation,
  GasType,
  AccommodationType,
  TenantType,
} from "@/types";

type AddStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface AddRentOverlayProps {
  selectedLocation: GeoLocation | null;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    accommodation_type: AccommodationType;
    rent_amount: number;
    service_charge_included: boolean;
    tenant_type: TenantType;
    gas_type: GasType;
    lift_available: boolean;
    bedrooms: number;
    bathroom: number;
    description: string;
    phone: string;
    special_instructions: string;
    available_from?: string;
  }) => Promise<void>;
  onSearchLocation: (query: string) => Promise<GeoLocation | null>;
  onFlyToLocation: (location: GeoLocation) => void;
  onMarkerFade?: (fade: boolean) => void;
}

/* ---------- Step label map ---------- */
const STEP_LABELS: Record<AddStep, string> = {
  1: "Pin the Location",
  2: "Accommodation Type",
  3: "Target Audience",
  4: "Monthly Rent",
  5: "Room Configuration",
  6: "Utilities",
  7: "Phone Number",
  8: "Photos & Publish",
};

const STEP_ICONS: Record<AddStep, string> = {
  1: "📍",
  2: "🏠",
  3: "👥",
  4: "💰",
  5: "🛏️",
  6: "⚡",
  7: "📞",
  8: "📸",
};

/* ---------- Validate Bangladeshi phone ---------- */
function isValidBangladeshiPhone(num: string): boolean {
  return /^01[3-9]\d{8}$/.test(num.replace(/\s/g, ""));
}

/* ---------- Spring animation helper (inline style) ---------- */
function springScale(active: boolean): React.CSSProperties {
  return {
    transform: active ? "scale(1.05)" : "scale(1)",
    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };
}

export default function AddRentOverlay({
  selectedLocation,
  onCancel,
  onSubmit,
  onSearchLocation,
  onFlyToLocation,
  onMarkerFade,
}: AddRentOverlayProps) {
  const [step, setStep] = useState<AddStep>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] =
    useState<GeoLocation | null>(null);
  const [areaName, setAreaName] = useState("");

  // Form state
  const [accommodationType, setAccommodationType] =
    useState<AccommodationType | null>(null);
  const [tenantType, setTenantType] = useState<TenantType | null>(null);
  const [rentAmount, setRentAmount] = useState("");
  const [serviceChargeIncluded, setServiceChargeIncluded] = useState(false);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathroom, setBathroom] = useState(1);
  const [gasType, setGasType] = useState<GasType>("natural");
  const [liftAvailable, setLiftAvailable] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rentInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus rent input when step 4
  useEffect(() => {
    if (step === 4) {
      // Small delay to let the animation settle
      const t = setTimeout(() => rentInputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Auto-focus phone when step 7
  useEffect(() => {
    if (step === 7) {
      const t = setTimeout(() => phoneInputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Step 2 auto-advance after 200ms
  useEffect(() => {
    if (step === 2 && accommodationType) {
      const t = setTimeout(() => setStep(3), 200);
      return () => clearTimeout(t);
    }
  }, [step, accommodationType]);

  // Fade markers when in step 1
  useEffect(() => {
    onMarkerFade?.(step === 1);
  }, [step, onMarkerFade]);

  // --- Reverse geocode ---
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
        { headers: { "User-Agent": "BasaKoi/1.0" } }
      );
      const data = await res.json();
      if (data?.address) {
        const parts = [
          data.address.neighbourhood,
          data.address.suburb,
          data.address.quarter,
          data.address.residential,
          data.address.village,
          data.address.town,
          data.address.city_district,
        ].filter(Boolean);
        return (
          parts.slice(0, 3).join(", ") ||
          data.display_name?.split(",").slice(0, 3).join(",") ||
          "Unknown area"
        );
      }
      return "Unknown area";
    } catch {
      return "Unknown area";
    }
  };

  // --- Search handler ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchedLocation(null);
    try {
      const result = await onSearchLocation(searchQuery.trim());
      if (result) {
        setSearchedLocation(result);
        onFlyToLocation(result);
        const area = await reverseGeocode(result.lat, result.lng);
        setAreaName(area);
      } else {
        setSearchError("Location not found. Try a different search term.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // --- Validate phone on change ---
  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    if (value.length >= 11) {
      if (!isValidBangladeshiPhone(value)) {
        setPhoneError("Enter a valid BD number (e.g. 017XXXXXXXX)");
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }
  }, []);

  // --- Submit ---
  const handleSubmit = async () => {
    const amount = parseInt(rentAmount, 10);
    if (!amount || amount <= 0) {
      setError("Please enter a valid rent amount.");
      return;
    }
    if (!accommodationType) {
      setError("Please select accommodation type.");
      return;
    }
    if (!tenantType) {
      setError("Please select a target audience.");
      return;
    }
    if (!phone.trim() || !isValidBangladeshiPhone(phone)) {
      setError("Please enter a valid Bangladeshi phone number.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim() || `${areaName || "Property"} - ${rentAmount} BDT`,
        accommodation_type: accommodationType,
        rent_amount: amount,
        service_charge_included: serviceChargeIncluded,
        tenant_type: tenantType,
        gas_type: gasType,
        lift_available: liftAvailable,
        bedrooms,
        bathroom,
        description: description.trim(),
        phone: phone.trim(),
        special_instructions: specialInstructions.trim(),
        available_from: "",
      });
      // Show success splash
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSubmitting(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  };

  // --- File upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Progress ---
  const progressPercent = step === 1 ? 0 : ((step - 1) / 7) * 100;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
      {/* ===== SUCCESS SPLASH OVERLAY ===== */}
      {showSuccess && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-emerald-600/90 backdrop-blur-md">
          <div className="animate-in zoom-in-110 fade-in text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Published! 🎉</h2>
            <p className="mt-2 text-emerald-100">Your listing is now live</p>
          </div>
        </div>
      )}

      {/* ===== STEP 1: PIN TARGET (full screen overlay for crosshair) ===== */}
      {step === 1 && (
        <div className="pointer-events-auto mx-auto mb-[5vh] w-full max-w-lg px-4">
          <div className="rounded-2xl bg-white/95 px-5 py-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                  {STEP_ICONS[1]} Step 1 of 8
                </p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {STEP_LABELS[1]}
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchedLocation(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search area (Banani, Gulshan...)"
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {searching ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {searchError && (
              <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{searchError}</div>
            )}

            {searchedLocation && areaName && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 mb-3">
                <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <span>{areaName}</span>
              </div>
            )}

            {searchedLocation && !selectedLocation && (
              <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Drag the map so the <strong>crosshair</strong> sits on the building
                </span>
              </div>
            )}

            {selectedLocation && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800 mb-3">
                <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <span>
                  📍 {selectedLocation.lat.toFixed(5)},{" "}
                  {selectedLocation.lng.toFixed(5)}
                </span>
              </div>
            )}

            <button
              onClick={() => selectedLocation && setStep(2)}
              disabled={!selectedLocation}
              className="w-full rounded-xl py-3 text-base font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25"
            >
              {selectedLocation ? "Set This Building 🏠" : "Click map to drop pin"}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEPS 2-8: SLIDING BOTTOM PANEL (30% up) ===== */}
      {step >= 2 && (
        <div className="pointer-events-auto w-full animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="mx-auto w-full max-w-lg rounded-t-[28px] bg-white/95 px-5 pb-6 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur-xl">
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />

            {/* Progress bar */}
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step indicator */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{STEP_ICONS[step]}</span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
                    Step {step} of 8
                  </p>
                  <h3 className="text-base font-semibold text-gray-800">
                    {STEP_LABELS[step]}
                  </h3>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ===== STEP 2: ACCOMMODATION TYPE (auto-advance) ===== */}
            {step === 2 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Choose one</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "full_flat" as AccommodationType,
                      icon: "🏢",
                      label: "Full Flat Rent",
                      desc: "Entire apartment/house",
                    },
                    {
                      value: "sublet_room" as AccommodationType,
                      icon: "🚪",
                      label: "Sublet Room",
                      desc: "Single room sharing",
                    },
                  ].map(({ value, icon, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAccommodationType(value)}
                      style={springScale(accommodationType === value)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        accommodationType === value
                          ? "border-emerald-500 bg-emerald-50 shadow-md"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      <span className="block text-2xl mb-1">{icon}</span>
                      <span className="block text-sm font-semibold text-gray-800">
                        {label}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
                {accommodationType && (
                  <p className="text-center text-xs text-emerald-600 animate-in fade-in slide-in-from-bottom-2">
                    ✓ {accommodationType === "full_flat" ? "Full Flat" : "Sublet Room"} selected
                  </p>
                )}
              </div>
            )}

            {/* ===== STEP 3: TARGET AUDIENCE ===== */}
            {step === 3 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "family" as TenantType, icon: "👨‍👩‍👧‍👧", label: "Family" },
                    { value: "bachelor_male" as TenantType, icon: "👤", label: "Bachelor (M)" },
                    { value: "bachelor_female" as TenantType, icon: "👩", label: "Bachelor (F)" },
                    { value: "any" as TenantType, icon: "🌟", label: "Anyone" },
                  ].map(({ value, icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTenantType(value)}
                      style={springScale(tenantType === value)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm transition-all ${
                        tenantType === value
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="font-medium text-gray-800">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => tenantType && setStep(4)}
                    disabled={!tenantType}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 4: THE PRICE TAG ===== */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600">
                    ৳
                  </span>
                  <input
                    ref={rentInputRef}
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pl-14 pr-5 text-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    min={1}
                  />
                </div>

                {/* Service charge toggle */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Is service charge included?
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Toggle if rent includes utility/maintenance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceChargeIncluded(!serviceChargeIncluded)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      serviceChargeIncluded ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                        serviceChargeIncluded ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => rentAmount && parseInt(rentAmount) > 0 && setStep(5)}
                    disabled={!rentAmount || parseInt(rentAmount) <= 0}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 5: ROOM CONFIGURATION ===== */}
            {step === 5 && (
              <div className="space-y-4">
                {/* Bedrooms stepper */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    🛏️ Bedrooms
                  </label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                      disabled={bedrooms <= 0}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-xl font-bold text-gray-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    >
                      −
                    </button>
                    <span
                      key={bedrooms}
                      className="min-w-[3rem] text-center text-3xl font-bold text-gray-800 animate-in zoom-in-50 duration-200"
                    >
                      {bedrooms}
                    </span>
                    <button
                      onClick={() => setBedrooms(Math.min(10, bedrooms + 1))}
                      disabled={bedrooms >= 10}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-xl font-bold text-gray-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms stepper */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    🚿 Bathrooms
                  </label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setBathroom(Math.max(0, bathroom - 1))}
                      disabled={bathroom <= 0}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-xl font-bold text-gray-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    >
                      −
                    </button>
                    <span
                      key={bathroom}
                      className="min-w-[3rem] text-center text-3xl font-bold text-gray-800 animate-in zoom-in-50 duration-200"
                    >
                      {bathroom}
                    </span>
                    <button
                      onClick={() => setBathroom(Math.min(10, bathroom + 1))}
                      disabled={bathroom >= 10}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-xl font-bold text-gray-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 6: ESSENTIAL UTILITIES ===== */}
            {step === 6 && (
              <div className="space-y-4">
                {/* Gas toggle: Line Gas vs Cylinder */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    🔥 Gas Connection
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "natural" as GasType, label: "Line Gas" },
                      { value: "cylinder" as GasType, label: "LPG Cylinder" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setGasType(value)}
                        className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
                          gasType === value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lift toggle */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">🛗 Lift Available</p>
                    <p className="text-[11px] text-gray-400">
                      Does the building have an elevator?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiftAvailable(!liftAvailable)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      liftAvailable ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                        liftAvailable ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(7)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 7: COMMUNICATION LINE ===== */}
            {step === 7 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Enter a valid Bangladeshi mobile number
                </p>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className={`w-full rounded-2xl border-2 bg-gray-50 px-5 py-3 text-lg font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all ${
                    phoneError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                      : phone.length === 11 && !phoneError
                      ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/20"
                      : "border-gray-100 focus:border-emerald-400 focus:ring-emerald-500/20"
                  }`}
                />
                {phoneError && (
                  <p className="text-xs text-red-500">{phoneError}</p>
                )}
                {phone.length === 11 && !phoneError && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Valid number
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(6)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (!phone.trim()) {
                        setPhoneError("Please enter a phone number");
                        return;
                      }
                      if (!isValidBangladeshiPhone(phone)) {
                        setPhoneError("Enter a valid BD number (e.g. 017XXXXXXXX)");
                        return;
                      }
                      setStep(8);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 8: VISUAL PROOF & FINISH ===== */}
            {step === 8 && (
              <div className="space-y-3">
                {/* Photo dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
                >
                  <svg className="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.314-2.196 3.75 3.75 0 014.346 4.382A3.375 3.375 0 0118.75 19.5H6.75z" />
                  </svg>
                  <p className="text-xs text-gray-400">Tap to add photos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photos.map((file, i) => (
                      <div key={i} className="group relative h-14 w-14 overflow-hidden rounded-xl">
                        <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extra details (compact) */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Listing title (optional)"
                    className="col-span-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="col-span-2 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special instructions (optional)"
                    rows={2}
                    className="col-span-2 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(7)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                  disabled={submitting || (phone.length > 0 && !isValidBangladeshiPhone(phone))}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/40 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Publishing...
                      </span>
                    ) : (
                      "Publish To Let 🚀"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
