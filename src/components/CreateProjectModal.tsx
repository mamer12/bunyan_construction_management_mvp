import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface CreateProjectModalProps {
    onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
    const { t, language } = useLanguage();
    const createProject = useMutation(api.tasks.createProject);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        totalBudget: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createProject({
                name: formData.name,
                location: formData.location,
                totalBudget: Number(formData.totalBudget),
            });
            toast.success("Project created successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to create project");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Add New Project</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Al-Mansour Complex"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Baghdad, Karrada"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget (IQD)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="input-field"
                            placeholder="0.00"
                            value={formData.totalBudget}
                            onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
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
                            {loading ? t('loading') : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
