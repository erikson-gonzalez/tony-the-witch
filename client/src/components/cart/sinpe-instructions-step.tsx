import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Upload, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { inputClass, labelClass } from "./cart-items-list";

interface SinpeInstructionsStepProps {
  orderNumber: string;
  totalCrc: number;
  sinpePhone: string;
  sinpeAccountHolder: string;
  sinpeBankName?: string;
  isSubmitting: boolean;
  onSubmitProof: (proofUrl: string, transactionRef?: string) => Promise<boolean>;
  onSkip: () => void;
}

export function SinpeInstructionsStep({
  orderNumber,
  totalCrc,
  sinpePhone,
  sinpeAccountHolder,
  sinpeBankName,
  isSubmitting,
  onSubmitProof,
  onSkip,
}: SinpeInstructionsStepProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const copyPhone = useCallback(async () => {
    const markCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    try {
      await navigator.clipboard.writeText(sinpePhone);
      markCopied();
    } catch {
      // Fallback for browsers that block the async clipboard API
      try {
        const ta = document.createElement("textarea");
        ta.value = sinpePhone;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        markCopied();
      } catch {
        // give up silently
      }
    }
  }, [sinpePhone]);

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
  }, [file, transactionRef, onSubmitProof, t]);

  const busy = uploading || isSubmitting;
  const crcFormatted = `₡${totalCrc.toLocaleString("es-CR")}`;

  return (
    <motion.div
      key="sinpe-instructions-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">
          {t("checkout.sinpeInstructions")}
        </p>

        {/* Phone number */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpePhone")}</p>
          {sinpePhone ? (
            <>
              <p className="text-3xl md:text-4xl font-mono font-bold text-amber-400 tracking-wider mb-3">
                {sinpePhone}
              </p>
              <button
                onClick={copyPhone}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border text-xs uppercase tracking-widest transition-colors ${
                  copied
                    ? "border-green-400/60 text-green-400"
                    : "border-amber-400/60 text-amber-400 hover:bg-amber-400 hover:text-black"
                }`}
                title={t("checkout.copy")}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t("checkout.sinpeCopied") : `${t("checkout.copy")} ${sinpePhone}`}
              </button>
            </>
          ) : (
            <p className="text-sm text-red-400">{t("checkout.sinpeNoPhone")}</p>
          )}
        </div>

        {/* Account holder */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeAccountHolder")}</p>
          <p className="text-white">{sinpeAccountHolder}</p>
          {sinpeBankName && (
            <p className="text-sm text-gray-400">{sinpeBankName}</p>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeAmount")}</p>
          <p className="text-2xl font-bold text-amber-400">{crcFormatted}</p>
        </div>

        {/* Reference */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeStep5")}</p>
          <p className="text-white font-mono font-medium">{orderNumber}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">1.</span>
            <span>{t("checkout.sinpeStep1")}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">2.</span>
            <span>{t("checkout.sinpeStep2")}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">3.</span>
            <span>{t("checkout.sinpeStep3")}: <span className="text-white font-mono">{sinpePhone}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">4.</span>
            <span>{t("checkout.sinpeStep4")}: <span className="text-white font-bold">{crcFormatted}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">5.</span>
            <span>{t("checkout.sinpeStep5")}: <span className="text-white font-mono">{orderNumber}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">6.</span>
            <span>{t("checkout.sinpeStep6")}</span>
          </div>
        </div>
      </div>

      {/* Proof upload — same screen */}
      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
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

      <button
        onClick={handleSubmit}
        disabled={!file || busy}
        className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? t("checkout.sinpeSubmitting") : t("checkout.sinpeSubmitProof")}
      </button>

      <button
        onClick={onSkip}
        disabled={busy}
        className="w-full mt-3 py-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
      >
        {t("checkout.sinpeUploadLater")}
      </button>
    </motion.div>
  );
}
