"use client";

import type { TenantType } from "@/types";

export type FilterKey = TenantType | "all";

interface FindFilterBarProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

const FILTERS: { key: FilterKey; label: string; mobileLabel?: string }[] = [
  { key: "all", label: "All Listings", mobileLabel: "All" },
  { key: "family", label: "Family" },
  { key: "bachelor_male", label: "Bachelor Male", mobileLabel: "Male" },
  { key: "bachelor_female", label: "Bachelor Female", mobileLabel: "Female" },
  { key: "any", label: "Anyone" },
];

export default function FindFilterBar({ activeFilter, onFilterChange }: FindFilterBarProps) {
  return (
    <div className="pointer-events-auto flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none sm:gap-2 sm:px-4 sm:py-2.5">
      {FILTERS.map(({ key, label, mobileLabel }) => (
        <button
          key={key}
          type="button"
          onClick={() => onFilterChange(key)}
          className={`whitespace-nowrap rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:px-4 sm:py-2 sm:text-sm ${
            activeFilter === key
              ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white hover:shadow-md backdrop-blur-sm"
          }`}
        >
          <span className="sm:hidden">{mobileLabel || label}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
