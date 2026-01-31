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
    Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { WalletCard } from "./WalletCard";
import { PayoutModal } from "./PayoutModal";
import { TransactionHistory } from "./TransactionHistory";

import { useLanguage } from "../contexts/LanguageContext";

export function EngineerDashboard() {
    const { signOut } = useAuthActions();
    const tasks = useQuery(api.tasks.getMyTasks) || [];
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const { t, language } = useLanguage();

    const pendingTasks = tasks.filter((t: any) => t.status === "PENDING");
    const inProgressTasks = tasks.filter((t: any) => t.status === "IN_PROGRESS");
    const completedTasks = tasks.filter((t: any) => t.status === "APPROVED");
    const submittedTasks = tasks.filter((t: any) => t.status === "SUBMITTED");
    const rejectedTasks = tasks.filter((t: any) => t.status === "REJECTED");

    return (
        <div className="min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="header">
                <div>
                    <h1 className="header-title">{t('welcome')}</h1>
                    <p className="header-subtitle">Bunyan Construction</p>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => void signOut()}>
                    <LogOut size={18} />
                </button>
            </header>

            {/* Wallet Section */}
            <div style={{ padding: 16 }}>
                <div className="bento-grid" style={{ padding: 0 }}>
                    <WalletCard onRequestPayout={() => setShowPayoutModal(true)} />
                    <TransactionHistory />
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "flex", gap: 12, padding: "0 16px 16px", overflowX: "auto" }}>
                <div className="bento-card stat-card" style={{ minWidth: 120, flex: 1 }}>
                    <div className="stat-icon orange">
                        <Clock size={18} />
                    </div>
                    <div className="stat-value">{pendingTasks.length}</div>
                    <div className="stat-label">{t('pending')}</div>
                </div>

                <div className="bento-card stat-card" style={{ minWidth: 120, flex: 1 }}>
                    <div className="stat-icon blue">
                        <Play size={18} className="rtl:rotate-180" />
                    </div>
                    <div className="stat-value">{inProgressTasks.length}</div>
                    <div className="stat-label">{t('inProgress')}</div>
                </div>

                <div className="bento-card stat-card" style={{ minWidth: 120, flex: 1 }}>
                    <div className="stat-icon green">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="stat-value">{completedTasks.length}</div>
                    <div className="stat-label">{t('completed')}</div>
                </div>
            </div>

            {/* Task List */}
            <div style={{ padding: "0 16px 16px" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                    My Tasks
                </h2>
                {tasks.length === 0 ? (
                    <div className="bento-card">
                        <div className="empty-state">
                            <ClipboardList className="empty-icon" />
                            <p className="empty-title">No tasks assigned</p>
                            <p className="empty-text">Tasks assigned by your lead will appear here</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* Rejected Tasks - Show First */}
                        {rejectedTasks.map((task: any) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                highlight="danger"
                            />
                        ))}

                        {/* Pending & In Progress */}
                        {[...pendingTasks, ...inProgressTasks].map((task: any) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}

                        {/* Submitted */}
                        {submittedTasks.map((task: any) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}

                        {/* Completed */}
                        {completedTasks.map((task: any) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Payout Modal */}
            {showPayoutModal && (
                <PayoutModal onClose={() => setShowPayoutModal(false)} />
            )}
        </div>
    );
}

function TaskCard({ task, onClick, highlight }: { task: any; onClick: () => void; highlight?: string }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
            case "IN_PROGRESS":
                return <span className="badge badge-in-progress"><Play size={12} /> In Progress</span>;
            case "SUBMITTED":
                return <span className="badge badge-submitted"><Upload size={12} /> Submitted</span>;
            case "APPROVED":
                return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>;
            case "REJECTED":
                return <span className="badge badge-rejected"><AlertTriangle size={12} /> Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div
            className="task-card"
            onClick={onClick}
            style={{
                cursor: "pointer",
                borderColor: highlight === "danger" ? "var(--danger)" : undefined
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div className="task-title">{task.title}</div>
                {getStatusBadge(task.status)}
            </div>

            <div className="task-meta" style={{ marginBottom: 8 }}>
                <MapPin size={14} />
                <span>{task.project} • {task.unit}</span>
            </div>

            {task.description && (
                <p style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: 12,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                }}>
                    {task.description}
                </p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="task-amount">${task.amount.toLocaleString()}</span>
                <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
            </div>

            {task.status === "REJECTED" && task.rejectionReason && (
                <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.875rem",
                    color: "var(--danger)"
                }}>
                    <strong>Rejection reason:</strong> {task.rejectionReason}
                </div>
            )}
        </div>
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

    const canStart = task.status === "PENDING";
    const canSubmit = task.status === "IN_PROGRESS" || task.status === "REJECTED";
    const isCompleted = task.status === "APPROVED";
    const isSubmitted = task.status === "SUBMITTED";

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">Task Details</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Task Info */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>{task.title}</h3>
                        <div className="task-meta" style={{ marginBottom: 8 }}>
                            <MapPin size={14} />
                            <span>{task.project} • {task.unit}</span>
                        </div>
                        {task.description && (
                            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                                {task.description}
                            </p>
                        )}
                        <div className="task-amount" style={{ fontSize: "1.5rem" }}>
                            ${task.amount.toLocaleString()}
                        </div>
                    </div>

                    {/* Reference Images */}
                    {task.attachmentUrls && task.attachmentUrls.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <label className="label">Reference Images from Lead</label>
                            <div className="image-grid">
                                {task.attachmentUrls.map((url: string, i: number) => (
                                    <div key={i} className="image-thumb">
                                        <img src={url} alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    {task.comments && task.comments.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <label className="label">Comments</label>
                            {task.comments.map((comment: any, i: number) => (
                                <div key={i} className="comment">
                                    <div className="comment-avatar">
                                        {comment.authorName?.charAt(0) || "?"}
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-header">
                                            <span className="comment-author">{comment.authorName}</span>
                                            <span className="comment-time">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
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
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ position: "relative", marginBottom: 12 }}>
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Proof"
                                            style={{
                                                width: "100%",
                                                borderRadius: "var(--radius-md)",
                                                border: "1px solid var(--border)"
                                            }}
                                        />
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => setSelectedFile(null)}
                                            style={{ position: "absolute", top: 8, right: 8 }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ width: "100%" }}
                                    >
                                        <Camera size={18} />
                                        Retake Photo
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ marginBottom: 16 }}
                                >
                                    <Camera className="upload-icon" />
                                    <p className="upload-text">Tap to take photo</p>
                                    <p className="upload-hint">Show your completed work</p>
                                </div>
                            )}

                            {!gpsLocation ? (
                                <button className="btn btn-ghost" onClick={getLocation} style={{ width: "100%", marginBottom: 16 }}>
                                    <MapPin size={18} />
                                    Capture Location (Optional)
                                </button>
                            ) : (
                                <div style={{
                                    padding: 12,
                                    background: "rgba(34, 197, 94, 0.1)",
                                    borderRadius: "var(--radius-sm)",
                                    marginBottom: 16,
                                    fontSize: "0.875rem",
                                    color: "var(--success)"
                                }}>
                                    <MapPin size={14} style={{ display: "inline", marginRight: 8 }} />
                                    Location captured: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submitted Proof */}
                    {(isSubmitted || isCompleted) && task.photoUrl && (
                        <div>
                            <label className="label">Your Submitted Work</label>
                            <img
                                src={task.photoUrl}
                                alt="Submitted proof"
                                style={{
                                    width: "100%",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)"
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {canStart && (
                        <button className="btn btn-primary" onClick={handleStart} style={{ width: "100%" }}>
                            <Play size={18} />
                            Start Task
                        </button>
                    )}

                    {canSubmit && (
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={!selectedFile || uploading}
                            style={{ width: "100%" }}
                        >
                            {uploading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Submit for Review
                                </>
                            )}
                        </button>
                    )}

                    {isSubmitted && (
                        <div style={{
                            width: "100%",
                            padding: 16,
                            background: "rgba(168, 85, 247, 0.1)",
                            borderRadius: "var(--radius-md)",
                            textAlign: "center",
                            color: "#a855f7"
                        }}>
                            <Clock size={20} style={{ marginBottom: 4 }} />
                            <p style={{ fontWeight: 500 }}>Awaiting Lead Review</p>
                        </div>
                    )}

                    {isCompleted && (
                        <div style={{
                            width: "100%",
                            padding: 16,
                            background: "rgba(34, 197, 94, 0.1)",
                            borderRadius: "var(--radius-md)",
                            textAlign: "center",
                            color: "var(--success)"
                        }}>
                            <CheckCircle2 size={20} style={{ marginBottom: 4 }} />
                            <p style={{ fontWeight: 500 }}>Task Approved ✓</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
