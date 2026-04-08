import { useState } from "react";
import { useEclipticDebt } from "../../hooks/use-admin-billing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatUsd, formatDate } from "./billing-helpers";

interface EclipticDebtSectionProps {
  ecliptic: ReturnType<typeof useEclipticDebt>;
}

export function EclipticDebtSection({ ecliptic }: EclipticDebtSectionProps) {
  const { toast } = useToast();
  const [configOpen, setConfigOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Config form state
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Payment form state
  const [payAmount, setPayAmount] = useState("");
  const [payDescription, setPayDescription] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleConfigOpen = () => {
    if (ecliptic.data) {
      setDebtAmount((ecliptic.data.totalDebt / 100).toString());
      setDebtNotes(ecliptic.data.notes ?? "");
    }
    setConfigOpen(true);
  };

  const handleConfigSave = async () => {
    const totalDebt = Math.round(parseFloat(debtAmount) * 100);
    if (isNaN(totalDebt) || totalDebt < 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }
    try {
      await ecliptic.updateConfig({ totalDebt, notes: debtNotes || undefined });
      setConfigOpen(false);
      toast({ title: "Configuracion actualizada" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handlePaymentSave = async () => {
    const amount = Math.round(parseFloat(payAmount) * 100);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }
    if (!payDescription.trim()) {
      toast({ title: "Descripcion requerida", variant: "destructive" });
      return;
    }
    try {
      await ecliptic.addPayment({
        amount,
        description: payDescription.trim(),
        paidAt: new Date(payDate).toISOString(),
      });
      setPaymentOpen(false);
      setPayAmount("");
      setPayDescription("");
      setPayDate(new Date().toISOString().split("T")[0]);
      toast({ title: "Pago registrado" });
    } catch {
      toast({ title: "Error al registrar pago", variant: "destructive" });
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      await ecliptic.deletePayment(id);
      toast({ title: "Pago eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  if (ecliptic.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = ecliptic.data;
  const progressPct =
    data && data.totalDebt > 0
      ? Math.min(100, Math.round((data.totalPaid / data.totalDebt) * 100))
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Deuda Ecliptic</CardTitle>
            <CardDescription>
              Seguimiento de pagos al desarrollador
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleConfigOpen}>
                  <Settings size={16} className="mr-1" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Deuda</DialogTitle>
                  <DialogDescription>
                    Define el monto total de la deuda con Ecliptic
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Deuda Total (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Notas</Label>
                    <Textarea
                      value={debtNotes}
                      onChange={(e) => setDebtNotes(e.target.value)}
                      placeholder="Notas opcionales..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfigOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleConfigSave} disabled={ecliptic.isMutating}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  Agregar Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pago</DialogTitle>
                  <DialogDescription>
                    Registra un pago a Ecliptic
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Monto (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Descripcion</Label>
                    <Input
                      value={payDescription}
                      onChange={(e) => setPayDescription(e.target.value)}
                      placeholder="Ej: Pago mensual enero"
                    />
                  </div>
                  <div>
                    <Label>Fecha de Pago</Label>
                    <Input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePaymentSave}
                    disabled={ecliptic.isMutating}
                  >
                    Registrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        {data && data.totalDebt > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Pagado: {formatUsd(data.totalPaid)} de {formatUsd(data.totalDebt)}
              </span>
              <span className="font-medium text-slate-900">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
            <div className="flex justify-between text-sm text-slate-500">
              <span>
                Restante:{" "}
                <span className="font-semibold text-slate-700">
                  {formatUsd(data.remaining)}
                </span>
              </span>
            </div>
            {data.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">{data.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay deuda configurada. Usa el boton "Configurar" para definir el
            monto.
          </p>
        )}

        {/* Payment History */}
        {data && data.payments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Historial de Pagos
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(payment.paidAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatUsd(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={ecliptic.isMutating}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
