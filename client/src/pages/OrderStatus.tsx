import { useState, useCallback } from "react";
import { useParams, useSearch, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Clock,
  FileCheck,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-meta";

interface OrderStatusData {
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  reviewedAt: string | null;
  customerName: string;
  items: { name: string; quantity: number }[];
}

const STATUS_CONFIG: Record<
  string,
  {
    icon: typeof Clock;
    color: string;
    bgColor: string;
    borderColor: string;
    i18nKey: string;
    i18nMessageKey: string;
  }
> = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    i18nKey: "orderStatus.pending",
    i18nMessageKey: "orderStatus.pendingMessage",
  },
  proof_submitted: {
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    i18nKey: "orderStatus.proofSubmitted",
    i18nMessageKey: "orderStatus.proofSubmittedMessage",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    i18nKey: "orderStatus.approved",
    i18nMessageKey: "orderStatus.approvedMessage",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    i18nKey: "orderStatus.rejected",
    i18nMessageKey: "orderStatus.rejectedMessage",
  },
};

export default function OrderStatus() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const emailFromUrl = searchParams.get("email") || "";
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  useDocumentMeta({ title: "Estado del pedido — Tony The Witch", noindex: true });

  const [email, setEmail] = useState(emailFromUrl);
  const [submittedEmail, setSubmittedEmail] = useState(emailFromUrl);

  const { data: order, isLoading, error } = useQuery<OrderStatusData>({
    queryKey: ["order-status", orderNumber, submittedEmail],
    queryFn: async () => {
      const res = await fetch(
        `/api/orders/${orderNumber}/status?email=${encodeURIComponent(submittedEmail)}`
      );
      if (res.status === 404) throw new Error("not_found");
      if (res.status === 400) throw new Error("email_required");
      if (!res.ok) throw new Error("fetch_error");
      return res.json();
    },
    enabled: !!orderNumber && !!submittedEmail,
    retry: false,
  });

  // If no email provided (manual navigation), show lookup form
  if (!submittedEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            {t("orderStatus.title")}
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            {t("orderStatus.enterEmail", {
              defaultValue: "Ingresá tu email para ver el estado de tu pedido",
            })}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setSubmittedEmail(email.trim());
            }}
            className="space-y-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Button type="submit" className="w-full">
              <Search size={16} className="mr-2" />
              {t("orderStatus.lookup", { defaultValue: "Consultar pedido" })}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/shop">
              <a className="text-blue-600 hover:underline text-sm">
                {t("common.continueShopping")}
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t("orderStatus.notFound")}
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            {t("orderStatus.notFoundHint", {
              defaultValue: "Verificá tu número de pedido y email.",
            })}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedEmail("");
              setEmail("");
            }}
            className="mb-2"
          >
            {t("orderStatus.tryAgain", { defaultValue: "Intentar de nuevo" })}
          </Button>
          <br />
          <Link href="/shop">
            <a className="text-blue-600 hover:underline text-sm">
              {t("common.continueShopping")}
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.paymentStatus];
  const StatusIcon = statusConfig?.icon ?? Clock;
  const createdDate = new Date(order.createdAt).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/shop">
          <a className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
            <ArrowLeft size={16} />
            {t("common.continueShopping")}
          </a>
        </Link>

        <h1 className="text-sm font-medium text-slate-500 mb-1">
          {t("orderStatus.title")}
        </h1>
        <p className="text-2xl font-bold text-slate-900 font-mono mb-2">
          {order.orderNumber}
        </p>
        <p className="text-slate-600 mb-6">
          {t("orderStatus.greeting", { name: order.customerName })}
        </p>

        {/* Status indicator */}
        {statusConfig && (
          <div
            className={`rounded-xl border p-5 mb-6 ${statusConfig.bgColor} ${statusConfig.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <StatusIcon size={28} className={statusConfig.color} />
              <div>
                <p className={`font-semibold ${statusConfig.color}`}>
                  {t(statusConfig.i18nKey)}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {t(statusConfig.i18nMessageKey)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Re-upload for rejected orders */}
        {order.paymentStatus === "rejected" && (
          <ReuploadSection
            orderNumber={order.orderNumber}
            email={submittedEmail}
            onUploaded={() =>
              queryClient.invalidateQueries({
                queryKey: ["order-status", orderNumber, submittedEmail],
              })
            }
          />
        )}

        {/* Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t("orderStatus.items")}
          </h2>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-slate-700"
              >
                <span>{item.name}</span>
                <span className="text-slate-400">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-400">
          {t("orderStatus.orderDate")}: {createdDate}
        </p>
      </div>
    </div>
  );
}

function ReuploadSection({
  orderNumber,
  email,
  onUploaded,
}: {
  orderNumber: string;
  email: string;
  onUploaded: () => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
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
        if (!uploadRes.ok) throw new Error("Upload failed");
        const { url } = await uploadRes.json();

        const proofRes = await fetch(`/api/orders/${orderNumber}/reupload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proofImageUrl: url, email }),
        });
        if (!proofRes.ok) throw new Error("Could not submit proof");

        onUploaded();
      } catch {
        setError(t("orderStatus.uploadError"));
      } finally {
        setUploading(false);
      }
    },
    [orderNumber, email, onUploaded]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {t("orderStatus.reupload")}
      </h2>
      <label className="block">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
          disabled={uploading}
          asChild
        >
          <span>
            <Upload size={20} className="text-slate-400" />
            <span className="text-sm text-slate-500">
              {uploading ? t("orderStatus.uploading") : t("checkout.sinpeUploadProof")}
            </span>
          </span>
        </Button>
      </label>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
