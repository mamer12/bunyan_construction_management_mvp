import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Banknote, Smartphone, Building2 } from "lucide-react";
import { toast } from "sonner";

interface PayoutModalProps {
    onClose: () => void;
}

const paymentMethods = [
    { id: "ZAINCASH", name: "ZainCash", icon: Smartphone, color: "#00a651" },
    { id: "CASH", name: "Cash", icon: Banknote, color: "#f59e0b" },
    { id: "BANK", name: "Bank Transfer", icon: Building2, color: "#3b82f6" },
];

import { Modal } from "./ui/modal";

export function PayoutModal({ onClose }: PayoutModalProps) {
    const wallet = useQuery(api.wallet.getMyWallet);
    const requestPayout = useMutation(api.wallet.requestPayout);

    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("ZAINCASH");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const maxAmount = wallet?.availableBalance || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (numAmount > maxAmount) {
            toast.error("Amount exceeds available balance");
            return;
        }

        setLoading(true);
        try {
            await requestPayout({
                amount: numAmount,
                paymentMethod: selectedMethod,
                notes: notes || undefined,
            });
            toast.success("Payout request submitted!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to request payout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Request Payout" maxWidth="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Available Balance */}
                <div style={{
                    padding: 16,
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        Available Balance
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success)" }}>
                        ${maxAmount.toLocaleString()}
                    </div>
                </div>

                {/* Amount Input */}
                <div>
                    <label className="label">Withdrawal Amount</label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)",
                            fontSize: "1.125rem",
                            fontWeight: 600
                        }}>$</span>
                        <input
                            className="input"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            max={maxAmount}
                            step="0.01"
                            style={{ paddingLeft: 32, fontSize: "1.125rem" }}
                            required
                        />
                    </div>
                    <div style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 8
                    }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setAmount(String(maxAmount * 0.25))}
                            style={{ flex: 1, fontSize: "0.75rem" }}
                        >
                            25%
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setAmount(String(maxAmount * 0.5))}
                            style={{ flex: 1, fontSize: "0.75rem" }}
                        >
                            50%
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setAmount(String(maxAmount))}
                            style={{ flex: 1, fontSize: "0.75rem" }}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <label className="label">Payment Method</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setSelectedMethod(method.id)}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    background: selectedMethod === method.id ? "var(--bg-secondary)" : "transparent",
                                    border: `2px solid ${selectedMethod === method.id ? method.color : "var(--border)"}`,
                                    borderRadius: "var(--radius-md)",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "all 0.15s ease"
                                }}
                            >
                                <method.icon
                                    size={24}
                                    style={{ color: selectedMethod === method.id ? method.color : "var(--text-muted)" }}
                                />
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    color: selectedMethod === method.id ? "var(--text-primary)" : "var(--text-muted)"
                                }}>
                                    {method.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="label">Notes (optional)</label>
                    <input
                        className="input"
                        type="text"
                        placeholder="e.g., Phone number for ZainCash"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading || !amount || parseFloat(amount) <= 0}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Banknote size={18} />
                                Request ${amount || "0"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
