import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "./ui/modal";
import { MotionButton } from "./ui/motion";
import { X, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MaterialRequestModalProps {
    projectId: string; // Passed from parent
    unitId?: string;
    onClose: () => void;
}

export function MaterialRequestModal({ projectId, unitId, onClose }: MaterialRequestModalProps) {
    const inventory = useQuery(api.stock.getInventory) || [];
    const requestMaterial = useMutation(api.stock.requestMaterial);

    const [items, setItems] = useState<{ materialId: string; quantity: number }[]>([
        { materialId: "", quantity: 0 }
    ]);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");

    const addItem = () => {
        setItems([...items, { materialId: "", quantity: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: "materialId" | "quantity", value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const validItems = items.filter(i => i.materialId && i.quantity > 0);
        if (validItems.length === 0) {
            toast.error("Please add at least one valid item");
            return;
        }

        setLoading(true);
        try {
            await requestMaterial({
                projectId: projectId as any,
                unitId: unitId as any,
                items: validItems.map(i => ({
                    materialId: i.materialId as any,
                    quantity: Number(i.quantity)
                })),
                notes
            });
            toast.success("Material request submitted!");
            onClose();
        } catch (error) {
            toast.error("Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Request Materials" maxWidth="lg">
            <form onSubmit={handleSubmit} className="modal-body space-y-4">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="label">Material</label>
                                <select
                                    className="input"
                                    value={item.materialId}
                                    onChange={(e) => updateItem(index, "materialId", e.target.value)}
                                    required
                                >
                                    <option value="">Select Material</option>
                                    {inventory.map((mat) => (
                                        <option key={mat._id} value={mat._id}>
                                            {mat.name} ({mat.currentStock} {mat.unit} available)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="label">Qty</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={item.quantity || ""}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                    required
                                />
                            </div>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                >
                    <Plus size={16} /> Add Another Item
                </button>

                <div>
                    <label className="label">Notes (Optional)</label>
                    <textarea
                        className="input min-h-[80px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reason for request..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
