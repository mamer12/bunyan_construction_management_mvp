import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    User,
    Phone,
    Mail,
    DollarSign,
    Calendar,
    Plus,
    Edit2,
    MessageSquare,
    ChevronRight,
    Search,
    Filter,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

// Types
interface Lead {
    _id: Id<"leads">;
    name: string;
    phone: string;
    email?: string;
    status: string;
    source: string;
    budget?: number;
    notes?: string;
    createdAt: number;
    lastContactedAt?: number;
    assignedUserName?: string;
}

// Lead Card Component
function LeadCard({
    lead,
    onClick,
    language
}: {
    lead: Lead;
    onClick: () => void;
    language: string;
}) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getSourceBadge = () => {
        const colors: Record<string, string> = {
            'walk-in': '#10B981',
            'facebook': '#3B82F6',
            'broker_referral': '#F59E0B',
            'website': '#8B5CF6',
            'referral': '#EC4899',
        };
        return colors[lead.source] || '#6B7280';
    };

    const sourceLabels: Record<string, Record<string, string>> = {
        'walk-in': { en: 'Walk-in', ar: 'زيارة مباشرة' },
        'facebook': { en: 'Facebook', ar: 'فيسبوك' },
        'broker_referral': { en: 'Broker', ar: 'وسيط' },
        'website': { en: 'Website', ar: 'الموقع' },
        'referral': { en: 'Referral', ar: 'إحالة' },
    };

    const timeSince = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        const intervals = [
            { label: { en: 'year', ar: 'سنة' }, seconds: 31536000 },
            { label: { en: 'month', ar: 'شهر' }, seconds: 2592000 },
            { label: { en: 'day', ar: 'يوم' }, seconds: 86400 },
            { label: { en: 'hour', ar: 'ساعة' }, seconds: 3600 },
            { label: { en: 'minute', ar: 'دقيقة' }, seconds: 60 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label[language as 'en' | 'ar']}`;
            }
        }
        return language === 'ar' ? 'الآن' : 'just now';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
            onClick={onClick}
            style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                cursor: 'pointer',
                border: '1px solid var(--border)',
            }}
        >
            {/* Source Badge */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
            }}>
                <span style={{
                    background: `${getSourceBadge()}20`,
                    color: getSourceBadge(),
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                }}>
                    {sourceLabels[lead.source]?.[language as 'en' | 'ar'] || lead.source}
                </span>
                <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                }}>
                    {timeSince(lead.createdAt)}
                </span>
            </div>

            {/* Name & Contact */}
            <h4 style={{
                margin: '0 0 0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
            }}>
                {lead.name}
            </h4>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={12} />
                    {lead.phone}
                </span>
                {lead.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={12} />
                        {lead.email}
                    </span>
                )}
            </div>

            {/* Budget */}
            {lead.budget && (
                <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: 'var(--bg-mint)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                }}>
                    <DollarSign size={14} />
                    {formatCurrency(lead.budget)} IQD
                </div>
            )}

            {/* Assigned To */}
            {lead.assignedUserName && (
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                }}>
                    <User size={10} />
                    {lead.assignedUserName}
                </div>
            )}
        </motion.div>
    );
}

// Kanban Column
function KanbanColumn({
    title,
    titleAr,
    status,
    leads,
    color,
    onLeadClick,
    onDragOver,
    onDrop,
    language,
}: {
    title: string;
    titleAr: string;
    status: string;
    leads: Lead[];
    color: string;
    onLeadClick: (lead: Lead) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: string) => void;
    language: string;
}) {
    return (
        <div
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
            style={{
                flex: 1,
                minWidth: '280px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 200px)',
            }}
        >
            {/* Column Header */}
            <div style={{
                padding: '1rem',
                borderBottom: `3px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: color,
                    }} />
                    <span style={{ fontWeight: 600 }}>
                        {language === 'ar' ? titleAr : title}
                    </span>
                </div>
                <span style={{
                    background: `${color}20`,
                    color: color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                }}>
                    {leads.length}
                </span>
            </div>

            {/* Cards */}
            <div style={{
                flex: 1,
                padding: '0.75rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
            }}>
                <AnimatePresence>
                    {leads.map((lead) => (
                        <div
                            key={lead._id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('leadId', lead._id);
                                e.dataTransfer.setData('currentStatus', lead.status);
                            }}
                        >
                            <LeadCard
                                lead={lead}
                                onClick={() => onLeadClick(lead)}
                                language={language}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// New Lead Modal
function NewLeadModal({
    isOpen,
    onClose,
    language,
}: {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}) {
    const createLead = useMutation(api.leads.createLead);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'walk-in',
        budget: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const labels = {
        title: { en: 'New Lead', ar: 'عميل محتمل جديد' },
        name: { en: 'Name', ar: 'الاسم' },
        phone: { en: 'Phone', ar: 'الهاتف' },
        email: { en: 'Email', ar: 'البريد الإلكتروني' },
        source: { en: 'Source', ar: 'المصدر' },
        budget: { en: 'Budget (IQD)', ar: 'الميزانية (دينار)' },
        notes: { en: 'Notes', ar: 'ملاحظات' },
        cancel: { en: 'Cancel', ar: 'إلغاء' },
        save: { en: 'Save Lead', ar: 'حفظ' },
    };

    const sources = [
        { value: 'walk-in', en: 'Walk-in', ar: 'زيارة مباشرة' },
        { value: 'facebook', en: 'Facebook', ar: 'فيسبوك' },
        { value: 'broker_referral', en: 'Broker Referral', ar: 'إحالة وسيط' },
        { value: 'website', en: 'Website', ar: 'الموقع' },
        { value: 'referral', en: 'Referral', ar: 'إحالة' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error(language === 'ar' ? 'الاسم والهاتف مطلوبان' : 'Name and phone are required');
            return;
        }

        setIsSubmitting(true);
        try {
            await createLead({
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                source: formData.source,
                budget: formData.budget ? Number(formData.budget) : undefined,
                notes: formData.notes || undefined,
            });
            toast.success(language === 'ar' ? 'تم إضافة العميل المحتمل' : 'Lead added successfully');
            onClose();
            setFormData({ name: '', phone: '', email: '', source: 'walk-in', budget: '', notes: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to add lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                    {labels.title[language as 'en' | 'ar']}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.name[language as 'en' | 'ar']} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.phone[language as 'en' | 'ar']} *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.email[language as 'en' | 'ar']}
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.source[language as 'en' | 'ar']}
                            </label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {sources.map((src) => (
                                    <option key={src.value} value={src.value}>
                                        {src[language as 'en' | 'ar']}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.budget[language as 'en' | 'ar']}
                            </label>
                            <input
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                {labels.notes[language as 'en' | 'ar']}
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '1.5rem',
                        justifyContent: 'flex-end',
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            {labels.cancel[language as 'en' | 'ar']}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                                color: 'white',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {labels.save[language as 'en' | 'ar']}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// Main LeadKanban Component
export function LeadKanban({ onLeadSelect }: { onLeadSelect?: (lead: Lead) => void }) {
    const { language } = useLanguage();
    const [showNewModal, setShowNewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const leads = useQuery(api.leads.getLeads, {}) as Lead[] | undefined;
    const updateLeadStatus = useMutation(api.leads.updateLeadStatus);

    const columns = [
        { status: 'new', title: 'New', titleAr: 'جديد', color: '#3B82F6' },
        { status: 'contacted', title: 'Contacted', titleAr: 'تم التواصل', color: '#F59E0B' },
        { status: 'qualified', title: 'Qualified', titleAr: 'مؤهل', color: '#10B981' },
        { status: 'lost', title: 'Lost', titleAr: 'خسارة', color: '#EF4444' },
    ];

    // Filter leads by search
    const filteredLeads = leads?.filter((lead) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            lead.name.toLowerCase().includes(search) ||
            lead.phone.includes(search) ||
            (lead.email && lead.email.toLowerCase().includes(search))
        );
    }) || [];

    // Group leads by status
    const groupedLeads = columns.reduce((acc, col) => {
        acc[col.status] = filteredLeads.filter((lead) => lead.status === col.status);
        return acc;
    }, {} as Record<string, Lead[]>);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        const currentStatus = e.dataTransfer.getData('currentStatus');

        if (currentStatus === newStatus) return;

        try {
            await updateLeadStatus({
                leadId: leadId as Id<"leads">,
                status: newStatus
            });
            toast.success(
                language === 'ar'
                    ? 'تم تحديث حالة العميل'
                    : 'Lead status updated'
            );
        } catch (error) {
            toast.error('Failed to update lead status');
        }
    };

    const labels = {
        title: { en: 'Lead Pipeline', ar: 'مسار العملاء المحتملين' },
        search: { en: 'Search leads...', ar: 'بحث عن العملاء...' },
        newLead: { en: 'New Lead', ar: 'عميل جديد' },
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    {labels.title[language as 'en' | 'ar']}
                </h2>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={16}
                            style={{
                                position: 'absolute',
                                left: language === 'ar' ? 'auto' : '0.75rem',
                                right: language === 'ar' ? '0.75rem' : 'auto',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            type="text"
                            placeholder={labels.search[language as 'en' | 'ar']}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                paddingLeft: language === 'ar' ? '0.75rem' : '2.25rem',
                                paddingRight: language === 'ar' ? '2.25rem' : '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                width: '200px',
                            }}
                        />
                    </div>

                    {/* Add Lead Button */}
                    <button
                        onClick={() => setShowNewModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        <UserPlus size={16} />
                        {labels.newLead[language as 'en' | 'ar']}
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
            }}>
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        title={column.title}
                        titleAr={column.titleAr}
                        status={column.status}
                        leads={groupedLeads[column.status] || []}
                        color={column.color}
                        onLeadClick={(lead) => onLeadSelect?.(lead)}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        language={language}
                    />
                ))}
            </div>

            {/* New Lead Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <NewLeadModal
                        isOpen={showNewModal}
                        onClose={() => setShowNewModal(false)}
                        language={language}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
