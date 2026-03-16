import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { inputClass, labelClass } from "./cart-items-list";

interface SinpeProofUploadStepProps {
  isSubmitting: boolean;
  onSubmitProof: (proofUrl: string, transactionRef?: string) => Promise<boolean>;
  onBack: () => void;
}

export function SinpeProofUploadStep({
  isSubmitting,
  onSubmitProof,
  onBack,
}: SinpeProofUploadStepProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError("");

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload/proof", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        setError(t("checkout.errorUpload"));
        return;
      }

      const { url } = await uploadRes.json();
      const success = await onSubmitProof(url, transactionRef || undefined);
      if (!success) {
        setError(t("checkout.errorSubmitProof"));
      }
    } catch {
      setError(t("checkout.errorConnection"));
    } finally {
      setUploading(false);
    }
  }, [file, transactionRef, onSubmitProof]);

  const busy = uploading || isSubmitting;

  return (
    <motion.div
      key="sinpe-proof-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">
          {t("checkout.sinpeUploadProof")}
        </p>

        <p className="text-sm text-gray-300 mb-4">
          {t("checkout.sinpeUploadDescription")}
        </p>

        {/* File input */}
        <label className="block mb-4 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />
          <div className={`border-2 border-dashed py-8 flex flex-col items-center justify-center gap-2 transition-colors ${
            file ? "border-amber-400/50" : "border-white/20 hover:border-white/40"
          }`}>
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 rounded" />
            ) : file ? (
              <>
                <FileText size={32} className="text-amber-400" />
                <p className="text-sm text-gray-300">{file.name}</p>
              </>
            ) : (
              <>
                <Upload size={28} className="text-gray-500" />
                <p className="text-sm text-gray-400">{t("checkout.sinpeUploadProof")}</p>
                <p className="text-xs text-gray-600">JPEG, PNG, WebP, PDF (max 10MB)</p>
              </>
            )}
          </div>
        </label>

        {/* Transaction ref */}
        <div>
          <label className={labelClass}>{t("checkout.sinpeTransactionRef")}</label>
          <input
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            className={inputClass}
            placeholder="Ej: 12345678"
            disabled={busy}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!file || busy}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? t("checkoutProcessing") : t("checkout.sinpeSubmitProof")}
        </button>
      </div>
    </motion.div>
  );
}
