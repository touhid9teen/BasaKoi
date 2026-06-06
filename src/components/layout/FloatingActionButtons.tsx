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
    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 sm:gap-4">
      <button
        onClick={onFindRent}
        className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-lg ring-1 ring-emerald-200 transition-all hover:bg-emerald-50 hover:shadow-xl hover:scale-105 active:scale-95 sm:gap-2 sm:px-6 sm:py-3 sm:text-sm"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="hidden sm:inline">Find</span> Rent
      </button>

      <div className="h-6 w-px bg-emerald-200/50 sm:h-8" />

      <button
        onClick={onAddRent}
        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-xl hover:scale-105 active:scale-95 sm:gap-2 sm:px-6 sm:py-3 sm:text-sm"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span className="hidden sm:inline">Add</span> Rent
      </button>
    </div>
  );
}
