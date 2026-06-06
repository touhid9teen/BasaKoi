"use client";

import { Button } from "@/components/ui/button";
import type { MapMode } from "@/types";

interface ActionBarProps {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
  onConfirmAddRent: () => void;
  onCancelAddRent: () => void;
}

export default function ActionBar({
  mode,
  onModeChange,
  onConfirmAddRent,
  onCancelAddRent,
}: ActionBarProps) {
  const isAdding = mode === "add-rent";
  const isFinding = mode === "find-rent";

  return (
    <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          BK
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:inline">
          Basa Koi
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Find Rent */}
        <Button
          variant={isFinding ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (isAdding) onCancelAddRent();
            onModeChange("find-rent");
          }}
          className="relative"
        >
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          Find Rent
        </Button>

        {/* Add Rent */}
        {!isAdding ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => onModeChange("add-rent")}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Rent
          </Button>
        ) : (
          /* Confirm/Cancel when in add-rent mode */
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelAddRent}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onConfirmAddRent}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Confirm Pin
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
