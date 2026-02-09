import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskModalProps {
    units: Record<string, any>[];
    engineers: Record<string, any>[];
    onClose: () => void;
}

export function CreateTaskModal({ units, engineers, onClose }: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [unitId, setUnitId] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);
    const createTask = useMutation(api.tasks.createTask);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files].slice(0, 5));
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !unitId || !assignedTo || !amount) {
            toast.error("Please fill all required fields");
            return;
        }

        setUploading(true);

        try {
            // Upload attachments
            const storageIds: Id<"_storage">[] = [];
            for (const file of attachments) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                const { storageId } = await result.json();
                storageIds.push(storageId);
            }

            // Create task
            await createTask({
                unitId: unitId as any,
                title,
                description: description || undefined,
                amount: parseFloat(amount),
                assignedTo,
                attachments: storageIds.length > 0 ? storageIds : undefined,
            });

            toast.success("Task created successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to create task");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <div className="modal-title">Create New Task</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Title */}
                        <div>
                            <label className="label">Task Title *</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="e.g., Install electrical wiring"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                className="input textarea"
                                placeholder="Detailed description of the task..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Unit & Amount Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label className="label">Unit *</label>
                                <select
                                    className="input"
                                    value={unitId}
                                    onChange={(e) => setUnitId(e.target.value)}
                                    required
                                >
                                    <option value="">Select unit...</option>
                                    {units.map((unit) => (
                                        <option key={unit._id} value={unit._id}>
                                            {unit.name} - {unit.project}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Amount ($) *</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        {/* Assign To */}
                        <div>
                            <label className="label">Assign To *</label>
                            <select
                                className="input"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                required
                            >
                                <option value="">Select engineer...</option>
                                {engineers.map((eng) => (
                                    <option key={eng._id} value={eng.email}>
                                        {eng.name} ({eng.email})
                                    </option>
                                ))}
                            </select>
                            {engineers.length === 0 && (
                                <p style={{ fontSize: "0.75rem", color: "var(--warning)", marginTop: 8 }}>
                                    No engineers added. You can still assign by entering an email.
                                </p>
                            )}
                            {engineers.length === 0 && (
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="Enter engineer email"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    style={{ marginTop: 8 }}
                                />
                            )}
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="label">Reference Images (optional)</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                            />

                            {attachments.length === 0 ? (
                                <div
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="upload-icon" />
                                    <p className="upload-text">Click to upload images</p>
                                    <p className="upload-hint">PNG, JPG up to 10MB each</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="image-grid" style={{ marginBottom: 12 }}>
                                        {attachments.map((file, index) => (
                                            <div key={index} className="image-thumb" style={{ position: "relative" }}>
                                                <img src={URL.createObjectURL(file)} alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    style={{
                                                        position: "absolute",
                                                        top: 4,
                                                        right: 4,
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: "50%",
                                                        background: "var(--danger)",
                                                        border: "none",
                                                        color: "white",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {attachments.length < 5 && (
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ width: "100%" }}
                                        >
                                            <ImageIcon size={18} />
                                            Add More Images
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                                    Creating...
                                </>
                            ) : (
                                "Create Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
