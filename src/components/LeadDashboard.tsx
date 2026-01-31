import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    ClipboardList,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    TrendingUp,
    MoreHorizontal,
    X,
    Banknote
} from "lucide-react";
import { toast } from "sonner";
import { CreateTaskModal } from "./CreateTaskModal";
import { PayoutsTab } from "./PayoutsTab";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProjectsView } from "./ProjectsView";
import { TeamsView } from "./TeamsView";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

export function LeadDashboard() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Data Queries
    const stats = useQuery(api.tasks.getStats);
    const tasksForReview = useQuery(api.tasks.getTasksForReview) || [];
    const allTasks = useQuery(api.tasks.getAllTasks) || [];
    const engineers = useQuery(api.tasks.getMyEngineers) || [];
    const units = useQuery(api.tasks.getAllUnits) || [];

    const reviewTask = useMutation(api.tasks.reviewTask);

    const handleReview = async (taskId: string, action: "approve" | "reject", comment?: string) => {
        try {
            await reviewTask({ taskId: taskId as any, action, comment });
            toast.success(action === "approve" ? "Task approved!" : "Task rejected");
            setSelectedTask(null);
        } catch (error) {
            toast.error("Failed to review task");
        }
    };

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content">
                <TopBar
                    breadcrumb={activeTab === 'dashboard' ? t('welcome') : t(activeTab as any)}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                />

                <div className="p-8">
                    {activeTab === "dashboard" && (
                        <div className="flex flex-col gap-6">
                            {/* BENTO GRID HERO */}
                            <div className="bento-grid" style={{ padding: 0 }}>
                                {/* CARD A: Project Health */}
                                <div className="bento-card span-2 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=1000&auto=format&fit=crop')" }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                                    </div>
                                    <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                                                {t('onTrack')}
                                            </span>
                                            <span className="text-sm opacity-80">Unit 4B Phase 2</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 font-cairo">Al-Mansour Complex</h3>
                                        <div className="w-full bg-white/10 rounded-full h-2 mb-2 backdrop-blur-sm">
                                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: "65%" }} />
                                        </div>
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Progress</span>
                                            <span className="text-amber-400 font-bold">65%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD B: Financials */}
                                <div className="bento-card relative overflow-hidden">
                                    <div className="card-body flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                                <Banknote size={24} />
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded-full">
                                                <TrendingUp size={12} className="mr-1" /> +12%
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500 font-medium mb-1">{t('totalDisbursed')}</div>
                                            <div className="text-2xl font-bold text-slate-900 font-cairo">450M <span className="text-sm text-slate-400 font-normal">IQD</span></div>
                                        </div>
                                    </div>
                                    {/* Decorative Chart Line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-50 to-transparent" />
                                    <svg className="absolute bottom-0 left-0 right-0 text-amber-500 opacity-20" height="40" width="100%" preserveAspectRatio="none">
                                        <path d="M0,40 L0,20 C50,20 50,10 100,10 C150,10 150,30 200,30 C250,30 250,0 300,0 L300,40 Z" fill="currentColor" />
                                    </svg>
                                </div>

                                {/* CARD C: Action Items */}
                                <div className="bento-card bg-slate-900 text-white border-none">
                                    <div className="card-body flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <div className="text-slate-400">{t('pendingReviews')}</div>
                                            <AlertCircle className="text-amber-500" size={24} />
                                        </div>
                                        <div className="flex items-end gap-2 mb-4">
                                            <span className="text-5xl font-bold font-cairo">{tasksForReview.length}</span>
                                            <span className="text-sm text-slate-400 mb-2">{t('tasksAwaiting')}</span>
                                        </div>
                                        <button
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                            onClick={() => {
                                                if (tasksForReview.length > 0) {
                                                    setSelectedTask(tasksForReview[0]);
                                                }
                                            }}
                                        >
                                            {t('reviewTask')} <ArrowUpRight size={18} className="rtl:rotate-180" />
                                        </button>
                                    </div>
                                </div>

                                {/* CARD D: Team Activity */}
                                <div className="bento-card span-4 lg:span-2">
                                    <div className="card-header flex justify-between items-center">
                                        <h3 className="card-title">{t('recentActivity')}</h3>
                                        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                                    </div>
                                    <div className="p-0">
                                        {tasksForReview.length > 0 ? (
                                            tasksForReview.slice(0, 3).map((task: any, i: number) => (
                                                <div key={task._id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {task.engineerName?.charAt(0) || "U"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            <span className="font-bold">{task.engineerName}</span> submitted proof for <span className="text-blue-600">{task.unit}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                            <Clock size={12} /> {new Date(task.submittedAt || Date.now()).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 rtl:rotate-180" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                                <CheckCircle2 size={32} className="mb-2 opacity-50" />
                                                <p>All caught up! No recent activity.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TASKS TABLE SECTION */}
                            <div className="bento-card">
                                <div className="card-header flex justify-between items-center">
                                    <h3 className="card-title">All Tasks</h3>
                                    <button
                                        className="btn btn-primary text-sm px-4 py-2 h-auto"
                                        onClick={() => setShowCreateModal(true)}
                                    >
                                        <Plus size={16} /> New Task
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                                                <th className="p-4 font-semibold">Task Title</th>
                                                <th className="p-4 font-semibold">Location</th>
                                                <th className="p-4 font-semibold">Assigned To</th>
                                                <th className="p-4 font-semibold">Amount</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTasks.map((task: any) => (
                                                <tr key={task._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                    <td className="p-4 font-medium text-slate-900">{task.title}</td>
                                                    <td className="p-4 text-slate-500 flex items-center gap-1">
                                                        <MapPin size={14} /> {task.unit}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                                                                {task.engineerName?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-slate-600">{task.engineerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-cairo font-semibold text-slate-900">${task.amount.toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <span className={cn(
                                                            "badge",
                                                            task.status === "APPROVED" ? "badge-success" :
                                                                task.status === "REJECTED" ? "badge-danger" :
                                                                    task.status === "SUBMITTED" ? "badge-warning" : "badge-neutral"
                                                        )}>
                                                            {task.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "finance" && (
                        <PayoutsTab />
                    )}

                    {activeTab === "projects" && (
                        <ProjectsView />
                    )}

                    {activeTab === "team" && (
                        <TeamsView />
                    )}
                </div>
            </main>

            {/* MODALS */}
            {showCreateModal && (
                <CreateTaskModal
                    units={units}
                    engineers={engineers}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {selectedTask && (
                <TaskReviewModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onReview={handleReview}
                />
            )}
        </div>
    );
}

function TaskReviewModal({ task, onClose, onReview }: {
    task: any;
    onClose: () => void;
    onReview: (taskId: string, action: "approve" | "reject", comment?: string) => void;
}) {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: "approve" | "reject") => {
        setLoading(true);
        await onReview(task._id, action, comment || undefined);
        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal flex-row overflow-hidden max-w-[1000px] h-[600px]" onClick={(e) => e.stopPropagation()}>
                {/* Left: Details */}
                <div className="flex-1 flex flex-col p-8 border-r border-slate-100 bg-white overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Review Task</span>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{task.title}</h2>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold font-cairo text-navy">${task.amount.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Payout Amount</div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Users size={16} className="text-slate-400" /> Engineer
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    {task.engineerName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{task.engineerName}</div>
                                    <div className="text-xs text-slate-500">Submitted {new Date(task.submittedAt || Date.now()).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {task.description || "No description provided."}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-900 mb-2 block">Feedback (Optional)</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add notes for the engineer..."
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Proof & Actions */}
                <div className="flex-1 bg-slate-50 flex flex-col relative">
                    <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors" onClick={onClose}>
                        <X size={18} />
                    </button>

                    <div className="flex-1 p-4 flex items-center justify-center bg-slate-900/5 backdrop-blur-sm relative overflow-hidden">
                        {task.photoUrl ? (
                            <img
                                src={task.photoUrl}
                                alt="Proof"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <AlertCircle size={48} className="mb-2" />
                                <p>No image submitted</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                        <button
                            className="flex-1 py-4 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                            onClick={() => handleAction("reject")}
                            disabled={loading}
                        >
                            Reject
                        </button>
                        <button
                            className="flex-1 py-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1"
                            onClick={() => handleAction("approve")}
                            disabled={loading}
                        >
                            Approve & Pay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
