import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    ClipboardList,
    Users,
    CheckCircle2,
    Clock,
    Plus,
    MapPin,
    TrendingUp,
    X,
    FileText,
    Building2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTaskModal } from "./CreateTaskModal";
import { ManagementDashboard } from "./ManagementDashboard";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProjectsView } from "./ProjectsView";
import { TeamsView } from "./TeamsView";
import { StockView } from "./StockView";
import { SettingsView } from "./SettingsView";
import { SalesView } from "./Sales";
import { FinanceOverview } from "./FinanceOverview";
import { FloatingMobileNav } from "./FloatingMobileNav";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/use-mobile";
import {
    MotionCard,
    MotionButton,
} from "./ui/motion";
import { Modal } from "./ui/modal";

export function LeadDashboard({ showHeader = true }: { showHeader?: boolean }) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useIsMobile();

    // Data Queries
    const role = useQuery(api.roles.getMyRole);
    const currentUser = useQuery(api.auth.loggedInUser);

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

    const ROLE_MENU_ACCESS: Record<string, string[]> = {
        admin: ["dashboard", "management", "projects", "sales", "finance", "team", "stock", "settings"],
        acting_manager: ["dashboard", "management", "projects", "sales", "finance", "team"],
        lead: ["dashboard", "projects", "finance", "team"],
        engineer: ["dashboard", "projects"],
        finance: ["dashboard", "finance"],
        stock: ["dashboard", "stock"],
        sales_agent: ["dashboard", "sales"],
        broker: ["dashboard", "sales"],
        guest: ["dashboard"],
    };

    const allowedMenuIds = ROLE_MENU_ACCESS[role || "guest"] || ROLE_MENU_ACCESS.guest;

    const completedTasks = allTasks.filter((t: any) => t.status === "APPROVED").length;
    const totalTasks = allTasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-4 md:gap-6"
                    >
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MotionCard delay={0.1}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'المشاريع' : 'Projects'}</p>
                                        <p className="text-2xl font-bold text-slate-900">{units.length}</p>
                                    </div>
                                </div>
                            </MotionCard>
                            <MotionCard delay={0.2}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <ClipboardList size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'المهام' : 'Tasks'}</p>
                                        <p className="text-2xl font-bold text-slate-900">{allTasks.length}</p>
                                    </div>
                                </div>
                            </MotionCard>
                            <MotionCard delay={0.3}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'للمراجعة' : 'To Review'}</p>
                                        <p className="text-2xl font-bold text-slate-900">{tasksForReview.length}</p>
                                    </div>
                                </div>
                            </MotionCard>
                            <MotionCard delay={0.4}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">{language === 'ar' ? 'الإنجاز' : 'Completion'}</p>
                                        <p className="text-2xl font-bold text-slate-900">{completionPercentage}%</p>
                                    </div>
                                </div>
                            </MotionCard>
                        </div>

                        {/* Recent Activity & Tasks Table */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Tasks for Review Table */}
                            <MotionCard delay={0.5}>
                                <div className="card-header pb-4 border-b border-slate-50 mb-4 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'مهام للمراجعة' : 'Tasks for Review'}</h3>
                                    <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase tracking-wider">
                                        {tasksForReview.length} {language === 'ar' ? 'معلقة' : 'Pending'}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-50">
                                                <th className="pb-3 px-1">{language === 'ar' ? 'المهمة' : 'Task'}</th>
                                                <th className="pb-3 px-1">{language === 'ar' ? 'المهندس' : 'Engineer'}</th>
                                                <th className="pb-3 px-1">{language === 'ar' ? 'المشروع' : 'Project'}</th>
                                                <th className="pb-3 px-1 text-right">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {tasksForReview.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                                                        {language === 'ar' ? 'لا توجد مهام للمراجعة' : 'No tasks waiting for review'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                tasksForReview.map((task: any) => (
                                                    <tr
                                                        key={task._id}
                                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                        onClick={() => setSelectedTask(task)}
                                                    >
                                                        <td className="py-3 px-1">
                                                            <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{task.title}</p>
                                                            <p className="text-[10px] text-slate-400">{new Date(task.submittedAt || Date.now()).toLocaleDateString()}</p>
                                                        </td>
                                                        <td className="py-3 px-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                                                    {task.engineerName?.charAt(0)}
                                                                </div>
                                                                <span className="text-xs text-slate-600">{task.engineerName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-1">
                                                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{task.project}</span>
                                                        </td>
                                                        <td className="py-3 px-1 text-right">
                                                            <span className="text-sm font-bold text-slate-900">${task.amount.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </MotionCard>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Activity */}
                                <MotionCard delay={0.6}>
                                    <div className="card-header pb-4 border-b border-slate-50 mb-4 font-bold text-slate-800">
                                        {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                                    </div>
                                    <div className="space-y-4">
                                        {allTasks.slice(0, 5).map((task: any) => (
                                            <div key={task._id} className="flex gap-4 items-start group">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                                    task.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" :
                                                        task.status === 'REJECTED' ? "bg-rose-50 text-rose-600" :
                                                            "bg-blue-50 text-blue-600"
                                                )}>
                                                    {task.status === 'APPROVED' ? <CheckCircle2 size={16} /> :
                                                        task.status === 'REJECTED' ? <X size={16} /> :
                                                            <Clock size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate">{task.title}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {task.engineerName} • {new Date(task.updatedAt || Date.now()).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                                                    task.status === 'APPROVED' ? "bg-emerald-500 text-white" :
                                                        task.status === 'REJECTED' ? "bg-rose-500 text-white" :
                                                            "bg-blue-500 text-white"
                                                )}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </MotionCard>

                                {/* Quick Actions */}
                                <MotionCard delay={0.7}>
                                    <div className="card-header pb-4 border-b border-slate-50 mb-4 font-bold text-slate-800">
                                        {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{language === 'ar' ? 'مهمة جديدة' : 'New Task'}</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('team')}
                                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{language === 'ar' ? 'إدارة الفريق' : 'Team Management'}</span>
                                        </button>
                                    </div>
                                </MotionCard>
                            </div>
                        </div>
                    </motion.div>
                );
            case "management":
                return <ManagementDashboard showHeader={false} />;
            case "projects":
                return <ProjectsView />;
            case "finance":
                return <FinanceOverview />;
            case "team":
                return <TeamsView />;
            case "stock":
                return <StockView />;
            case "sales":
                return <SalesView />;
            case "settings":
                return <SettingsView />;
            default:
                return null;
        }
    };

    if (!showHeader) {
        return (
            <div className="p-4 md:p-6">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="main-content">
                <TopBar
                    breadcrumb={activeTab === 'dashboard' ? t('welcome') || "Dashboard" : t(activeTab as any) || activeTab}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    userName={currentUser?.name || "User"}
                    userRole={role || "guest"}
                />

                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {showCreateModal && (
                        <CreateTaskModal
                            units={units}
                            engineers={engineers}
                            onClose={() => setShowCreateModal(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedTask && (
                        <TaskReviewModal
                            task={selectedTask}
                            onClose={() => setSelectedTask(null)}
                            onReview={handleReview}
                        />
                    )}
                </AnimatePresence>

                {isMobile && (
                    <FloatingMobileNav
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        allowedMenuIds={allowedMenuIds}
                    />
                )}
            </main>
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
        <Modal isOpen={true} onClose={onClose} title="Review Task" maxWidth="2xl">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Details */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-emerald-600">${task.amount.toLocaleString()}</span>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Reward</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                            {task.engineerName?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{task.engineerName}</p>
                            <p className="text-xs text-slate-500">Submitted {new Date(task.submittedAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {task.description && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100">{task.description}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Review Comment</h4>
                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none min-h-[120px]"
                            placeholder="Add feedback for the engineer (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <MotionButton
                            className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                            onClick={() => handleAction("reject")}
                            disabled={loading}
                        >
                            <X size={20} /> Reject Work
                        </MotionButton>
                        <MotionButton
                            className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                            onClick={() => handleAction("approve")}
                            disabled={loading}
                        >
                            <CheckCircle2 size={20} /> Approve & Pay
                        </MotionButton>
                    </div>
                </div>

                {/* Right: Photo Preview */}
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center lg:text-left">Proof of Work</h4>
                    <div className="aspect-[4/5] rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                        {task.photoUrl ? (
                            <img
                                src={task.photoUrl}
                                alt="Proof of work"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="text-center text-slate-400">
                                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No photo uploaded</p>
                            </div>
                        )}
                        {task.gps && (
                            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] flex items-center gap-2">
                                <MapPin size={12} className="text-emerald-400" />
                                <span>Verified GPS Location: {task.gps.lat.toFixed(6)}, {task.gps.lng.toFixed(6)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
