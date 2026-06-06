"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminPropertyStatus = "available" | "rented_out" | "confirmed" | "paid";

interface AdminProperty {
  id: string;
  title: string;
  accommodation_type: string | null;
  rent_amount: number;
  service_charge: number | null;
  service_charge_included: boolean | null;
  available_from: string | null;
  tenant_type: string | null;
  lat: number;
  lng: number;
  address: string | null;
  bachelor_allowed: boolean | null;
  gas_type: string | null;
  lift_available: boolean | null;
  bedrooms: number | null;
  bathroom: number | null;
  description: string | null;
  phone: string | null;
  special_instructions: string | null;
  status: AdminPropertyStatus;
  user_id: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<AdminPropertyStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  rented_out: "bg-red-100 text-red-800 ring-red-300",
  confirmed: "bg-blue-100 text-blue-800 ring-blue-300",
  paid: "bg-purple-100 text-purple-800 ring-purple-300",
};

const STATUS_LABELS: Record<AdminPropertyStatus, string> = {
  available: "Available",
  rented_out: "Rented Out",
  confirmed: "Confirmed",
  paid: "Paid",
};

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

// ──────────────────────────── NEW PROPERTY FORM ────────────────────────────

type TabMode = "list" | "add" | "import";

const inputBase =
  "w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all";
const inputBorder = "border-gray-200 hover:border-gray-300";
const labelBase = "mb-1.5 block text-sm font-bold text-gray-700";
const chipBase =
  "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/30";
const chipActive = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
const chipInactive = "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";
const btnPrimary =
  "rounded-xl bg-emerald-600 py-3 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 px-5";
const btnSecondary =
  "rounded-xl border-2 border-gray-200 py-3 text-base font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300/40 focus:ring-offset-1 px-5";

