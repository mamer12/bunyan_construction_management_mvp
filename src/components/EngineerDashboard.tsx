import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    LogOut,
    Camera,
    MapPin,
    Play,
    Upload,
    X,
    ChevronRight,
    AlertTriangle,
    Sparkles,
    Wallet,
    Package, // New Import
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialRequestModal } from "./MaterialRequestModal"; // New Import
import { WalletCard } from "./WalletCard";
import { PayoutModal } from "./PayoutModal";
import { TransactionHistory } from "./TransactionHistory";
import { useLanguage } from "../contexts/LanguageContext";
import {
    MotionCard,
    MotionGradientCard,
    AnimatedCounter,
    MotionButton,
    MotionListItem
} from "./ui/motion";

export function EngineerDashboard() {
    const { signOut } = useAuthActions();
    const tasks = useQuery(api.tasks.getMyTasks) || [];
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false); // New State
    const { t, language } = useLanguage();

    const pendingTasks = tasks.filter((t: any) => t.status === "PENDING");
    const inProgressTasks = tasks.filter((t: any) => t.status === "IN_PROGRESS");
    const completedTasks = tasks.filter((t: any) => t.status === "APPROVED");
    const submittedTasks = tasks.filter((t: any) => t.status === "SUBMITTED");
    const rejectedTasks = tasks.filter((t: any) => t.status === "REJECTED");

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Animated Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                    background: "linear-gradient(135deg, #059669 0%, #047857 50%, #064E3B 100%)",
                    color: "white",
                    padding: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.3)"
                }}
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem"
                    }}>
                        <Sparkles size={14} style={{ opacity: 0.8 }} />
                        <span style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            opacity: 0.8
                        }}>
                            Engineer Portal
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        margin: 0
                    }}>
                        {t('welcome')}
                    </h1>
                    <p style={{
                        fontSize: "0.875rem",
                        opacity: 0.9,
                        margin: 0,
                        marginTop: "0.25rem"
                    }}>
                        Bunyan Construction
                    </p>
                </motion.div>
                <motion.button
                    className="btn"
                    onClick={() => void signOut()}
                    style={{
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        padding: "0.75rem"
                    }}
                    whileHover={{
                        background: "rgba(255,255,255,0.25)",
                        scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <LogOut size={20} />
                </motion.button>
            </motion.header>

            {/* Wallet Section */}
            <div style={{ padding: "1rem" }}>
                <motion.div
                    className="bento-grid"
                    style={{ padding: 0, gap: "1rem" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <WalletCard onRequestPayout={() => setShowPayoutModal(true)} />
                    <TransactionHistory />
                </motion.div>
            </div>

            {/* Actions Row */}
            <div style={{ padding: "0 1rem", marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
                <MotionButton
                    className="btn-primary"
                    onClick={() => setShowMaterialModal(true)}
                >
                    <Package size={18} /> Request Materials
                </MotionButton>
            </div>

            {/* Stats Row */}
            <motion.div
                style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0 1rem 1rem",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <StatCard
                    icon={Clock}
                    value={pendingTasks.length}
                    label={t('pending')}
                    color="#F59E0B"
                    bg="#FFFBEB"
                    delay={0.35}
                />
                <StatCard
                    icon={Play}
                    value={inProgressTasks.length}
                    label={t('inProgress')}
                    color="#3B82F6"
                    bg="#EFF6FF"
                    delay={0.4}
                />
                <StatCard
                    icon={CheckCircle2}
                    value={completedTasks.length}
                    label={t('completed')}
                    color="#059669"
                    bg="#ECFDF5"
                    delay={0.45}
                />
            </motion.div>

            {/* Task List */}
            <div style={{ padding: "0 1rem 1rem" }}>
                <motion.h2
                    style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <ClipboardList size={20} style={{ color: "var(--brand-primary)" }} />
                    My Tasks
                </motion.h2>

                {tasks.length === 0 ? (
                    <MotionCard delay={0.5}>
                        <div className="empty-state">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <ClipboardList size={48} style={{ color: "var(--brand-primary)", opacity: 0.5 }} />
                            </motion.div>
                            <p className="empty-title" style={{ marginTop: "1rem" }}>No tasks assigned</p>
                            <p className="empty-text">Tasks assigned by your lead will appear here</p>
                        </div>
                    </MotionCard>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* Rejected Tasks - Show First with highlight */}
                        {rejectedTasks.map((task: any, index: number) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                highlight="danger"
                                index={index}
                            />
                        ))}

                        {/* Pending & In Progress */}
                        {[...pendingTasks, ...inProgressTasks].map((task: any, index: number) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                index={rejectedTasks.length + index}
                            />
                        ))}

                        {/* Submitted */}
                        {submittedTasks.map((task: any, index: number) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                index={rejectedTasks.length + pendingTasks.length + inProgressTasks.length + index}
                            />
                        ))}

                        {/* Completed */}
                        {completedTasks.map((task: any, index: number) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                index={rejectedTasks.length + pendingTasks.length + inProgressTasks.length + submittedTasks.length + index}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </AnimatePresence>

            {/* Payout Modal */}
            <AnimatePresence>
                {showPayoutModal && (
                    <PayoutModal onClose={() => setShowPayoutModal(false)} />
                )}
            </AnimatePresence>

            {/* Material Request Modal */}
            <AnimatePresence>
                {showMaterialModal && (
                    <MaterialRequestModal
                        projectId="TODO_PROJECT_ID" // TODO: Properly Select Project
                        onClose={() => setShowMaterialModal(false)}
                    />
                )}
            </AnimatePresence>
            {/* MODALS */}
            <AnimatePresence>
                {showMaterialModal && (
                    <MaterialRequestModal
                        projectId="TODO_PROJECT_ID" // Engineer usually works on assigned tasks, need to pick project
                        // Probably need to select project INSIDE the modal or infer from tasks
                        onClose={() => setShowMaterialModal(false)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}

function StatCard({
    icon: Icon,
    value,
    label,
    color,
    bg,
    delay
}: {
    icon: any;
    value: number;
    label: string;
    color: string;
    bg: string;
    delay: number;
}) {
    return (
        <motion.div
            className="bento-card stat-card"
            style={{ minWidth: 110, flex: 1 }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{
                y: -4,
                boxShadow: `0 12px 24px ${color}20`,
                transition: { duration: 0.2 }
            }}
        >
            <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={20} />
            </div>
            <div className="stat-value">
                <AnimatedCounter value={value} duration={1} />
            </div>
            <div className="stat-label">{label}</div>
        </motion.div>
    );
}

function TaskCard({
    task,
    onClick,
    highlight,
    index = 0
}: {
    task: any;
    onClick: () => void;
    highlight?: string;
    index?: number;
}) {
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { className: string; icon: any; label: string }> = {
            PENDING: { className: "badge-pending", icon: Clock, label: "Pending" },
            IN_PROGRESS: { className: "badge-in-progress", icon: Play, label: "In Progress" },
            SUBMITTED: { className: "badge-submitted", icon: Upload, label: "Submitted" },
            APPROVED: { className: "badge-approved", icon: CheckCircle2, label: "Approved" },
            REJECTED: { className: "badge-rejected", icon: AlertTriangle, label: "Rejected" },
        };

        const badge = badges[status];
        if (!badge) return null;

        return (
            <span className={`badge ${badge.className}`}>
                <badge.icon size={12} /> {badge.label}
            </span>
        );
    };

    return (
        <motion.div
            className="task-card"
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: 0.5 + index * 0.05,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
                y: -4,
                boxShadow: "0 12px 24px rgba(5, 150, 105, 0.12)",
                borderColor: highlight === "danger" ? "var(--danger)" : "rgba(5, 150, 105, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            style={{
                cursor: "pointer",
                borderColor: highlight === "danger" ? "var(--danger)" : undefined,
                borderWidth: highlight === "danger" ? 2 : 1
            }}
        >
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "0.75rem"
            }}>
                <div className="task-title">{task.title}</div>
                {getStatusBadge(task.status)}
            </div>

            <div className="task-meta" style={{ marginBottom: "0.5rem" }}>
                <MapPin size={14} />
                <span>{task.project} - {task.unit}</span>
            </div>

            {task.description && (
                <p style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.5
                }}>
                    {task.description}
                </p>
            )}

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <span className="task-amount">${task.amount.toLocaleString()}</span>
                <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
            </div>

            {task.status === "REJECTED" && task.rejectionReason && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem 1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        color: "var(--danger)",
                        border: "1px solid rgba(239, 68, 68, 0.2)"
                    }}
                >
                    <strong>Rejection reason:</strong> {task.rejectionReason}
                </motion.div>
            )}
        </motion.div>
    );
}

