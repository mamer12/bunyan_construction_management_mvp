import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Plus, MapPin, Home, Layers, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { CreateUnitModal } from "./CreateUnitModal";
import { motion } from "framer-motion";

interface ProjectDetailsViewProps {
    projectId: Id<"projects">;
    onBack: () => void;
}

export function ProjectDetailsView({ projectId, onBack }: ProjectDetailsViewProps) {
    // We need a way to get a single project. 
    // Ideally we'd have getProject(id), but for now we filter from getProjects or we assume we passed the project object.
    // Let's rely on the lists for now or add a getProject query later. 
    // Actually, let's just use getProjects and find it to save adding more queries unless needed.
    const projects = useQuery(api.projects.getProjects) || [];
    const project = projects.find(p => p._id === projectId);

    const units = useQuery(api.units.getProjectUnits, { projectId }) || [];
    const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);

    if (!project) {
        return <div className="p-8 text-center">Loading project details...</div>;
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <MapPin size={14} />
                            {project.location}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowCreateUnitModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Unit
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bento-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Home size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Total Units</div>
                        <div className="text-2xl font-bold text-slate-900">{units.length}</div>
                    </div>
                </div>

                <div className="bento-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Total Tasks</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {units.reduce((acc, u) => acc + (u.totalTasks || 0), 0)}
                        </div>
                    </div>
                </div>

                <div className="bento-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Completed Tasks</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {units.reduce((acc, u) => acc + (u.completedTasks || 0), 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Units Grid */}
            <h3 className="text-lg font-bold text-slate-900 mt-2">Units</h3>

            {units.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Home className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500 font-medium">No units added yet</p>
                    <button
                        onClick={() => setShowCreateUnitModal(true)}
                        className="text-emerald-600 font-bold hover:underline mt-2"
                    >
                        Add your first unit
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {units.map((unit) => (
                        <motion.div
                            key={unit._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card p-5 group cursor-pointer hover:border-emerald-200 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    {unit.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                    {unit.status}
                                </span>
                            </div>

                            <h4 className="font-bold text-slate-900 mb-1">{unit.name}</h4>
                            <div className="text-xs text-slate-500 mb-4">
                                {unit.totalTasks || 0} tasks • {unit.completedTasks || 0} completed
                            </div>

                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full"
                                    style={{
                                        width: `${unit.totalTasks ? (unit.completedTasks / unit.totalTasks) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {showCreateUnitModal && (
                <CreateUnitModal
                    projectId={projectId}
                    onClose={() => setShowCreateUnitModal(false)}
                />
            )}
        </div>
    );
}
