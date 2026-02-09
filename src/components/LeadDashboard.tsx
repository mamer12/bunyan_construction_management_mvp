import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
import { TableContainer, DataTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";

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

    const tasksForReview = (useQuery(api.tasks.getTasksForReview) || []).filter((t): t is NonNullable<typeof t> => t != null);
    const allTasks = (useQuery(api.tasks.getAllTasks, {}) || []).filter((t): t is NonNullable<typeof t> => t != null);
    const engineers = useQuery(api.engineers.getMyEngineers) || [];
    const units = useQuery(api.units.getAllUnits) || [];

    const reviewTask = useMutation(api.tasks.reviewTask);

    const handleReview = async (taskId: string, action: "approve" | "reject", comment?: string) => {
        try {
            await reviewTask({ taskId: taskId as Id<"tasks">, action, comment });
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

    const completedTasks = allTasks.filter((t) => t.status === "APPROVED").length;
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
                        className="flex flex-col gap-6 md:gap-8 flex-1 min-h-0"
                    >
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                            {[
                                { label: language === 'ar' ? 'المشاريع' : 'Projects', value: units.length, icon: Building2, bg: 'bg-emerald-100', text: 'text-emerald-600' },
                                { label: language === 'ar' ? 'المهام' : 'Tasks', value: allTasks.length, icon: ClipboardList, bg: 'bg-blue-100', text: 'text-blue-600' },
                                { label: language === 'ar' ? 'للمراجعة' : 'To Review', value: tasksForReview.length, icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
                                { label: language === 'ar' ? 'الإنجاز' : 'Completion', value: completionPercentage, suffix: '%', icon: TrendingUp, bg: 'bg-purple-100', text: 'text-purple-600' },
                            ].map((stat, i) => (
                                <MotionCard key={stat.label} delay={0.1 + i * 0.05} className="min-w-0">
                                    <div className="flex items-center gap-3 min-w-0 p-1">
                                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.text)}>
                                            <stat.icon size={22} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-slate-500 font-medium truncate">{stat.label}</p>
                                            <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">{stat.value}{stat.suffix ?? ''}</p>
                                        </div>
                                    </div>
                                </MotionCard>
                            ))}
                        </div>

                        {/* Recent Activity & Tasks Table */}
                        <div className="grid grid-cols-1 gap-6 md:gap-8 flex-1 min-h-0">
                            {/* Tasks for Review Table */}
                            <MotionCard delay={0.5} className="overflow-hidden">
                                <header className="dashboard-section__header">
                                    <h3 className="dashboard-section__title truncate">{language === 'ar' ? 'مهام للمراجعة' : 'Tasks for Review'}</h3>
                                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 uppercase tracking-wide whitespace-nowrap">
                                        {tasksForReview.length} {language === 'ar' ? 'معلقة' : 'Pending'}
                                    </span>
                                </header>
                                <div className="dashboard-section__body pt-0">
                                    <TableContainer>
                                        <DataTable>
                                            <TableHeader>
                                                <TableRow className="border-b border-slate-100">
                                                    <TableHead className="pb-3 px-4">{language === 'ar' ? 'المهمة' : 'Task'}</TableHead>
                                                    <TableHead className="pb-3 px-4">{language === 'ar' ? 'المهندس' : 'Engineer'}</TableHead>
                                                    <TableHead className="pb-3 px-4">{language === 'ar' ? 'المشروع' : 'Project'}</TableHead>
                                                    <TableHead className="pb-3 px-4 text-end">{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-slate-50">
                                                {tasksForReview.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                                                            {language === 'ar' ? 'لا توجد مهام للمراجعة' : 'No tasks waiting for review'}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    tasksForReview.map((task) => (
                                                        <TableRow
                                                            key={task._id}
                                                            className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                            onClick={() => setSelectedTask(task)}
                                                        >
                                                            <TableCell className="py-3 px-4 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors truncate">{task.title}</p>
                                                                <p className="text-[10px] text-slate-400">{new Date(task.submittedAt || Date.now()).toLocaleDateString()}</p>
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600 flex-shrink-0">
                                                                        {task.engineerName?.charAt(0)}
                                                                    </div>
                                                                    <span className="text-xs text-slate-600 truncate">{task.engineerName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4">
                                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{task.project}</span>
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-end">
                                                                <span className="text-sm font-bold text-slate-900">${task.amount.toLocaleString()}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </DataTable>
                                    </TableContainer>
                                </div>
                            </MotionCard>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                {/* Recent Activity - same visual language as table */}
                                <MotionCard delay={0.6} className="overflow-hidden">
                                    <header className="dashboard-section__header">
                                        <h3 className="dashboard-section__title">{language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}</h3>
                                    </header>
                                    <div className="dashboard-section__body p-0">
                                        {allTasks.length === 0 ? (
                                            <div className="py-12 px-4 text-center">
                                                <Clock size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-3" />
                                                <p className="text-sm font-medium text-slate-500">{language === 'ar' ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
                                            </div>
                                        ) : (
                                            <ul className="divide-y divide-slate-100">
                                                {allTasks.slice(0, 5).map((task) => (
                                                    <li key={task._id} className="flex gap-3 items-center py-3 px-4 hover:bg-slate-50/50 transition-colors min-w-0">
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                            task.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" :
                                                                task.status === 'REJECTED' ? "bg-rose-50 text-rose-600" :
                                                                    "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {task.status === 'APPROVED' ? <CheckCircle2 size={18} /> :
                                                                task.status === 'REJECTED' ? <X size={18} /> :
                                                                    <Clock size={18} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {task.engineerName} · {new Date(task._creationTime || Date.now()).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-xs font-semibold uppercase shrink-0",
                                                            task.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                                                task.status === 'REJECTED' ? "bg-rose-100 text-rose-700 border border-rose-200" :
                                                                    "bg-slate-100 text-slate-600 border border-slate-200"
                                                        )}>
                                                            {task.status}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </MotionCard>

                                {/* Quick Actions - unified button style */}
                                <MotionCard delay={0.7} className="overflow-hidden">
                                    <header className="dashboard-section__header">
                                        <h3 className="dashboard-section__title">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
                                    </header>
                                    <div className="dashboard-section__body">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group min-h-[120px]"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                    <Plus size={24} />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 text-center leading-tight">{language === 'ar' ? 'مهمة جديدة' : 'New Task'}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('team')}
                                                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all group min-h-[120px]"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                    <Users size={24} />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 text-center leading-tight">{language === 'ar' ? 'إدارة الفريق' : 'Team Management'}</span>
                                            </button>
                                        </div>
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
            <div className="flex-1 p-6 md:p-8 lg:p-10 min-h-0">
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

            <main className="main-content flex flex-col min-h-screen">
                <TopBar
                    breadcrumb={activeTab === 'dashboard' ? t('welcome') || "Dashboard" : t(activeTab as any) || activeTab}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    userName={currentUser?.name || "User"}
                    userRole={role || "guest"}
                />

                <div className="flex-1 p-6 md:p-8 lg:p-10 min-h-0">
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
    task: Record<string, any>;
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
