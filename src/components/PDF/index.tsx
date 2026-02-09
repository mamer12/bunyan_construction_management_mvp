import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { InvoicePDF, ContractPDF, ReceiptPDF } from './PDFTemplates';
import { FileDown, FileText, Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

// Download PDF utility
async function downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// INVOICE DOWNLOAD BUTTON
// ============================================
interface InvoiceButtonProps {
    taskId: string;
    variant?: 'icon' | 'button';
}

export function DownloadInvoiceButton({ taskId, variant = 'button' }: InvoiceButtonProps) {
    const [loading, setLoading] = useState(false);
    const invoiceData = useQuery(api.settings.getInvoiceData, { taskId: taskId as Id<"tasks"> });
    const recordDocument = useMutation(api.settings.recordDocument);

    const handleDownload = async () => {
        if (!invoiceData) {
            toast.error('Unable to load invoice data');
            return;
        }

        setLoading(true);
        try {
            const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
            const filename = `invoice-${invoiceData.invoiceNumber}.pdf`;
            await downloadPDF(blob, filename);

            // Record the document generation
            await recordDocument({
                type: 'invoice',
                referenceType: 'task',
                referenceId: taskId,
                documentNumber: invoiceData.invoiceNumber,
                metadata: JSON.stringify({
                    contractor: invoiceData.contractor.name,
                    amount: invoiceData.task.amount,
                }),
            });

            toast.success('تم تحميل الفاتورة');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('فشل في إنشاء الفاتورة');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleDownload}
                disabled={loading || !invoiceData}
                title="تحميل الفاتورة"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: loading || !invoiceData ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    opacity: loading || !invoiceData ? 0.5 : 1,
                }}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading || !invoiceData}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading || !invoiceData ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: loading || !invoiceData ? 0.7 : 1,
            }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            تحميل الفاتورة
        </button>
    );
}

// ============================================
// CONTRACT DOWNLOAD BUTTON
// ============================================
interface ContractButtonProps {
    dealId: string;
    variant?: 'icon' | 'button';
}

export function DownloadContractButton({ dealId, variant = 'button' }: ContractButtonProps) {
    const [loading, setLoading] = useState(false);
    const contractData = useQuery(api.settings.getContractData, { dealId: dealId as Id<"deals"> });
    const recordDocument = useMutation(api.settings.recordDocument);

    const handleDownload = async () => {
        if (!contractData) {
            toast.error('Unable to load contract data');
            return;
        }

        setLoading(true);
        try {
            const blob = await pdf(<ContractPDF data={contractData} />).toBlob();
            const filename = `contract-${contractData.contractNumber}.pdf`;
            await downloadPDF(blob, filename);

            // Record the document generation
            await recordDocument({
                type: 'contract',
                referenceType: 'deal',
                referenceId: dealId,
                documentNumber: contractData.contractNumber,
                metadata: JSON.stringify({
                    buyer: contractData.buyer.name,
                    property: contractData.property.unitName,
                    totalPrice: contractData.financial.totalPrice,
                }),
            });

            toast.success('تم تحميل العقد');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('فشل في إنشاء العقد');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleDownload}
                disabled={loading || !contractData}
                title="تحميل العقد"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: loading || !contractData ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    opacity: loading || !contractData ? 0.5 : 1,
                }}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading || !contractData}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading || !contractData ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: loading || !contractData ? 0.7 : 1,
            }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            تحميل العقد
        </button>
    );
}

// ============================================
// RECEIPT DOWNLOAD BUTTON
// ============================================
interface ReceiptButtonProps {
    installmentId: string;
    variant?: 'icon' | 'button';
}

export function DownloadReceiptButton({ installmentId, variant = 'button' }: ReceiptButtonProps) {
    const [loading, setLoading] = useState(false);
    const receiptData = useQuery(api.settings.getReceiptData, { installmentId: installmentId as Id<"installments"> });
    const recordDocument = useMutation(api.settings.recordDocument);

    const handleDownload = async () => {
        if (!receiptData) {
            toast.error('Unable to load receipt data');
            return;
        }

        setLoading(true);
        try {
            const blob = await pdf(<ReceiptPDF data={receiptData} />).toBlob();
            const filename = `receipt-${receiptData.receiptNumber}.pdf`;
            await downloadPDF(blob, filename);

            // Record the document generation
            await recordDocument({
                type: 'receipt',
                referenceType: 'installment',
                referenceId: installmentId,
                documentNumber: receiptData.receiptNumber,
                metadata: JSON.stringify({
                    payer: receiptData.payer.name,
                    amount: receiptData.payment.amount,
                }),
            });

            toast.success('تم تحميل الإيصال');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('فشل في إنشاء الإيصال');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleDownload}
                disabled={loading || !receiptData}
                title="تحميل الإيصال"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: loading || !receiptData ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    opacity: loading || !receiptData ? 0.5 : 1,
                }}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading || !receiptData}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading || !receiptData ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: loading || !receiptData ? 0.7 : 1,
            }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
            تحميل الإيصال
        </button>
    );
}

// Export all
export { InvoicePDF, ContractPDF, ReceiptPDF } from './PDFTemplates';

// Generic PDF Button for different document types
interface PDFDownloadButtonProps {
    dealId: Id<"deals">;
    type: 'invoice' | 'contract' | 'receipt';
    label: string;
    icon?: React.ElementType;
}

export function PDFDownloadButton({ dealId, type, label, icon: Icon = FileText }: PDFDownloadButtonProps) {
    if (type === 'contract') {
        return (
            <DownloadContractButton dealId={dealId as unknown as string} variant="button" />
        );
    }
    // For now, just show a button that indicates the document type
    // The specific implementations for invoice and receipt need task/installment IDs
    return (
        <button
            disabled
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

