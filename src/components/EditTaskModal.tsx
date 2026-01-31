import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Modal } from "./ui/modal";
import { MotionButton } from "./ui/motion";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { Edit2, Trash2 } from "lucide-react";

interface EditTaskModalProps {
    task: {
        _id: Id<"tasks">;
        title: string;
        description?: string;
        amount: number;
        assignedTo: string;
        status: string;
    };
    engineers: Array<{ _id: Id<"engineers">; email: string; name: string }>;
    onClose: () => void;
}

export function EditTaskModal({ task, engineers, onClose }: EditTaskModalProps) {
    const { t, language } = useLanguage();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [amount, setAmount] = useState(task.amount);
    const [assignedTo, setAssignedTo] = useState(task.assignedTo);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateTask = useMutation(api.tasks.updateTask);
    const deleteTask = useMutation(api.tasks.deleteTask);

    // Find current assignee email
    const currentEngineer = engineers.find(e =>
        e.email === task.assignedTo ||
        (e as any).userId === task.assignedTo
    );

    const handleUpdate = async () => {
        if (!title.trim()) {
            toast.error(language === 'ar' ? "عنوان المهمة مطلوب" : "Task title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateTask({
                taskId: task._id,
                title: title.trim(),
                description: description.trim() || undefined,
                amount,
                assignedTo: assignedTo !== task.assignedTo ? assignedTo : undefined,
            });
            toast.success(language === 'ar' ? "تم تحديث المهمة" : "Task updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteTask({ taskId: task._id });
            toast.success(language === 'ar' ? "تم حذف المهمة" : "Task deleted successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = task.status === "PENDING";

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isPending ? (t("edit") + " " + t("taskDetails")) : t("taskDetails")}
        >
            {!isPending && (
                <div style={{
                    padding: "0.75rem 1rem",
                    background: "var(--bg-warning)",
                    borderRadius: "0.75rem",
                    marginBottom: "1.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-warning)"
                }}>
                    {language === 'ar'
                        ? "لا يمكن تعديل هذه المهمة لأنها ليست في حالة انتظار"
                        : "This task cannot be edited because it's not in pending status"}
                </div>
            )}

            <div className="form-group">
                <label className="label">{t("taskDetails")?.split(' ')[0] || "Task"} {t("name")}</label>
                <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={!isPending}
                    placeholder={language === 'ar' ? "عنوان المهمة" : "Task title..."}
                />
            </div>

            <div className="form-group">
                <label className="label">{t("description")}</label>
                <textarea
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isPending}
                    rows={3}
                    placeholder={language === 'ar' ? "وصف المهمة..." : "Task description..."}
                />
            </div>

            <div className="form-group">
                <label className="label">{t("amount")} (IQD)</label>
                <input
                    type="number"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    disabled={!isPending}
                />
            </div>

            <div className="form-group">
                <label className="label">{t("assignedTo")}</label>
                <select
                    className="input"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={!isPending}
                >
                    <option value={task.assignedTo}>
                        {currentEngineer?.name || currentEngineer?.email || task.assignedTo}
                    </option>
                    {engineers.filter(e => e.email !== currentEngineer?.email).map(eng => (
                        <option key={eng._id} value={eng.email}>
                            {eng.name} ({eng.email})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label className="label">{t("status")}</label>
                <span className={`badge badge--${task.status === 'APPROVED' ? 'success' :
                        task.status === 'REJECTED' ? 'danger' :
                            task.status === 'IN_PROGRESS' ? 'primary' :
                                task.status === 'SUBMITTED' ? 'info' :
                                    'warning'
                    }`}>
                    {task.status}
                </span>
            </div>

            {/* Actions */}
            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <MotionButton className="btn-ghost" onClick={onClose}>
                    {t("cancel")}
                </MotionButton>

                {isPending && (
                    <>
                        <MotionButton
                            className="btn-danger"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSubmitting}
                        >
                            <Trash2 size={16} />
                            {t("delete")}
                        </MotionButton>
                        <MotionButton
                            className="btn-primary"
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                        >
                            <Edit2 size={16} />
                            {t("save")}
                        </MotionButton>
                    </>
                )}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowDeleteConfirm(false)}
                    title={t("confirmDelete") as string}
                    maxWidth="sm"
                >
                    <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
                        {language === 'ar'
                            ? "هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
                            : "Are you sure you want to delete this task? This action cannot be undone."}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <MotionButton
                            className="btn-ghost"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            {t("cancel")}
                        </MotionButton>
                        <MotionButton
                            className="btn-danger"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {t("delete")}
                        </MotionButton>
                    </div>
                </Modal>
            )}
        </Modal>
    );
}
