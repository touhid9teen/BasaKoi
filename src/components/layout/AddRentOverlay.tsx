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

function isValidBangladeshiPhone(num: string): boolean {
  return /^01[3-9]\d{8}$/.test(num.replace(/\s/g, ""));
}

function springScale(active: boolean): React.CSSProperties {
  return {
    transform: active ? "scale(1.05)" : "scale(1)",
    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };
}

const inputBase =
  "w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all sm:px-4 sm:py-3 sm:text-sm";
const inputBorder =
  "border-gray-200 hover:border-gray-300";
const labelBase =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600";
const chipBase =
  "rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:px-4 sm:py-3 sm:text-sm";
const chipActive =
  "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
const chipInactive =
  "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";
const btnPrimary =
  "flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 sm:py-3 sm:text-sm";
const btnSecondary =
  "flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300/40 focus:ring-offset-1 sm:py-3 sm:text-sm";
const toggleTrack =
  "relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2";
const toggleThumb =
  "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rentInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 4) {
      const t = setTimeout(() => rentInputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 7) {
      const t = setTimeout(() => phoneInputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && accommodationType) {
      const t = setTimeout(() => setStep(3), 200);
      return () => clearTimeout(t);
    }
  }, [step, accommodationType]);

  useEffect(() => {
    onMarkerFade?.(step === 1);
  }, [step, onMarkerFade]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const progressPercent = step === 1 ? 0 : ((step - 1) / 7) * 100;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
      {/* ===== SUCCESS SPLASH ===== */}
      {showSuccess && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-emerald-700/95 backdrop-blur-md">
          <div className="animate-in zoom-in-110 fade-in text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold drop-shadow-sm">Published! 🎉</h2>
            <p className="mt-2 text-emerald-200 font-medium">Your listing is now live</p>
          </div>
        </div>
      )}

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <div className="pointer-events-auto mx-auto mb-[5vh] w-full max-w-lg px-4">
          <div className="rounded-2xl bg-white px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 sm:text-xs">
                  {STEP_ICONS[1]} Step 1 of 8
                </p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5 sm:text-lg">
                  {STEP_LABELS[1]}
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                  className={inputBase + " " + inputBorder + " pl-10"}
                  autoFocus
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-1"
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
              <div className="mb-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{searchError}</div>
            )}

            {searchedLocation && areaName && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 mb-3">
                <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <span>{areaName}</span>
              </div>
            )}

            {searchedLocation && !selectedLocation && (
              <div className="mb-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Drag the map so the <strong>crosshair</strong> sits on the exact building, then tap the button below
                </span>
              </div>
            )}

            {selectedLocation && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 mb-3">
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
              className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 sm:py-3.5 sm:text-base"
            >
              {selectedLocation ? "Set This Building 🏠" : "Click map to drop pin"}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEPS 2-8: BOTTOM PANEL ===== */}
      {step >= 2 && (
        <div className="pointer-events-auto w-full animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="mx-auto w-full max-w-lg rounded-t-[28px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />

            {/* Progress bar */}
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-inset ring-gray-200/50">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step indicator */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm ring-1 ring-emerald-200 sm:h-9 sm:w-9 sm:text-base">
                  {STEP_ICONS[step]}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 sm:text-[11px]">
                    Step {step} of 8
                  </p>
                  <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                    {STEP_LABELS[step]}
                  </h3>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ===== STEP 2: ACCOMMODATION TYPE ===== */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">What are you listing?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "full_flat" as AccommodationType,
                      icon: "🏢",
                      label: "Full Flat Rent",
                      desc: "Entire apartment or house",
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
                      className={`${chipBase} ${
                        accommodationType === value ? chipActive : chipInactive
                      }`}
                    >
                      <span className="block text-3xl mb-2">{icon}</span>
                      <span className="block text-sm font-bold text-gray-900">{label}</span>
                      <span className="block text-xs text-gray-500 mt-1">{desc}</span>
                    </button>
                  ))}
                </div>
                {accommodationType && (
                  <div className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {accommodationType === "full_flat" ? "Full Flat" : "Sublet Room"} selected — advancing...
                  </div>
                )}
              </div>
            )}

            {/* ===== STEP 3: TARGET AUDIENCE ===== */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Who can rent this?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: "family" as TenantType, icon: "👨‍👩‍👧‍👧", label: "Family" },
                    { value: "bachelor_male" as TenantType, icon: "👤", label: "Bachelor (Male)" },
                    { value: "bachelor_female" as TenantType, icon: "👩", label: "Bachelor (Female)" },
                    { value: "any" as TenantType, icon: "🌟", label: "Anyone" },
                  ].map(({ value, icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTenantType(value)}
                      style={springScale(tenantType === value)}
                      className={`${chipBase} flex items-center gap-3 ${
                        tenantType === value ? chipActive : chipInactive
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-bold text-gray-900">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className={btnSecondary}>← Back</button>
                  <button
                    onClick={() => tenantType && setStep(4)}
                    disabled={!tenantType}
                    className={btnPrimary}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 4: THE PRICE TAG ===== */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">What is the monthly rent?</p>
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-emerald-600">
                    ৳
                  </span>
                  <input
                    ref={rentInputRef}
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 pl-14 pr-4 text-2xl font-black text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all hover:border-gray-300 sm:py-5 sm:pl-16 sm:pr-5 sm:text-3xl"
                    min={1}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-gray-800">Service charge included?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle if rent includes utility/maintenance costs</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceChargeIncluded(!serviceChargeIncluded)}
                    className={`${toggleTrack} ${
                      serviceChargeIncluded ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`${toggleThumb} ${
                        serviceChargeIncluded ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(3)} className={btnSecondary}>← Back</button>
                  <button
                    onClick={() => rentAmount && parseInt(rentAmount) > 0 && setStep(5)}
                    disabled={!rentAmount || parseInt(rentAmount) <= 0}
                    className={btnPrimary}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 5: ROOM CONFIGURATION ===== */}
            {step === 5 && (
              <div className="space-y-5">
                <p className="text-sm font-semibold text-gray-700">How many rooms?</p>
                {/* Bedrooms */}
                <div>
                  <label className={`${labelBase} mb-3`}>🛏️ Bedrooms</label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                      disabled={bedrooms <= 0}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-xl font-bold text-gray-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm sm:h-14 sm:w-14 sm:text-2xl"
                    >
                      −
                    </button>
                    <span
                      key={bedrooms}
                      className="min-w-[3rem] text-center text-3xl font-black text-gray-900 animate-in zoom-in-50 duration-200 sm:min-w-[4rem] sm:text-4xl"
                    >
                      {bedrooms}
                    </span>
                    <button
                      onClick={() => setBedrooms(Math.min(10, bedrooms + 1))}
                      disabled={bedrooms >= 10}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-2xl font-bold text-gray-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className={`${labelBase} mb-3`}>🚿 Bathrooms</label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setBathroom(Math.max(0, bathroom - 1))}
                      disabled={bathroom <= 0}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-2xl font-bold text-gray-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
                    >
                      −
                    </button>
                    <span
                      key={bathroom}
                      className="min-w-[4rem] text-center text-4xl font-black text-gray-900 animate-in zoom-in-50 duration-200"
                    >
                      {bathroom}
                    </span>
                    <button
                      onClick={() => setBathroom(Math.min(10, bathroom + 1))}
                      disabled={bathroom >= 10}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-2xl font-bold text-gray-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(4)} className={btnSecondary}>← Back</button>
                  <button onClick={() => setStep(6)} className={btnPrimary}>Next →</button>
                </div>
              </div>
            )}

            {/* ===== STEP 6: ESSENTIAL UTILITIES ===== */}
            {step === 6 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">What utilities are available?</p>
                {/* Gas */}
                <div>
                  <label className={`${labelBase} mb-2`}>🔥 Gas Connection</label>
                  <div className="flex gap-2.5">
                    {[
                      { value: "natural" as GasType, label: "Line Gas" },
                      { value: "cylinder" as GasType, label: "LPG Cylinder" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setGasType(value)}
                        className={`${chipBase} flex-1 text-center ${
                          gasType === value ? chipActive : chipInactive
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lift */}
                <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-800">🛗 Lift Available</p>
                    <p className="text-xs text-gray-500 mt-0.5">Does the building have an elevator?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiftAvailable(!liftAvailable)}
                    className={`${toggleTrack} ${
                      liftAvailable ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`${toggleThumb} ${
                        liftAvailable ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(5)} className={btnSecondary}>← Back</button>
                  <button onClick={() => setStep(7)} className={btnPrimary}>Next →</button>
                </div>
              </div>
            )}

            {/* ===== STEP 7: COMMUNICATION LINE ===== */}
            {step === 7 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Your contact number</p>
                <p className="text-xs text-gray-500">Enter a valid Bangladeshi mobile number</p>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className={`w-full rounded-2xl border-2 bg-white px-5 py-3.5 text-xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all ${
                    phoneError
                      ? "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500/30"
                      : phone.length === 11 && !phoneError
                      ? "border-emerald-400 hover:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                      : "border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/30"
                  }`}
                />
                {phoneError && (
                  <div className="flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {phoneError}
                  </div>
                )}
                {phone.length === 11 && !phoneError && (
                  <div className="flex items-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Valid Bangladeshi number
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(6)} className={btnSecondary}>← Back</button>
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
                    className={btnPrimary}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 8: VISUAL PROOF & FINISH ===== */}
            {step === 8 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Almost done! Add photos & details</p>
                {/* Photo dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.314-2.196 3.75 3.75 0 014.346 4.382A3.375 3.375 0 0118.75 19.5H6.75z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Tap to add photos</p>
                  <p className="text-xs text-gray-400 mt-0.5">Show off the property — max 5 photos</p>
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
                      <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-xl ring-2 ring-gray-200">
                        <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extra details */}
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Listing title (optional)"
                    className={inputBase + " " + inputBorder}
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the property, nearby amenities, rules..."
                    rows={2}
                    className={`${inputBase} ${inputBorder} resize-none`}
                  />
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special instructions (e.g. gate closes at 11 PM, bills split equally)"
                    rows={2}
                    className={`${inputBase} ${inputBorder} resize-none`}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(7)} className={btnSecondary}>← Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || (phone.length > 0 && !isValidBangladeshiPhone(phone))}
                    className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/40 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 sm:py-3.5 sm:text-base"
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
                      <span className="flex items-center justify-center gap-2">
                        Publish To Let 🚀
                      </span>
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
