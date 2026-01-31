import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    footer?: ReactNode;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-4xl"
};

export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = "md",
    footer,
    showCloseButton = true,
    closeOnOverlayClick = true
}: ModalProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={closeOnOverlayClick ? onClose : undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={`modal ${sizeClasses[size]} w-full mx-4`}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ 
                            duration: 0.3, 
                            ease: [0.25, 0.46, 0.45, 0.94] 
                        }}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="modal-header">
                                <div>
                                    {title && <div className="modal-title">{title}</div>}
                                    {subtitle && (
                                        <div style={{ 
                                            fontSize: "0.875rem", 
                                            color: "var(--text-secondary)",
                                            marginTop: "0.25rem"
                                        }}>
                                            {subtitle}
                                        </div>
                                    )}
                                </div>
                                {showCloseButton && (
                                    <motion.button
                                        className="btn btn-ghost btn-icon"
                                        onClick={onClose}
                                        whileHover={{ background: "var(--bg-mint)" }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: "0.5rem",
                                            borderRadius: "0.75rem"
                                        }}
                                    >
                                        <X size={20} />
                                    </motion.button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="modal-body">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="modal-footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Preset Button Components for Modal Footer
interface ModalFooterProps {
    onCancel: () => void;
    onSubmit?: () => void;
    cancelText?: string;
    submitText?: string;
    loading?: boolean;
    submitDisabled?: boolean;
    submitVariant?: "primary" | "success" | "danger";
}

export function ModalFooter({
    onCancel,
    onSubmit,
    cancelText = "Cancel",
    submitText = "Submit",
    loading = false,
    submitDisabled = false,
    submitVariant = "primary"
}: ModalFooterProps) {
    const submitClassName = {
        primary: "btn-primary",
        success: "btn-success",
        danger: "btn-danger"
    }[submitVariant];

    return (
        <>
            <motion.button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                whileHover={{ background: "var(--bg-mint)" }}
                whileTap={{ scale: 0.95 }}
            >
                {cancelText}
            </motion.button>
            {onSubmit && (
                <motion.button
                    type="submit"
                    className={`btn ${submitClassName}`}
                    onClick={onSubmit}
                    disabled={loading || submitDisabled}
                    whileHover={!loading && !submitDisabled ? { scale: 1.02 } : {}}
                    whileTap={!loading && !submitDisabled ? { scale: 0.98 } : {}}
                >
                    {loading ? (
                        <>
                            <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                            Loading...
                        </>
                    ) : (
                        submitText
                    )}
                </motion.button>
            )}
        </>
    );
}

// Form Field Components for consistent modal forms
interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label className="label">
                {label}
                {required && <span style={{ color: "var(--danger)" }}> *</span>}
            </label>
            {children}
            {error && (
                <div style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--danger)", 
                    marginTop: "0.25rem" 
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
