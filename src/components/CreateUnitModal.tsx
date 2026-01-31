import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { Id } from "../../convex/_generated/dataModel";

interface CreateUnitModalProps {
    projectId: Id<"projects">;
    onClose: () => void;
}

export function CreateUnitModal({ projectId, onClose }: CreateUnitModalProps) {
    const { t } = useLanguage();
    const createUnit = useMutation(api.tasks.createUnit);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createUnit({
                projectId,
                name,
            });
            toast.success("Unit created successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to create unit");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Add New Unit</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Villa A01, Apt 2B"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                            disabled={loading}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? t('loading') : "Create Unit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
