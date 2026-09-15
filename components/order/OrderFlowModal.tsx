"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { addToCart } from "@/lib/actions/cart";
import { formatRupiah } from "@/lib/utils";

export type Variation = { id: string; name: string; price: number; extra_fee: number; description: string | null };
export type ConfigField = {
  id: string;
  field_key: string;
  field_label: string;
  field_type: "number" | "text" | "select" | "textarea" | "date";
  options: string[] | null;
  is_required: boolean;
};
export type OrderableProduct = {
  id: string;
  name: string;
  base_price: number;
  price_type: string;
  price_unit: string | null;
  express_fee_percent: number | null;
  variations: Variation[];
  configFields: ConfigField[];
};

type Step = "material" | "configuration" | "review";

export function OrderFlowModal({ product, onClose }: { product: OrderableProduct; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("material");

  const [materialStatus, setMaterialStatus] = useState<"available" | "unavailable" | null>(null);
  const [materialMethod, setMaterialMethod] = useState<"upload" | "paste">("upload");
  const [materialFiles, setMaterialFiles] = useState<UploadedFile[]>([]);
  const [materialText, setMaterialText] = useState("");

  const [variationId, setVariationId] = useState<string | null>(product.variations[0]?.id ?? null);
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVariation = product.variations.find((v) => v.id === variationId) ?? null;
  const unitPrice = selectedVariation?.price ?? product.base_price;

  const deadlineAt = useMemo(() => {
    if (!deadlineDate || !deadlineTime) return null;
    return new Date(`${deadlineDate}T${deadlineTime}:00`);
  }, [deadlineDate, deadlineTime]);

  const isUrgent = deadlineAt ? deadlineAt.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;

  function handleMaterialNext() {
    if (materialStatus === "available" && materialMethod === "upload" && materialFiles.length === 0 && !materialText) {
      setError("Upload minimal satu file atau isi teks materi, atau pilih \"Belum\" jika belum punya materi.");
      return;
    }
    setError(null);
    setStep("configuration");
  }

  async function handleSubmit() {
    const missingRequired = product.configFields.find((f) => f.is_required && !configuration[f.field_key]);
    if (missingRequired) {
      setError(`"${missingRequired.field_label}" wajib diisi.`);
      return;
    }
    if (!deadlineAt) {
      setError("Pilih tanggal dan jam deadline.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await addToCart({
      productId: product.id,
      variationId,
      quantity: 1,
      configuration,
      materialStatus: materialStatus ?? "unavailable",
      materialText: materialMethod === "paste" ? materialText : materialText || null,
      materialFiles: materialMethod === "upload" ? materialFiles : [],
      deadlineAt: deadlineAt.toISOString(),
      notes: notes || null,
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.requiresLogin) {
        router.push("/login?next=/products");
        return;
      }
      setError(result.error);
      return;
    }

    onClose();
    router.push("/cart");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink-950/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-card sm:rounded-card bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-900/10 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            {step !== "material" && (
              <button
                onClick={() => setStep(step === "review" ? "configuration" : "material")}
                className="rounded-full p-1 text-ink-600 hover:bg-ink-900/5"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h3 className="font-display font-semibold text-ink-950">{product.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-600 hover:bg-ink-900/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {step === "material" && (
            <div>
              <p className="font-display font-medium text-ink-950 mb-4">
                Apakah sudah ada materi yang kamu ingin buat?
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <ChoiceButton
                  label="Sudah"
                  active={materialStatus === "available"}
                  onClick={() => setMaterialStatus("available")}
                />
                <ChoiceButton
                  label="Belum"
                  active={materialStatus === "unavailable"}
                  onClick={() => setMaterialStatus("unavailable")}
                />
              </div>

              {materialStatus === "available" && (
                <div>
                  <div className="flex gap-2 mb-3">
                    <TabButton
                      label="Upload File"
                      active={materialMethod === "upload"}
                      onClick={() => setMaterialMethod("upload")}
                    />
                    <TabButton
                      label="Paste Teks"
                      active={materialMethod === "paste"}
                      onClick={() => setMaterialMethod("paste")}
                    />
                  </div>
                  {materialMethod === "upload" ? (
                    <FileUploader files={materialFiles} onChange={setMaterialFiles} />
                  ) : (
                    <textarea
                      value={materialText}
                      onChange={(e) => setMaterialText(e.target.value)}
                      rows={5}
                      placeholder="Tempelkan materi, soal, instruksi dosen, atau ketentuan tugas di sini..."
                      className="w-full rounded-lg border border-ink-900/15 p-3 text-sm focus:border-signal-500 outline-none"
                    />
                  )}
                </div>
              )}

              {materialStatus === "unavailable" && (
                <div>
                  <p className="text-sm font-medium text-ink-800 mb-1">Belum punya materi? Tenang.</p>
                  <p className="text-sm text-ink-600 mb-3">
                    Kamu tetap bisa melanjutkan pesanan. Jelaskan kebutuhanmu dan tim AIDIL STORE akan membantu
                    menyiapkan layanan sesuai permintaan.
                  </p>
                  <textarea
                    value={materialText}
                    onChange={(e) => setMaterialText(e.target.value)}
                    rows={5}
                    placeholder="Jelaskan tugas atau kebutuhan yang ingin kamu buat..."
                    className="w-full rounded-lg border border-ink-900/15 p-3 text-sm focus:border-signal-500 outline-none"
                  />
                </div>
              )}

              {error && <p className="mt-3 text-xs text-flag-500">{error}</p>}

              <button
                disabled={!materialStatus}
                onClick={handleMaterialNext}
                className="mt-5 w-full rounded-full bg-ink-950 py-3 text-sm font-semibold text-white disabled:opacity-30 hover:bg-ink-800 transition-colors"
              >
                Lanjut
              </button>
            </div>
          )}

          {step === "configuration" && (
            <div className="space-y-5">
              {product.variations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-ink-800 mb-2">Pilih variasi</label>
                  <div className="space-y-2">
                    {product.variations.map((v) => (
                      <label
                        key={v.id}
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${
                          variationId === v.id ? "border-signal-500 bg-signal-500/5" : "border-ink-900/15"
                        }`}
                      >
                        <div>
                          <input
                            type="radio"
                            name="variation"
                            className="mr-2 accent-signal-500"
                            checked={variationId === v.id}
                            onChange={() => setVariationId(v.id)}
                          />
                          <span className="text-sm font-medium text-ink-900">{v.name}</span>
                          {v.description && <p className="ml-5 text-xs text-ink-500">{v.description}</p>}
                        </div>
                        <span className="text-sm font-semibold text-signal-600">{formatRupiah(v.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {product.configFields.map((field) => (
                <ConfigFieldInput
                  key={field.id}
                  field={field}
                  value={configuration[field.field_key] ?? ""}
                  onChange={(v) => setConfiguration((prev) => ({ ...prev, [field.field_key]: v }))}
                />
              ))}

              <div>
                <label className="block text-sm font-medium text-ink-800 mb-2">Deadline</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="rounded-lg border border-ink-900/15 p-2.5 text-sm focus:border-signal-500 outline-none"
                  />
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="rounded-lg border border-ink-900/15 p-2.5 text-sm focus:border-signal-500 outline-none"
                  />
                </div>
                {isUrgent && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-flag-500">
                    <AlertTriangle size={13} />
                    Deadline sangat dekat. Biaya express{" "}
                    {product.express_fee_percent ? `+${product.express_fee_percent}%` : ""} mungkin berlaku.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-800 mb-2">Catatan (opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Referensi, gaya desain, tingkat kesulitan, atau catatan lain..."
                  className="w-full rounded-lg border border-ink-900/15 p-3 text-sm focus:border-signal-500 outline-none"
                />
              </div>

              {error && <p className="text-xs text-flag-500">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Tambahkan ke Keranjang — {formatRupiah(unitPrice)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border py-3 text-sm font-semibold transition-colors ${
        active ? "border-signal-500 bg-signal-500/10 text-signal-600" : "border-ink-900/15 text-ink-700"
      }`}
    >
      {label}
    </button>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-ink-950 text-white" : "bg-paper-100 text-ink-600"
      }`}
    >
      {label}
    </button>
  );
}

function ConfigFieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = `${field.field_label}${field.is_required ? " *" : ""}`;

  if (field.field_type === "select" && field.options) {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-2">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm focus:border-signal-500 outline-none"
        >
          <option value="">Pilih {field.field_label.toLowerCase()}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-2">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-ink-900/15 p-3 text-sm focus:border-signal-500 outline-none"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink-800 mb-2">{label}</label>
      <input
        type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm focus:border-signal-500 outline-none"
      />
    </div>
  );
}
