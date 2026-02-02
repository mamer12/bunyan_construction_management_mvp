import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Clock,
    CheckCircle2,
    Play,
    AlertCircle,
    Plus,
    Image as ImageIcon,
    MapPin,
    X,
    Camera,
    Calendar,
    CreditCard,
    User,
    LogOut,
    Sparkles,
    TrendingUp,
    Briefcase,
    Building2,
    ClipboardList,
    FileText
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FloatingMobileNav } from "./FloatingMobileNav";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
    MotionCard,
    MotionButton,
    StaggerContainer,
    StaggerItem,
    AnimatedCounter,
    BentoGrid
} from "./ui/motion";
import { Modal } from "./ui/modal";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED";

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    amount: number;
    points: number;
    projectId: string;
    projectName: string;
    unitId: string;
    unitNumber: string;
    assignedTo: string;
    engineerName: string;
    submittedAt?: number;
    updatedAt?: number;
    photoUrl?: string;
    reviewComment?: string;
}

export function EngineerDashboard({ showHeader = true }: { showHeader?: boolean }) {
    const { t, language } = useLanguage();
    const { signOut } = useAuthActions();
    const isMobile = useIsMobile();

    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Data Queries
    const currentUser = useQuery(api.auth.loggedInUser);
    const role = useQuery(api.roles.getMyRole);
    const tasks = useQuery(api.tasks.getMyTasks) || [];
    const wallet = useQuery(api.wallet.getMyWallet) || { availableBalance: 0, points: 0, totalEarned: 0 };

    // Mutations
    const startTask = useMutation(api.tasks.startTask);
    const submitTaskMutation = useMutation(api.tasks.submitTask);

    const pendingTasks = tasks.filter((t: Task) => t.status === "PENDING");
    const inProgressTasks = tasks.filter((t: Task) => t.status === "IN_PROGRESS");
    const completedTasks = tasks.filter((t: Task) => t.status === "APPROVED");
    const rejectedTasks = tasks.filter((t: Task) => t.status === "REJECTED");

    const stats = [
        { label: t('pending') || 'Pending', value: pendingTasks.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: t('inProgress') || 'In Progress', value: inProgressTasks.length, icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: t('completed') || 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: t('rejected') || 'Rejected', value: rejectedTasks.length, icon: X, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {language === 'ar' ? 'نظرة عامة' : 'Mission Control'}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Track your tasks and progress
                                </p>
                            </div>
                            <div className="flex gap-4 items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="text-right px-3 border-r border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Available Balance</p>
                                    <p className="text-sm font-bold text-slate-800">${wallet.availableBalance.toLocaleString()}</p>
                                </div>
                                <div className="px-3">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Performance Points</p>
                                    <p className="text-sm font-bold text-emerald-600">{wallet.points} XP</p>
                                </div>
                            </div>
                        </div>

                        <BentoGrid columns={4}>
                            {stats.map((stat, i) => (
                                <MotionCard key={stat.label} delay={i * 0.1}>
                                    <div className="p-5 flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                                            <stat.icon size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <AnimatedCounter value={stat.value} className="text-xl font-bold text-slate-800" />
                                        </div>
                                    </div>
                                </MotionCard>
                            ))}
                        </BentoGrid>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Active Projects Snapshot */}
                            <MotionCard delay={0.5}>
                                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                        <Building2 size={16} className="text-emerald-500" />
                                        Active Site
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-emerald-200 group">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110">
                                            {tasks[0]?.projectName?.charAt(0) || "S"}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">{tasks[0]?.projectName || "No Project Assigned"}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                                <MapPin size={10} className="text-emerald-500" />
                                                Main Civil Works
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Task</p>
                                            <p className="text-xs font-bold text-slate-600 line-clamp-1">{inProgressTasks[0]?.title || "None"}</p>
                                        </div>
                                    </div>
                                </div>
                            </MotionCard>

                            {/* Performance Guide */}
                            <MotionCard delay={0.6} className="bg-slate-900 text-white border-none overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="p-6 relative z-10 flex flex-col h-full">
                                    <h4 className="font-bold text-white/50 uppercase text-[10px] tracking-[0.2em] mb-4">Engineer Protocol</h4>
                                    <p className="text-sm font-medium text-white/80 leading-relaxed mb-6">
                                        Ensure all photo submissions clearly show the work performed. GPS verification is automatic.
                                    </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Satellite Link Active</span>
                                        </div>
                                        <MotionButton className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">
                                            View Rules
                                        </MotionButton>
                                    </div>
                                </div>
                            </MotionCard>
                        </div>

                        {/* Tasks Section Placeholder */}
                        <div className="flex flex-col gap-4">
                            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest flex items-center gap-2 px-2">
                                <ClipboardList size={16} className="text-blue-500" />
                                My Tasks
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.slice(0, 6).map((task: Task, i: number) => (
                                    <TaskCard key={task._id} task={task} delay={0.7 + (i * 0.05)} onClick={() => setSelectedTask(task)} />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "projects":
                return (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <div className="text-center">
                            <Building2 size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">Project module loading...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!showHeader) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
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
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="main-content">
                <TopBar
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    userName={currentUser?.name || "Engineer"}
                    userRole={role || "engineer"}
                />

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>

                {isMobile && (
                    <FloatingMobileNav
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        allowedMenuIds={['dashboard', 'projects']}
                    />
                )}
            </main>
        </div>
    );
}

function TaskCard({ task, delay, onClick }: { task: Task; delay: number; onClick: () => void }) {
    const statusColors = {
        PENDING: "bg-amber-500",
        IN_PROGRESS: "bg-blue-500",
        SUBMITTED: "bg-purple-500",
        APPROVED: "bg-emerald-500",
        REJECTED: "bg-rose-500",
    };

    return (
        <MotionCard delay={delay} onClick={onClick} className="group overflow-hidden cursor-pointer">
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-tighter", statusColors[task.status])}>
                        {task.status}
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-slate-800">${task.amount}</span>
                    </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase text-xs tracking-tight">
                    {task.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                    {task.projectName} • Unit {task.unitNumber}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        <ClipboardList size={10} />
                        Details
                    </div>
                    <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        +{task.points} XP
                    </div>
                </div>
            </div>
        </MotionCard>
    );
}
