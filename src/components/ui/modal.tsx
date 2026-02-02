import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    description?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Modal({ isOpen, onClose, children, title, maxWidth = "md" }: ModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full m-4",
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            className={`w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-slate-900 rounded-2xl shadow-xl pointer-events-auto flex flex-col max-h-[90vh]`}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 min-w-0">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body (Scrollable) */}
                            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

// Sub-components for structure if needed, but simple children is often enough
export function ModalFooter({ children }: { children: ReactNode }) {
    return (
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {children}
        </div>
    );
}
