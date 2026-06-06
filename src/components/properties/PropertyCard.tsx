"use client";

import type { Property } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick?: () => void;
}

function formatRent(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onClick,
}: PropertyCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md",
        isSelected
          ? "border-emerald-500 ring-1 ring-emerald-500/30 shadow-md"
          : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
      )}
    >
      {/* Header: Title + Status */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground">
          {property.title}
        </h3>
        {property.status === "rented_out" && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
            Rented
          </span>
        )}
      </div>

      {/* Rent Amount */}
      <p className="mb-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
        {formatRent(property.rent_amount)}
        <span className="text-sm font-normal text-muted-foreground">/mo</span>
      </p>

      {/* Details */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {property.bedrooms && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
            {property.bedrooms} Bed
          </span>
        )}
        {property.bachelor_allowed !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
              property.bachelor_allowed
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}
          >
            {property.bachelor_allowed ? "✓ Bachelor OK" : "✗ Family Only"}
          </span>
        )}
        {property.gas_type && property.gas_type !== "none" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            🏠 {property.gas_type}
          </span>
        )}
      </div>

      {/* Address & Time */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="line-clamp-1 max-w-[75%]">
          {property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}
        </span>
        <span className="shrink-0">{timeAgo(property.created_at)}</span>
      </div>
    </button>
  );
}
