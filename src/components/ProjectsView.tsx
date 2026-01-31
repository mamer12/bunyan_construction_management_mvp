import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MapPin, Building2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useLanguage } from "../contexts/LanguageContext";

import { useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";

export function ProjectsView() {
    const projects = useQuery(api.tasks.getProjects) || [];
    const { t } = useLanguage();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const COLORS = ['#10B981', '#3B82F6', '#E5E7EB']; // Emerald, Blue, Gray

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('projects')}</h2>
                    <p className="text-slate-500">Overview of all active construction sites</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project: any) => {
                    const completionRate = project.totalTasksCount > 0
                        ? Math.round((project.completedTasksCount / project.totalTasksCount) * 100)
                        : 0;

                    const budgetUsage = project.totalBudget > 0
                        ? Math.round((project.budgetSpent / project.totalBudget) * 100)
                        : 0;

                    const chartData = [
                        { name: 'Completed', value: project.completedTasksCount },
                        { name: 'Remaining', value: project.totalTasksCount - project.completedTasksCount }
                    ];

                    return (
                        <div key={project._id} className="bento-card group hover:border-blue-200 transition-colors">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{project.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                            <MapPin size={12} /> {project.location}
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge ${project.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                                    {project.status}
                                </span>
                            </div>

                            {/* Chart Area */}
                            <div className="h-48 relative mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="text-3xl font-bold font-cairo text-slate-900">{completionRate}%</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Progress</span>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Budget Used</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-lg font-bold font-cairo text-slate-900">{budgetUsage}%</span>
                                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${budgetUsage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 font-cairo">
                                        ${project.budgetSpent.toLocaleString()} / ${project.totalBudget.toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Units</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold font-cairo text-slate-900">{project.unitCount}</span>
                                        <span className="text-xs text-slate-500 badge badge-neutral">Total</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Project Placeholder */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bento-card border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/10 transition-all min-h-[300px]"
                >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-current">
                        <Building2 size={32} />
                    </div>
                    <span className="font-semibold">Add New Project</span>
                </button>
            </div>

            {showCreateModal && (
                <CreateProjectModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