export default function AdminDashboard() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminPropertyStatus | "all">("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);
  const [tab, setTab] = useState<TabMode>("list");
  const router = useRouter();

  // ── Fetch ──
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property listing permanently?")) return;
    setDeleting(id); setError(null);
    try {
      const res = await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed"); }
      setProperties((p) => p.filter((x) => x.id !== id));
      if (selectedProperty?.id === id) setSelectedProperty(null);
      setSuccess("Deleted successfully"); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally { setDeleting(null); }
  };

  // ── Status change ──
  const handleStatusChange = async (id: string, newStatus: AdminPropertyStatus) => {
    setUpdating(id); setError(null);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Update failed"); }
      setProperties((p) => p.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
      if (selectedProperty?.id === id) setSelectedProperty((p) => p ? { ...p, status: newStatus } : null);
      setSuccess(`Status → "${STATUS_LABELS[newStatus]}"`); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally { setUpdating(null); }
  };

  // ── Logout ──
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ── Filter ──
  const filteredProperties = properties.filter((p) => {
    const ms = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "all" || p.status === statusFilter;
    const mt = tenantFilter === "all" || p.tenant_type === tenantFilter;
    return ms && mst && mt;
  });

  const statuses: AdminPropertyStatus[] = ["available", "confirmed", "paid", "rented_out"];
  const tenantTypes = ["family", "bachelor_male", "bachelor_female", "any"];

  // ── Pagination ──
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const paginatedProperties = filteredProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, tenantFilter]);

  // Clamp page when totalPages shrinks (e.g., after delete)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // ── MEDIA UPLOAD COMPONENT ──
  const MediaUploader = ({ propertyId, onMediaChange }: { propertyId: string; onMediaChange?: () => void }) => {
    const [media, setMedia] = useState<{ id: string; media_type: string; media_url: string; thumbnail_url: string | null; caption: string | null }[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
      setLoadingMedia(true);
      try {
        const res = await fetch(`/api/admin/properties/media?property_id=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data.media || []);
        }
      } catch {} finally { setLoadingMedia(false); }
    }, [propertyId]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const handleUpload = async (file: File, mediaType: "image" | "video", caption?: string) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("property_id", propertyId);
        formData.append("media_type", mediaType);
        if (caption) formData.append("caption", caption);
        const res = await fetch("/api/admin/properties/media", { method: "POST", body: formData });
        if (res.ok) {
          await fetchMedia();
          onMediaChange?.();
        }
      } catch {} finally { setUploading(false); }
    };

    const handleDelete = async (mediaId: string) => {
      if (!confirm("Remove this media?")) return;
      try {
        await fetch(`/api/admin/properties/media?id=${mediaId}`, { method: "DELETE" });
        setMedia((m) => m.filter((x) => x.id !== mediaId));
        onMediaChange?.();
      } catch {}
    };

    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Photos & Videos</p>

        {/* Media grid */}
        {loadingMedia ? (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading media...
          </div>
        ) : media.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {media.map((m) => (
              <div key={m.id} className="group relative h-28 w-28 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-32 sm:w-32">
                {m.media_type === "image" ? (
                  <img src={m.media_url} alt={m.caption || "Property photo"} className="h-full w-full object-cover" />
                ) : (
                  <video src={m.media_url} className="h-full w-full object-cover" />
                )}
                <button
                  onClick={() => handleDelete(m.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {m.caption && (
                  <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4 text-[10px] text-white">
                    {m.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-3 text-sm text-gray-400 italic">No photos or videos added yet</p>
        )}

        {/* Upload dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) {
              const isVideo = f.type.startsWith("video/");
              handleUpload(f, isVideo ? "video" : "image");
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all ${
            dragOver ? "border-emerald-400 bg-emerald-50/50" : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30"
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-5 w-5 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </div>
          ) : (
            <>
              <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-semibold text-gray-700">Drop photo/video or click to upload</p>
              <p className="mt-1 text-xs text-gray-400">Supports images (JPEG, PNG, WebP) and videos (MP4, WebM)</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const isVideo = f.type.startsWith("video/");
                handleUpload(f, isVideo ? "video" : "image");
              }
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
    );
  };

  // ── ADD PROPERTY ──
  const AddPropertyForm = () => {
    const [title, setTitle] = useState("");
    const [rentAmount, setRentAmount] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [accommodationType, setAccommodationType] = useState<string>("full_flat");
    const [tenantType, setTenantType] = useState<string>("any");
    const [bedrooms, setBedrooms] = useState("1");
    const [bathroom, setBathroom] = useState("1");
    const [gasType, setGasType] = useState<string>("natural");
    const [liftAvailable, setLiftAvailable] = useState(false);
    const [description, setDescription] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [status, setStatus] = useState<AdminPropertyStatus>("available");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async () => {
      setFormError(null);
      const amount = parseInt(rentAmount);
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!title.trim()) { setFormError("Title is required"); return; }
      if (!amount || amount <= 0) { setFormError("Valid rent amount required"); return; }
      if (isNaN(latNum) || isNaN(lngNum)) { setFormError("Valid coordinates required"); return; }
      if (latNum < 20.5 || latNum > 26.8 || lngNum < 88 || lngNum > 92.7) { setFormError("Coordinates outside Bangladesh bounds"); return; }
      setSubmitting(true);
      try {
        const res = await fetch("/api/admin/properties/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([{
            title: title.trim(),
            rent_amount: amount,
            lat: latNum,
            lng: lngNum,
            address: address.trim() || undefined,
            phone: phone.trim() || undefined,
            accommodation_type: accommodationType,
            tenant_type: tenantType,
            bedrooms: parseInt(bedrooms) || 1,
            bathroom: parseInt(bathroom) || 1,
            gas_type: gasType,
            lift_available: liftAvailable,
            description: description.trim() || undefined,
            special_instructions: specialInstructions.trim() || undefined,
            status,
          }]),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create");
        if (data.successCount === 0) {
          const errMsg = data.results?.[0]?.error || "Validation failed — check coordinates and required fields";
          throw new Error(errMsg);
        }
        setSuccess(`"${title}" created successfully`);
        setTab("list");
        fetchProperties();
        // Reset form
        setTitle(""); setRentAmount(""); setLat(""); setLng(""); setAddress(""); setPhone("");
        setBedrooms("1"); setBathroom("1"); setDescription(""); setSpecialInstructions("");
        setAccommodationType("full_flat"); setTenantType("any"); setGasType("natural");
        setLiftAvailable(false); setStatus("available");
        setTimeout(() => setSuccess(null), 4000);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed");
      } finally { setSubmitting(false); }
    };

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Add New Property</h2>
        <p className="mb-5 text-sm text-gray-500">Manually create a property listing</p>

        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Title */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelBase}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Luxury 2BHK Gulshan" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Rent */}
          <div>
            <label className={labelBase}>Rent Amount (BDT) *</label>
            <input type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="15000" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Lat */}
          <div>
            <label className={labelBase}>Latitude *</label>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="23.7900" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Lng */}
          <div>
            <label className={labelBase}>Longitude *</label>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="90.4150" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Address */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelBase}>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Road 48, Gulshan 1, Dhaka" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Phone */}
          <div>
            <label className={labelBase}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01712345678" className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Accommodation */}
          <div>
            <label className={labelBase}>Type</label>
            <div className="flex gap-2">
              {(["full_flat", "sublet_room"] as const).map((v) => (
                <button key={v} onClick={() => setAccommodationType(v)} className={`${chipBase} flex-1 ${accommodationType === v ? chipActive : chipInactive}`}>
                  {v === "full_flat" ? "Full Flat" : "Sublet Room"}
                </button>
              ))}
            </div>
          </div>
          {/* Tenant */}
          <div>
            <label className={labelBase}>Tenant Type</label>
            <select value={tenantType} onChange={(e) => setTenantType(e.target.value)} className={`${inputBase} ${inputBorder}`}>
              <option value="family">Family</option>
              <option value="bachelor_male">Bachelor Male</option>
              <option value="bachelor_female">Bachelor Female</option>
              <option value="any">Anyone</option>
            </select>
          </div>
          {/* Bedrooms */}
          <div>
            <label className={labelBase}>Bedrooms</label>
            <input type="number" min={0} max={20} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Bathrooms */}
          <div>
            <label className={labelBase}>Bathrooms</label>
            <input type="number" min={0} max={20} value={bathroom} onChange={(e) => setBathroom(e.target.value)} className={`${inputBase} ${inputBorder}`} />
          </div>
          {/* Gas */}
          <div>
            <label className={labelBase}>Gas Type</label>
            <select value={gasType} onChange={(e) => setGasType(e.target.value)} className={`${inputBase} ${inputBorder}`}>
              <option value="natural">Line Gas</option>
              <option value="cylinder">LPG Cylinder</option>
              <option value="none">No Gas</option>
            </select>
          </div>
          {/* Lift */}
          <div>
            <label className={labelBase}>Lift Available</label>
            <div className="flex gap-2">
              <button onClick={() => setLiftAvailable(true)} className={`${chipBase} flex-1 ${liftAvailable ? chipActive : chipInactive}`}>Yes</button>
              <button onClick={() => setLiftAvailable(false)} className={`${chipBase} flex-1 ${!liftAvailable ? chipActive : chipInactive}`}>No</button>
            </div>
          </div>
          {/* Status */}
          <div>
            <label className={labelBase}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminPropertyStatus)} className={`${inputBase} ${inputBorder}`}>
              {statuses.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
            </select>
          </div>
          {/* Photos & Videos */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                Photos & videos can be added after the property is created
              </div>
              <p className="text-xs text-gray-400">When the property is created, you&apos;ll be able to upload images and videos from the listings view.</p>
            </div>
          </div>
          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelBase}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the property, location, nearby amenities..." className={`${inputBase} ${inputBorder} resize-none`} />
          </div>
          {/* Special Instructions */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelBase}>Special Instructions</label>
            <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={2} placeholder="Gate closes at 11 PM, bills split equally..." className={`${inputBase} ${inputBorder} resize-none`} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSubmit} disabled={submitting} className={btnPrimary}>
            {submitting ? "Creating..." : "Create Property"}
          </button>
          <button onClick={() => setTab("list")} className={btnSecondary}>Cancel</button>
        </div>
      </div>
    );
  };

  // ── IMPORT SECTION ──
  const ImportSection = () => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<string | null>(null);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pasteJson, setPasteJson] = useState("");
    const [pasteMode, setPasteMode] = useState<"file" | "paste">("file");

    const handleFile = async (file: File) => {
      setSelectedFile(file);
      setImportResult(null);
      setImportErrors([]);
    };

    const handleUpload = async () => {
      if (!selectedFile) return;
      setImporting(true); setImportResult(null); setImportErrors([]);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/admin/properties/import", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Import failed");
        setImportResult(data.message || `Imported ${data.successCount} properties`);
        if (data.results) {
          const fails = data.results.filter((r: { success: boolean; error?: string; title: string; index: number }) => !r.success);
          if (fails.length > 0) {
            setImportErrors(fails.map((f: { index: number; title: string; error?: string }) =>
              `Row ${f.index} "${f.title}": ${f.error || "Unknown error"}`
            ));
          }
        }
        fetchProperties();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setImportResult(`Error: ${err instanceof Error ? err.message : "Import failed"}`);
      } finally { setImporting(false); }
    };

    const handlePasteImport = async () => {
      if (!pasteJson.trim()) return;
      setImporting(true); setImportResult(null); setImportErrors([]);
      try {
        const parsed = JSON.parse(pasteJson);
        const body = Array.isArray(parsed) ? parsed : parsed.properties || parsed.data || [];
        const res = await fetch("/api/admin/properties/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Import failed");
        setImportResult(data.message || `Imported ${data.successCount} properties`);
        if (data.results) {
          const fails = data.results.filter((r: { success: boolean; error?: string }) => !r.success);
          if (fails.length > 0) {
            setImportErrors(fails.map((f: { index: number; title: string; error?: string }) =>
              `Row ${f.index} "${f.title}": ${f.error || "Unknown error"}`
            ));
          }
        }
        fetchProperties();
        setPasteJson("");
      } catch (err) {
        setImportResult(`Error: ${err instanceof Error ? err.message : "Import failed"}`);
      } finally { setImporting(false); }
    };

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Import Properties</h2>
        <p className="mb-5 text-sm text-gray-500">Upload a JSON or Excel (.xlsx) file, or paste JSON data</p>

        {/* Toggle */}
        <div className="mb-4 flex gap-2">
          <button onClick={() => setPasteMode("file")} className={`${chipBase} text-sm ${pasteMode === "file" ? chipActive : chipInactive}`}>Upload File</button>
          <button onClick={() => setPasteMode("paste")} className={`${chipBase} text-sm ${pasteMode === "paste" ? chipActive : chipInactive}`}>Paste JSON</button>
        </div>

        {/* File upload */}
        {pasteMode === "file" && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                dragOver ? "border-emerald-400 bg-emerald-50/50" : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30"
              }`}
            >
              <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-base font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : "Drop file here or click to browse"}
              </p>
              <p className="mt-1 text-sm text-gray-400">Supports .json and .xlsx files</p>
              <input ref={fileInputRef} type="file" accept=".json,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            </div>

            {selectedFile && (
              <div className="mt-4">
                <button onClick={handleUpload} disabled={importing} className={btnPrimary}>
                  {importing ? "Importing..." : `Import ${selectedFile.name}`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Paste JSON */}
        {pasteMode === "paste" && (
          <>
            <textarea
              value={pasteJson}
              onChange={(e) => setPasteJson(e.target.value)}
              placeholder={`[\n  {\n    "title": "Luxury 2BHK Gulshan",\n    "rent_amount": 25000,\n    "lat": 23.79,\n    "lng": 90.415,\n    "address": "Road 48, Gulshan, Dhaka",\n    "phone": "01712345678",\n    "tenant_type": "family",\n    "bedrooms": 2,\n    "bathroom": 2,\n    "status": "available"\n  }\n]`}
              rows={10}
              className={`${inputBase} ${inputBorder} font-mono text-sm`}
            />
            <div className="mt-4">
              <button onClick={handlePasteImport} disabled={importing || !pasteJson.trim()} className={btnPrimary}>
                {importing ? "Importing..." : "Import JSON Data"}
              </button>
            </div>
          </>
        )}

        {/* Result */}
        {importResult && (
          <div className={`mt-4 rounded-xl border px-4 py-3 text-base font-semibold ${
            importResult.startsWith("Error")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {importResult}
          </div>
        )}
        {importErrors.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-bold text-red-700">Errors:</p>
            {importErrors.map((e, i) => (
              <p key={i} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{e}</p>
            ))}
          </div>
        )}

        {/* JSON format guide */}
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-700">JSON field reference</summary>
          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 pr-4 font-bold text-gray-600">Field</th>
                  <th className="pb-2 pr-4 font-bold text-gray-600">Required</th>
                  <th className="pb-2 font-bold text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                <tr><td className="py-1.5 pr-4 font-mono text-xs">title</td><td className="py-1.5 pr-4">Yes</td><td className="py-1.5">Property listing title</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">rent_amount</td><td className="py-1.5 pr-4">Yes</td><td className="py-1.5">Monthly rent in BDT</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">lat</td><td className="py-1.5 pr-4">Yes</td><td className="py-1.5">Latitude (20.5–26.8)</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">lng</td><td className="py-1.5 pr-4">Yes</td><td className="py-1.5">Longitude (88–92.7)</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">address</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">Full address string</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">phone</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">Contact phone number</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">tenant_type</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">family, bachelor_male, bachelor_female, any</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">bedrooms</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">Number of bedrooms</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">bathroom</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">Number of bathrooms</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">gas_type</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">natural, cylinder, none</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">lift_available</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">true / false</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">accommodation_type</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">full_flat, sublet_room</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">description</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">Property description</td></tr>
                <tr><td className="py-1.5 pr-4 font-mono text-xs">status</td><td className="py-1.5 pr-4">No</td><td className="py-1.5">available, confirmed, paid, rented_out</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    );
  };

  // ── MAIN RENDER ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Admin Panel</h1>
              <p className="text-sm font-medium text-gray-500">BasaKoi Rent Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-base text-gray-500 sm:inline">
              {filteredProperties.length} of {properties.length} listings
            </span>
            <a href="/" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50">View Map</a>
            <button onClick={handleLogout} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50">Logout</button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
            {([
              { key: "list" as TabMode, label: "📋 Listings", desc: "View & manage properties" },
              { key: "add" as TabMode, label: "➕ Add New", desc: "Create a property manually" },
              { key: "import" as TabMode, label: "📥 Import", desc: "Bulk import from JSON/Excel" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedProperty(null); }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">{t.desc}</span>
                <span className="sm:hidden">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Messages */}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-semibold text-emerald-700">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base font-semibold text-red-700">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* TAB: Add Property */}
        {tab === "add" && <AddPropertyForm />}

        {/* TAB: Import */}
        {tab === "import" && <ImportSection />}

        {/* TAB: Listings */}
        {tab === "list" && (
          <>
            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, address, phone..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AdminPropertyStatus | "all")}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="all">All Status</option>
                {statuses.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
              </select>
              <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="all">All Tenants</option>
                {tenantTypes.map((t) => (<option key={t} value={t}>{t === "bachelor_male" ? "Bachelor Male" : t === "bachelor_female" ? "Bachelor Female" : t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
              </select>
              <button onClick={fetchProperties} className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50" title="Refresh">
                <svg className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {loading && properties.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="h-10 w-10 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-base font-medium text-gray-500">Loading properties...</p>
                  </div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-base font-medium text-gray-500">No properties found</p>
                  <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Mobile card view */}
                  <div className="block sm:hidden">
                    {paginatedProperties.map((property) => (
                      <div key={property.id} className={`border-b border-gray-100 p-5 transition-colors ${selectedProperty?.id === property.id ? "bg-emerald-50/50" : "hover:bg-gray-50"}`}>
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate text-base font-bold text-gray-900">{property.title}</h3>
                            <p className="truncate text-sm text-gray-500">{property.address || "No address"}</p>
                          </div>
                          <span className={`ml-2 shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${STATUS_COLORS[property.status]}`}>{STATUS_LABELS[property.status]}</span>
                        </div>
                        <div className="mb-3 flex items-center gap-4 text-base">
                          <span className="font-bold text-emerald-600">{formatRent(property.rent_amount)}</span>
                          {property.phone && <span className="text-gray-500">{property.phone}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {statuses.map((s) => (
                            <button key={s} onClick={() => handleStatusChange(property.id, s)} disabled={updating === property.id || property.status === s}
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${property.status === s ? "bg-gray-100 text-gray-400 cursor-not-allowed" : `${STATUS_COLORS[s]} hover:opacity-80 active:scale-95`}`}>
                              {updating === property.id ? "..." : STATUS_LABELS[s]}
                            </button>
                          ))}
                          <button onClick={() => handleDelete(property.id)} disabled={deleting === property.id}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-95 transition-all">
                            {deleting === property.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table view */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Title / Address</th>
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Rent</th>
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Contact</th>
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Tenant</th>
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-500">Created</th>
                            <th className="px-5 py-4 text-right text-sm font-bold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedProperties.map((property) => (
                            <tr key={property.id} className={`transition-colors hover:bg-gray-50/50 ${selectedProperty?.id === property.id ? "bg-emerald-50/30" : ""}`}>
                              <td className="px-5 py-4">
                                <button onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)} className="text-left">
                                  <p className="max-w-[240px] truncate text-base font-semibold text-gray-900">{property.title}</p>
                                  <p className="max-w-[240px] truncate text-sm text-gray-500">{property.address || "—"}</p>
                                </button>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-base font-bold text-emerald-600">{formatRent(property.rent_amount)}</span>
                              </td>
                              <td className="px-5 py-4">
                                <a href={`tel:${property.phone}`} className="text-base font-medium text-blue-600 hover:text-blue-500">{property.phone || "—"}</a>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm text-gray-600">
                                  {property.tenant_type
                                    ? property.tenant_type === "bachelor_male" ? "B.Male"
                                      : property.tenant_type === "bachelor_female" ? "B.Female"
                                      : property.tenant_type.charAt(0).toUpperCase() + property.tenant_type.slice(1)
                                    : "—"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${STATUS_COLORS[property.status]}`}>{STATUS_LABELS[property.status]}</span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-500">{timeAgo(property.created_at)}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <select value={property.status} onChange={(e) => handleStatusChange(property.id, e.target.value as AdminPropertyStatus)} disabled={updating === property.id}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-emerald-500 focus:outline-none">
                                    {statuses.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
                                  </select>
                                  <button onClick={() => handleDelete(property.id)} disabled={deleting === property.id}
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50">
                                    {deleting === property.id ? "..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Pagination */}
              {!loading && filteredProperties.length > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filteredProperties.length)} of {filteredProperties.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      // Show pages around current page
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-semibold transition-all ${
                            page === pageNum
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-white hover:border-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedProperty && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
                  <button onClick={() => setSelectedProperty(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Title</p>
                    <p className="text-base font-semibold text-gray-900">{selectedProperty.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Rent Amount</p>
                    <p className="text-base font-bold text-emerald-600">{formatRent(selectedProperty.rent_amount)}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${STATUS_COLORS[selectedProperty.status]}`}>{STATUS_LABELS[selectedProperty.status]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone</p>
                    <a href={`tel:${selectedProperty.phone}`} className="text-base font-medium text-blue-600">{selectedProperty.phone || "—"}</a>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Address</p>
                    <p className="text-base text-gray-700">{selectedProperty.address || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tenant Type</p>
                    <p className="text-base text-gray-700">
                      {selectedProperty.tenant_type
                        ? selectedProperty.tenant_type === "bachelor_male" ? "Bachelor Male"
                          : selectedProperty.tenant_type === "bachelor_female" ? "Bachelor Female"
                          : selectedProperty.tenant_type.charAt(0).toUpperCase() + selectedProperty.tenant_type.slice(1)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Rooms</p>
                    <p className="text-base text-gray-700">{selectedProperty.bedrooms || "?"} Bed / {selectedProperty.bathroom || "?"} Bath</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Gas / Lift</p>
                    <p className="text-base text-gray-700">
                      {selectedProperty.gas_type === "natural" ? "Line Gas" : selectedProperty.gas_type === "cylinder" ? "LPG" : "No Gas"}
                      {" / "}
                      {selectedProperty.lift_available ? "Lift ✓" : "No Lift"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Accommodation</p>
                    <p className="text-base text-gray-700">
                      {selectedProperty.accommodation_type === "full_flat" ? "Full Flat" : selectedProperty.accommodation_type === "sublet_room" ? "Sublet Room" : "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</p>
                    <p className="text-base text-gray-700 whitespace-pre-line">{selectedProperty.description || "—"}</p>
                  </div>
                  {selectedProperty.special_instructions && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Special Instructions</p>
                      <p className="text-base text-gray-700 whitespace-pre-line">{selectedProperty.special_instructions}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <div className="border-t border-gray-100 pt-4">
                      <MediaUploader propertyId={selectedProperty.id} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Coordinates</p>
                    <p className="text-base text-gray-500 font-mono">{selectedProperty.lat.toFixed(5)}, {selectedProperty.lng.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Created</p>
                    <p className="text-base text-gray-500">{new Date(selectedProperty.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
