"use client";

import { useState } from "react";
import type { GeoLocation, GasType } from "@/types";

type AddStep = "search" | "pin" | "title" | "rent" | "details" | "description" | "submit";

interface AddRentOverlayProps {
  selectedLocation: GeoLocation | null;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    rent_amount: number;
    bedrooms: number;
    bachelor_allowed: boolean;
    gas_type: GasType;
    description: string;
  }) => Promise<void>;
  /** Search for a location by query — returns coords or null */
  onSearchLocation: (query: string) => Promise<GeoLocation | null>;
  /** Confirm a searched location — flies map there */
  onConfirmLocation: (location: GeoLocation) => void;
}

export default function AddRentOverlay({
  selectedLocation,
  onCancel,
  onSubmit,
  onSearchLocation,
  onConfirmLocation,
}: AddRentOverlayProps) {
  const [step, setStep] = useState<AddStep>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<GeoLocation | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bachelorAllowed, setBachelorAllowed] = useState(false);
  const [gasType, setGasType] = useState<GasType>("natural");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    setLocationConfirmed(false);
    try {
      const result = await onSearchLocation(searchQuery.trim());
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError("Location not found. Try a different search term.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmResult = () => {
    if (searchResult) {
      onConfirmLocation(searchResult);
      setLocationConfirmed(true);
    }
  };

  const handleSubmit = async () => {
    const amount = parseInt(rentAmount, 10);
    if (!amount || amount <= 0) {
      setError("Please enter a valid rent amount.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        rent_amount: amount,
        bedrooms: parseInt(bedrooms, 10) || 1,
        bachelor_allowed: bachelorAllowed,
        gas_type: gasType,
        description: description.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  };

  const progress = () => {
    if (step === "search" || step === "pin") return 0;
    const steps = ["title", "rent", "details", "description", "submit"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
      <div className="pointer-events-auto mx-auto mt-4 w-full max-w-lg rounded-2xl bg-white/95 px-5 py-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
        {/* Progress bar */}
        {(step !== "search" && step !== "pin") && (
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress()}%` }}
            />
          </div>
        )}

        {/* Step: Search */}
        {step === "search" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-700">Add New Rental</h3>
              <button
                onClick={onCancel}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search input + Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchResult(null);
                    setLocationConfirmed(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search for a location..."
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="shrink-0 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {searching ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching
                  </span>
                ) : "Search"}
              </button>
            </div>

            {/* Search result */}
            {searchResult && !locationConfirmed && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  <span className="font-mono">
                    📍 {searchResult.lat.toFixed(5)}, {searchResult.lng.toFixed(5)}
                  </span>
                </div>
                <button
                  onClick={handleConfirmResult}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
                >
                  Confirm Location →
                </button>
              </div>
            )}

            {/* Search error */}
            {searchError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {searchError}
              </div>
            )}

            {/* After location is confirmed, show pin instruction */}
            {locationConfirmed && !selectedLocation && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <svg className="h-5 w-5 shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <span>Now click on the map to drop a pin at the exact location</span>
              </div>
            )}

            {/* Pin confirmed */}
            {selectedLocation && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800">
                  <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  <span>
                    📍 {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                  </span>
                </div>
                <button
                  onClick={() => setStep("title")}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
                >
                  Confirm Pin & Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Title */}
        {step === "title" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Step 1 of 5</p>
            <h3 className="text-lg font-semibold text-gray-800">What is this listing called?</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "2BHK Sublet in Banani"'
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              autoFocus
            />
            <button
              onClick={() => setStep("rent")}
              disabled={!title.trim()}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step: Rent */}
        {step === "rent" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Step 2 of 5</p>
            <h3 className="text-lg font-semibold text-gray-800">Monthly rent amount?</h3>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-emerald-600">৳</span>
              <input
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="15000"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-lg font-semibold text-gray-700 placeholder:text-gray-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                min={1}
                autoFocus
              />
            </div>
            <button
              onClick={() => setStep("details")}
              disabled={!rentAmount || parseInt(rentAmount) <= 0}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Step 3 of 5</p>
            <h3 className="text-lg font-semibold text-gray-800">Property details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "Bed" : "Beds"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Gas Type</label>
                <select
                  value={gasType}
                  onChange={(e) => setGasType(e.target.value as GasType)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="natural">Natural Gas</option>
                  <option value="cylinder">LPG Cylinder</option>
                  <option value="none">No Gas</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Bachelor Allowed?</p>
                <p className="text-xs text-gray-400">Can bachelors rent this property?</p>
              </div>
              <button
                type="button"
                onClick={() => setBachelorAllowed(!bachelorAllowed)}
                className={`relative h-7 w-12 rounded-full transition-colors ${bachelorAllowed ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${bachelorAllowed ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <button
              onClick={() => setStep("description")}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step: Description */}
        {step === "description" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Step 4 of 5</p>
            <h3 className="text-lg font-semibold text-gray-800">Any extra details?</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell tenants about the property, nearby amenities, rules..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep("details")}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 active:scale-[0.98]"
              >
                {submitting ? "Saving..." : "Submit Listing"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