function TaskDetailModal({ task, onClose }: { task: any; onClose: () => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startTask = useMutation(api.tasks.startTask);
    const submitTask = useMutation(api.tasks.submitTask);
    const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

    const handleStart = async () => {
        try {
            await startTask({ taskId: task._id });
            toast.success("Task started!");
            onClose();
        } catch (error) {
            toast.error("Failed to start task");
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGpsLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    toast.success("Location captured!");
                },
                () => toast.error("Could not get location")
            );
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error("Please take a photo of your work");
            return;
        }

        setUploading(true);
        try {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
            });
            const { storageId } = await result.json();

            await submitTask({
                taskId: task._id,
                storageId,
                gps: gpsLocation || undefined,
            });

            toast.success("Task submitted for review!");
            onClose();
        } catch (error) {
            toast.error("Failed to submit task");
        } finally {
            setUploading(false);
        }
    };

    // REJECTED tasks can be restarted (start again)
    // PENDING tasks can be started
    const canStart = task.status === "PENDING" || task.status === "REJECTED";
    // Only IN_PROGRESS tasks can be submitted (after starting)
    const canSubmit = task.status === "IN_PROGRESS";
    const isCompleted = task.status === "APPROVED";
    const isSubmitted = task.status === "SUBMITTED";
    const isRejected = task.status === "REJECTED";

    return (
        <motion.div
            className="modal-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ maxWidth: 480 }}
            >
                <div className="modal-header">
                    <div className="modal-title">Task Details</div>
                    <motion.button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        whileHover={{ background: "var(--bg-mint)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                <div className="modal-body" style={{ padding: "1.5rem" }}>
                    {/* Task Info */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            color: "var(--text-primary)"
                        }}>
                            {task.title}
                        </h3>
                        <div className="task-meta" style={{ marginBottom: "0.75rem" }}>
                            <MapPin size={14} />
                            <span>{task.project} - {task.unit}</span>
                        </div>
                        {task.description && (
                            <p style={{
                                fontSize: "0.9rem",
                                color: "var(--text-secondary)",
                                marginBottom: "1rem",
                                lineHeight: 1.6
                            }}>
                                {task.description}
                            </p>
                        )}
                        <div style={{
                            fontSize: "1.75rem",
                            fontWeight: 800,
                            color: "var(--brand-primary)"
                        }}>
                            ${task.amount.toLocaleString()}
                        </div>
                    </div>

                    {/* Reference Images */}
                    {task.attachmentUrls && task.attachmentUrls.length > 0 && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label className="label">Reference Images from Lead</label>
                            <div className="image-grid">
                                {task.attachmentUrls.map((url: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        className="image-thumb"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <img src={url} alt="" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Work Section */}
                    {canSubmit && (
                        <div>
                            <label className="label">Submit Proof of Work</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                style={{ display: "none" }}
                            />

                            {selectedFile ? (
                                <div style={{ marginBottom: "1rem" }}>
                                    <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                                        <motion.img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Proof"
                                            style={{
                                                width: "100%",
                                                borderRadius: "1rem",
                                                border: "1px solid var(--border)"
                                            }}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        />
                                        <motion.button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => setSelectedFile(null)}
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                background: "white",
                                                boxShadow: "var(--shadow-md)"
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    </div>
                                    <MotionButton
                                        className="btn-ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ width: "100%" }}
                                    >
                                        <Camera size={18} />
                                        Retake Photo
                                    </MotionButton>
                                </div>
                            ) : (
                                <motion.div
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ marginBottom: "1rem" }}
                                    whileHover={{
                                        borderColor: "var(--brand-primary)",
                                        background: "var(--bg-mint)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Camera className="upload-icon" />
                                    <p className="upload-text">Tap to take photo</p>
                                    <p className="upload-hint">Show your completed work</p>
                                </motion.div>
                            )}

                            {!gpsLocation ? (
                                <MotionButton
                                    className="btn-ghost"
                                    onClick={getLocation}
                                    style={{ width: "100%", marginBottom: "1rem" }}
                                >
                                    <MapPin size={18} />
                                    Capture Location (Optional)
                                </MotionButton>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: "0.875rem 1rem",
                                        background: "var(--bg-mint)",
                                        borderRadius: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "0.875rem",
                                        color: "var(--brand-primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        border: "1px solid rgba(5, 150, 105, 0.2)"
                                    }}
                                >
                                    <MapPin size={16} />
                                    Location captured: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Submitted Proof */}
                    {(isSubmitted || isCompleted) && task.photoUrl && (
                        <div>
                            <label className="label">Your Submitted Work</label>
                            <motion.img
                                src={task.photoUrl}
                                alt="Submitted proof"
                                style={{
                                    width: "100%",
                                    borderRadius: "1rem",
                                    border: "1px solid var(--border)"
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div style={{
                    padding: "1rem 1.5rem",
                    borderTop: "1px solid var(--border)",
                    background: "var(--bg-primary)"
                }}>
                    {canStart && (
                        <MotionButton
                            className="btn-primary"
                            onClick={handleStart}
                            style={{ width: "100%" }}
                        >
                            <Play size={18} />
                            {isRejected ? "Restart Task" : "Start Task"}
                        </MotionButton>
                    )}

                    {canSubmit && (
                        <MotionButton
                            className="btn-success"
                            onClick={handleSubmit}
                            disabled={!selectedFile || uploading}
                            style={{ width: "100%" }}
                        >
                            {uploading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            borderTopColor: "white",
                                            borderRadius: "50%"
                                        }}
                                    />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Submit for Review
                                </>
                            )}
                        </MotionButton>
                    )}

                    {isSubmitted && (
                        <div style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                            padding: "0.5rem",
                            background: "#FEF3C7",
                            borderRadius: "1rem",
                            fontSize: "0.9rem"
                        }}>
                            <Clock size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                            Waiting for lead approval...
                        </div>
                    )}

                    {isCompleted && (
                        <div style={{
                            textAlign: "center",
                            color: "var(--brand-primary)",
                            padding: "0.5rem",
                            background: "var(--bg-mint)",
                            borderRadius: "1rem",
                            fontSize: "0.9rem",
                            fontWeight: 600
                        }}>
                            <CheckCircle2 size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                            Task completed and paid!
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
