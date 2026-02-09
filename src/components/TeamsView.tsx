import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Mail, Phone, MapPin, Building2, Plus, Users, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function TeamsView() {
    const engineers = useQuery(api.engineers.getMyEngineers) || [];
    const { t } = useLanguage();
    const [showInviteModal, setShowInviteModal] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('team')}</h2>
                    <p className="text-slate-500">Manage your site engineers and staff</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    <span>Add Engineer</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {engineers.map((eng: any) => (
                    <div key={eng._id} className="bento-card group hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {eng.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{eng.name}</h3>
                                    <p className="text-xs text-slate-500">Site Engineer</p>
                                </div>
                            </div>
                            <span className="badge badge-success text-xs">Active</span>
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                {eng.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone size={16} className="text-slate-400" />
                                +964 780 123 4567
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                            <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100">
                                View Tasks
                            </button>
                            <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100">
                                Profile
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {engineers.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Users size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-slate-900">No Team Members</h3>
                        <p className="max-w-xs text-center mb-6">Start by adding engineers to your team to assign tasks and track progress.</p>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="btn btn-primary"
                        >
                            Add First Engineer
                        </button>
                    </div>
                )}
            </div>

            {showInviteModal && (
                <AddEngineerModal onClose={() => setShowInviteModal(false)} />
            )}
        </div>
    );
}

import { Modal } from "./ui/modal";

function AddEngineerModal({ onClose }: { onClose: () => void }) {
    const addEngineer = useMutation(api.engineers.addEngineer);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addEngineer({
                name: formData.name,
                email: formData.email,
            });
            toast.success("Engineer added successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to add engineer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add New Engineer" maxWidth="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Full Name</label>
                    <input
                        required
                        className="input-field"
                        placeholder="Ali Ahmed"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="label">Email Address</label>
                    <input
                        required
                        type="email"
                        className="input-field"
                        placeholder="ali@bunyan.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <button
                    disabled={loading}
                    className="btn btn-primary w-full py-2.5 mt-2"
                >
                    {loading ? "Adding..." : "Add Engineer"}
                </button>
            </form>
        </Modal>
    );
}
