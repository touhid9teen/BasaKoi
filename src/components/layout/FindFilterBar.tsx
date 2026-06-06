"use client";

import type { TenantType } from "@/types";

export type FilterKey = TenantType | "all";

interface FindFilterBarProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Listings" },
  { key: "family", label: "Family" },
  { key: "bachelor_male", label: "Bachelor Male" },
  { key: "bachelor_female", label: "Bachelor Female" },
  { key: "any", label: "Anyone" },
];

export default function FindFilterBar({ activeFilter, onFilterChange }: FindFilterBarProps) {
  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onFilterChange(key)}
          className={`whitespace-nowrap rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
            activeFilter === key
              ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white hover:shadow-md backdrop-blur-sm"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
