import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "../components/admin-layout";
import { adminApi, type AdminOrder } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatCrc(colones: number): string {
  return `₡${colones.toLocaleString("es-CR")}`;
}

export function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id ?? "", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending: { label: t("admin.statusPending"), className: "bg-yellow-100 text-yellow-800" },
    proof_submitted: { label: t("admin.statusProofSubmitted"), className: "bg-blue-100 text-blue-800" },
    approved: { label: t("admin.statusApproved"), className: "bg-green-100 text-green-800" },
    rejected: { label: t("admin.statusRejected"), className: "bg-red-100 text-red-800" },
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => adminApi.orders.get(orderId),
    enabled: !isNaN(orderId),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.orders.approve(orderId, adminNote || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast({ title: t("admin.orderApproved") });
      setApproveOpen(false);
      setAdminNote("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.orders.reject(orderId, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast({ title: t("admin.orderRejected") });
      setRejectOpen(false);
      setRejectReason("");
    },
  });

  if (isLoading || !order) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center py-12 w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const status = STATUS_LABELS[order.paymentStatus];
  const canReview = order.paymentStatus === "proof_submitted";
  const createdDate = new Date(order.createdAt).toLocaleString("es-CR");
  const reviewedDate = order.reviewedAt
    ? new Date(order.reviewedAt).toLocaleString("es-CR")
    : null;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pt-6 w-full">
        <Link href="/admin/orders">
          <a className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
            <ArrowLeft size={16} />
            {t("admin.orderDetailBack")}
          </a>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
            {order.orderNumber}
          </h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium w-fit ${
              status?.className ?? ""
            }`}
          >
            {status?.label ?? order.paymentStatus}
          </span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium w-fit ${
              order.paymentMethod === "sinpe"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {order.paymentMethod === "sinpe" ? "SINPE" : t("admin.paymentCard")}
          </span>
        </div>

        <div className="space-y-6">
          {/* Customer info */}
          <Section title={t("admin.sectionClient")}>
            <p className="font-medium text-slate-900">{order.customerName}</p>
            <p>
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-blue-600 hover:underline"
              >
                {order.customerEmail}
              </a>
            </p>
            {order.customerPhone && (
              <p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </p>
            )}
            {order.customerNote && (
              <p className="text-slate-600 mt-2 italic">
                &quot;{order.customerNote}&quot;
              </p>
            )}
          </Section>

          {/* Items */}
          <Section title={t("admin.sectionItems")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-4 font-medium text-slate-600">
                      {t("admin.itemProduct")}
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-slate-600">
                      {t("admin.itemVariant")}
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-slate-600">
                      {t("admin.itemQty")}
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-slate-600">
                      {t("admin.itemPrice")}
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-slate-600">
                      {t("admin.itemTotal")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-900">{item.name}</td>
                      <td className="py-2 px-4 text-slate-500">
                        {[item.size, item.color].filter(Boolean).join(" / ") ||
                          "—"}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-700">
                        {formatUsd(item.priceUsd)}
                      </td>
                      <td className="py-2 pl-4 text-right font-medium text-slate-900">
                        {formatUsd(item.priceUsd * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-sm text-right">
              <p>
                <span className="text-slate-500">{t("admin.subtotal")}:</span>{" "}
                <span className="text-slate-900">
                  {formatUsd(order.subtotalUsd)}
                </span>
              </p>
              {order.shippingCrc > 0 && (
                <p>
                  <span className="text-slate-500">{t("admin.shippingLabel")}:</span>{" "}
                  <span className="text-slate-900">
                    {formatCrc(order.shippingCrc)}
                  </span>
                </p>
              )}
              <p className="font-medium text-base">
                <span className="text-slate-500">{t("admin.tableTotal")}:</span>{" "}
                <span className="text-slate-900">
                  {formatUsd(order.totalUsd)} / {formatCrc(order.totalCrc)}
                </span>
              </p>
            </div>
          </Section>

          {/* Shipping */}
          {order.shippingAddress && (
            <Section title={t("admin.sectionShipping")}>
              <p className="text-slate-900">
                {order.shippingAddress.provincia},{" "}
                {order.shippingAddress.canton},{" "}
                {order.shippingAddress.distrito}
              </p>
              {order.shippingAddress.puntoReferencia && (
                <p className="text-slate-600">
                  Ref: {order.shippingAddress.puntoReferencia}
                </p>
              )}
              {order.shippingAddress.pais && (
                <p className="text-slate-600">{order.shippingAddress.pais}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                {order.shippingZone} — {order.shippingMethod}
              </p>
            </Section>
          )}

          {/* Proof (SINPE only) */}
          {order.paymentMethod === "sinpe" && (
            <Section title={t("admin.sectionSinpeProof")}>
              {order.proofImageUrl ? (
                <div>
                  <a
                    href={order.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={order.proofImageUrl}
                      alt={t("admin.sectionSinpeProof")}
                      className="max-w-xs rounded-lg border border-slate-200 hover:opacity-90 transition-opacity"
                    />
                    <span className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
                      {t("admin.viewFullSize")} <ExternalLink size={14} />
                    </span>
                  </a>
                  {order.sinpeTransactionRef && (
                    <p className="mt-2 text-sm text-slate-600">
                      {t("admin.sinpeReference")}: {order.sinpeTransactionRef}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  {t("admin.noProofYet")}
                </p>
              )}
            </Section>
          )}

          {/* Admin note (if already reviewed) */}
          {order.adminNote && (
            <Section title={t("admin.sectionAdminNote")}>
              <p className="text-slate-700">{order.adminNote}</p>
              {reviewedDate && (
                <p className="text-xs text-slate-400 mt-1">
                  {t("admin.reviewedAt")}: {reviewedDate}
                </p>
              )}
            </Section>
          )}

          {/* Actions */}
          {canReview && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => setApproveOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check size={18} className="mr-2" />
                {t("admin.approve")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X size={18} className="mr-2" />
                {t("admin.reject")}
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-400">
            {t("admin.created")}: {createdDate}
          </p>
        </div>
      </div>

      {/* Approve dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.approveTitle", { orderNumber: order.orderNumber })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.approveDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={t("admin.approveNotePlaceholder")}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? t("admin.approving") : t("admin.approve")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.rejectTitle", { orderNumber: order.orderNumber })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.rejectDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("admin.rejectReasonPlaceholder")}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending || rejectReason.length < 10}
            >
              {rejectMutation.isPending ? t("admin.rejecting") : t("admin.reject")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
