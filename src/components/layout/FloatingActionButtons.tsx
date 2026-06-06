"use client";

interface FloatingActionButtonsProps {
  onFindRent: () => void;
  onAddRent: () => void;
}

export default function FloatingActionButtons({
  onFindRent,
  onAddRent,
}: FloatingActionButtonsProps) {
  return (
    <div className="absolute left-1/2 top-6 z-20 flex -translate-x-1/2 items-center gap-4">
      <button
        onClick={onFindRent}
        className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg ring-1 ring-emerald-200 transition-all hover:bg-emerald-50 hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        Find Rent
      </button>

      <div className="h-8 w-px bg-emerald-200/50" />

      <button
        onClick={onAddRent}
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Rent
      </button>
    </div>
  );
}
