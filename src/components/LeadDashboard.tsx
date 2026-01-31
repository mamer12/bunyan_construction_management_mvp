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
    Banknote,
    FileText,
    Map,
    BarChart3,
    Wallet,
    Building2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTaskModal } from "./CreateTaskModal";
import { PayoutsTab } from "./PayoutsTab";
import { FinanceOverview } from "./FinanceOverview";
import { ManagementDashboard } from "./ManagementDashboard";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProjectsView } from "./ProjectsView";
import { TeamsView } from "./TeamsView";
import { StockView } from "./StockView";
import { SettingsView } from "./SettingsView";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import {
    MotionCard,
    MotionGradientCard,
    AnimatedCounter,
    AnimatedDonut,
    MotionButton,
    MotionListItem,
    StaggerContainer,
    StaggerItem
} from "./ui/motion";
import { Modal } from "./ui/modal";

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

    // Calculate completion percentage
    const completedTasks = allTasks.filter((t: any) => t.status === "APPROVED").length;
    const totalTasks = allTasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-4 md:gap-6"
                            >
                                {/* BENTO GRID HERO */}
                                <div className="bento-grid p-0 gap-4 md:gap-6">
                                    {/* ... (cards 1-3 remain) ... */}

                                    {/* CARD 4: Quick Actions */}
                                    <MotionCard className="span-2" delay={0.3}>
                                        <div className="card-header">
                                            <h3 className="card-title">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    {
                                                        icon: Plus,
                                                        label: language === 'ar' ? 'مهمة جديدة' : 'New Task',
                                                        color: "#059669",
                                                        bg: "#ECFDF5",
                                                        onClick: () => setShowCreateModal(true)
                                                    },
                                                    {
                                                        icon: CheckCircle2,
                                                        label: language === 'ar' ? 'مراجعة المهام' : 'Review Tasks',
                                                        color: "#3B82F6",
                                                        bg: "#EFF6FF",
                                                        badge: tasksForReview.length,
                                                        onClick: () => {
                                                            // Scroll to tasks section or select first task
                                                            if (tasksForReview.length > 0) {
                                                                setSelectedTask(tasksForReview[0]);
                                                            } else {
                                                                toast.info(language === 'ar' ? 'لا توجد مهام للمراجعة' : 'No tasks to review');
                                                            }
                                                        }
                                                    },
                                                    {
                                                        icon: Building2,
                                                        label: t('projects'),
                                                        color: "#8B5CF6",
                                                        bg: "#F5F3FF",
                                                        onClick: () => setActiveTab('projects')
                                                    },
                                                    {
                                                        icon: Users,
                                                        label: t('team'),
                                                        color: "#F59E0B",
                                                        bg: "#FFFBEB",
                                                        onClick: () => setActiveTab('team')
                                                    },
                                                ].map((action, index) => (
                                                    <motion.button
                                                        key={action.label}
                                                        onClick={action.onClick}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 + index * 0.05 }}
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            gap: "0.75rem",
                                                            padding: "1.25rem",
                                                            background: action.bg,
                                                            border: "none",
                                                            borderRadius: "1.25rem",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s",
                                                            position: "relative"
                                                        }}
                                                        whileHover={{
                                                            scale: 1.05,
                                                            boxShadow: `0 8px 20px ${action.color}20`
                                                        }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {/* Badge for pending count */}
                                                        {action.badge && action.badge > 0 && (
                                                            <span style={{
                                                                position: "absolute",
                                                                top: 8,
                                                                right: 8,
                                                                minWidth: 20,
                                                                height: 20,
                                                                borderRadius: "50%",
                                                                background: "#EF4444",
                                                                color: "white",
                                                                fontSize: "0.7rem",
                                                                fontWeight: 700,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}>
                                                                {action.badge}
                                                            </span>
                                                        )}
                                                        <div style={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: "1rem",
                                                            background: "white",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: action.color,
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                                                        }}>
                                                            <action.icon size={24} />
                                                        </div>
                                                        <span style={{
                                                            fontSize: "0.8rem",
                                                            fontWeight: 600,
                                                            color: "var(--text-primary)"
                                                        }}>
                                                            {action.label}
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </MotionCard>

                                    {/* CARD 5: Live Updates / Recent Activity */}
                                    <MotionCard className="span-2" delay={0.35}>
                                        <div className="card-header" style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <h3 className="card-title">{t('recentActivity')}</h3>
                                            <motion.button
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "var(--text-secondary)",
                                                    cursor: "pointer",
                                                    padding: "0.5rem",
                                                    borderRadius: "0.5rem"
                                                }}
                                                whileHover={{ background: "var(--bg-mint)" }}
                                            >
                                                <MoreHorizontal size={20} />
                                            </motion.button>
                                        </div>
                                        <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                            {tasksForReview.length > 0 ? (
                                                tasksForReview.slice(0, 5).map((task: any, i: number) => (
                                                    <MotionListItem
                                                        key={task._id}
                                                        index={i}
                                                        onClick={() => setSelectedTask(task)}
                                                        className=""
                                                    >
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "1rem",
                                                            padding: "1rem 1.5rem",
                                                            borderBottom: "1px solid var(--border-light)"
                                                        }}>
                                                            <div style={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: "14px",
                                                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "white",
                                                                fontWeight: 700,
                                                                fontSize: "0.9rem"
                                                            }}>
                                                                {task.engineerName?.charAt(0) || "U"}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{
                                                                    fontSize: "0.9rem",
                                                                    fontWeight: 500,
                                                                    color: "var(--text-primary)",
                                                                    marginBottom: "0.25rem"
                                                                }}>
                                                                    <span style={{ fontWeight: 700 }}>{task.engineerName}</span> submitted proof for{" "}
                                                                    <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>{task.unit}</span>
                                                                </div>
                                                                <div style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.375rem",
                                                                    fontSize: "0.75rem",
                                                                    color: "var(--text-secondary)"
                                                                }}>
                                                                    <Clock size={12} />
                                                                    {new Date(task.submittedAt || Date.now()).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} className="rtl:rotate-180" />
                                                        </div>
                                                    </MotionListItem>
                                                ))
                                            ) : (
                                                <div className="empty-state" style={{ padding: "2rem" }}>
                                                    <CheckCircle2 size={40} style={{ color: "var(--brand-primary)", opacity: 0.5, marginBottom: "0.75rem" }} />
                                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                                        All caught up! No recent activity.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </MotionCard>
                                </div>

                                {/* ALL TASKS TABLE */}
                                <MotionCard delay={0.4}>
                                    <div className="card-header" style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <h3 className="card-title">All Tasks</h3>
                                        <MotionButton
                                            className="btn-primary"
                                            onClick={() => setShowCreateModal(true)}
                                            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                        >
                                            <Plus size={16} /> New Task
                                        </MotionButton>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Task Title</th>
                                                    <th>Location</th>
                                                    <th>Assigned To</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allTasks.map((task: any, index: number) => (
                                                    <motion.tr
                                                        key={task._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5 + index * 0.03 }}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setSelectedTask(task)}
                                                    >
                                                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)" }}>
                                                                <MapPin size={14} /> {task.unit}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                                <div style={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: "8px",
                                                                    background: "var(--bg-mint)",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    color: "var(--brand-primary)",
                                                                    fontWeight: 700,
                                                                    fontSize: "0.75rem"
                                                                }}>
                                                                    {task.engineerName?.charAt(0)}
                                                                </div>
                                                                <span style={{ fontSize: "0.875rem" }}>{task.engineerName}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 700, color: "var(--brand-primary)" }}>
                                                            ${task.amount.toLocaleString()}
                                                        </td>
                                                        <td>
                                                            <span className={cn(
                                                                "badge",
                                                                task.status === "APPROVED" ? "badge-success" :
                                                                    task.status === "REJECTED" ? "badge-danger" :
                                                                        task.status === "SUBMITTED" ? "badge-warning" : "badge-neutral"
                                                            )}>
                                                                {task.status.replace("_", " ")}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <motion.button
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    color: "var(--brand-primary)",
                                                                    cursor: "pointer",
                                                                    fontSize: "0.8rem",
                                                                    fontWeight: 600,
                                                                    padding: "0.375rem 0.75rem",
                                                                    borderRadius: "0.5rem"
                                                                }}
                                                                whileHover={{ background: "var(--bg-mint)" }}
                                                            >
                                                                View
                                                            </motion.button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </MotionCard>
                            </motion.div>
                        )}

                        {activeTab === "finance" && (
                            <motion.div
                                key="finance"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-6"
                            >
                                <FinanceOverview />
                                <PayoutsTab />
                            </motion.div>
                        )}

                        {activeTab === "projects" && (
                            <motion.div
                                key="projects"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProjectsView />
                            </motion.div>
                        )}

                        {activeTab === "management" && (
                            <motion.div
                                key="management"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ManagementDashboard />
                            </motion.div>
                        )}

                        {activeTab === "team" && (
                            <motion.div
                                key="team"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TeamsView />
                            </motion.div>
                        )}

                        {activeTab === "stock" && (
                            <motion.div
                                key="stock"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StockView />
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SettingsView />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

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
            <div style={{
                display: "flex",
                flexDirection: "row",
                height: "auto",
                maxHeight: "85vh",
                gap: "2rem"
            }}>
                {/* Left: Details */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                        <div>
                            <h2 style={{
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                margin: 0
                            }}>
                                {task.title}
                            </h2>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{
                                fontSize: "1.75rem",
                                fontWeight: 800,
                                color: "var(--brand-primary)"
                            }}>
                                ${task.amount.toLocaleString()}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                Payout Amount
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
                        {/* Engineer Info */}
                        <div style={{
                            padding: "1.25rem",
                            background: "var(--bg-mint)",
                            borderRadius: "1rem"
                        }}>
                            <h4 style={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <Users size={14} /> Engineer
                            </h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: 700
                                }}>
                                    {task.engineerName?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{task.engineerName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                        Submitted {new Date(task.submittedAt || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div>
                                <h4 style={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "0.5rem"
                                }}>
                                    Description
                                </h4>
                                <p style={{
                                    color: "var(--text-primary)",
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Comment Input */}
                        <div>
                            <h4 style={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "0.5rem"
                            }}>
                                Add Comment (Optional)
                            </h4>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Enter feedback for the engineer..."
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    border: "1px solid var(--border)",
                                    borderRadius: "1rem",
                                    fontSize: "0.9rem",
                                    resize: "none",
                                    height: 100,
                                    fontFamily: "inherit",
                                    outline: "none"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "var(--brand-primary)";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "var(--border)";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons - Only show for SUBMITTED tasks */}
                    {task.status === "SUBMITTED" ? (
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                            <MotionButton
                                className="btn-danger"
                                onClick={() => handleAction("reject")}
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                <X size={18} /> Reject
                            </MotionButton>
                            <MotionButton
                                className="btn-success"
                                onClick={() => handleAction("approve")}
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                <CheckCircle2 size={18} /> Approve
                            </MotionButton>
                        </div>
                    ) : (
                        <div style={{
                            marginTop: "1.5rem",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            background: task.status === "APPROVED"
                                ? "rgba(16, 185, 129, 0.1)"
                                : task.status === "REJECTED"
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : "rgba(59, 130, 246, 0.1)",
                            border: `1px solid ${task.status === "APPROVED"
                                ? "rgba(16, 185, 129, 0.3)"
                                : task.status === "REJECTED"
                                    ? "rgba(239, 68, 68, 0.3)"
                                    : "rgba(59, 130, 246, 0.3)"}`,
                            textAlign: "center"
                        }}>
                            <div style={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: task.status === "APPROVED"
                                    ? "#10B981"
                                    : task.status === "REJECTED"
                                        ? "#EF4444"
                                        : "#3B82F6"
                            }}>
                                {task.status === "APPROVED" && "✓ This task has been approved"}
                                {task.status === "REJECTED" && "✗ This task has been rejected"}
                                {task.status === "PENDING" && "⏳ Waiting for engineer to start"}
                                {task.status === "IN_PROGRESS" && "🔄 Engineer is working on this task"}
                            </div>
                            <div style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                marginTop: "0.25rem"
                            }}>
                                Status cannot be changed after approval or rejection
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Photo Preview */}
                <div style={{
                    flex: 1,
                    background: "var(--bg-primary)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    borderRadius: "1rem",
                    border: "1px solid var(--border)"
                }}>
                    {task.photoUrl ? (
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <h4 style={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "1rem"
                            }}>
                                Proof of Work
                            </h4>
                            <motion.img
                                src={task.photoUrl}
                                alt="Proof of work"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: 400,
                                    borderRadius: "1rem",
                                    boxShadow: "var(--shadow-lg)"
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            />
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <p>No photo attached</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
