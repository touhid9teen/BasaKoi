"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GeoLocation, PropertyFormData, GasType } from "@/types";

interface AddRentFormProps {
  open: boolean;
  location: GeoLocation | null;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => Promise<void>;
}

export default function AddRentForm({
  open,
  location,
  onClose,
  onSubmit,
}: AddRentFormProps) {
  const [title, setTitle] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bachelorAllowed, setBachelorAllowed] = useState(false);
  const [gasType, setGasType] = useState<GasType>("natural");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for this listing.");
      return;
    }
    const amount = parseInt(rentAmount, 10);
    if (!amount || amount <= 0) {
      setError("Please enter a valid rent amount.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        rent_amount: amount,
        bedrooms: parseInt(bedrooms, 10) || 1,
        bachelor_allowed: bachelorAllowed,
        gas_type: gasType,
        description: description.trim(),
      });
      // Reset form on success
      setTitle("");
      setRentAmount("");
      setBedrooms("1");
      setBachelorAllowed(false);
      setGasType("natural");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const locationDisplay = location
    ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
    : "No location selected";

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Rental</SheetTitle>
          <SheetDescription>
            Fill in the details about this rental property.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location Info */}
          <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Selected Location
            </p>
            <p className="mt-1 text-sm font-mono text-emerald-600 dark:text-emerald-300">
              📍 {locationDisplay}
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Listing Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "2BHK Sublet in Banani"'
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Rent Amount */}
          <div>
            <label
              htmlFor="rent"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Monthly Rent (৳)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <input
                id="rent"
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="15000"
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                min={1}
                required
              />
            </div>
          </div>

          {/* Row: Bedrooms & Bachelor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bedrooms"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Bedrooms
              </label>
              <select
                id="bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="gas"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Gas Type
              </label>
              <select
                id="gas"
                value={gasType}
                onChange={(e) => setGasType(e.target.value as GasType)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="natural">Natural Gas</option>
                <option value="cylinder">LPG Cylinder</option>
                <option value="none">No Gas</option>
              </select>
            </div>
          </div>

          {/* Bachelor Allowed Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-input p-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Bachelor Allowed?
              </p>
              <p className="text-xs text-muted-foreground">
                Toggle if bachelors can rent this property
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBachelorAllowed(!bachelorAllowed)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                bachelorAllowed ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  bachelorAllowed ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details about the property..."
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !location}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {submitting ? "Saving..." : "Save Location"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
