import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Building2,
    User,
    DollarSign,
    Calendar,
    Check,
    ChevronRight,
    ChevronLeft,
    X,
    Percent,
    CreditCard,
    Hammer,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

interface Lead {
    _id: Id<"leads">;
    name: string;
    phone: string;
    status: string;
    budget?: number;
}

interface Unit {
    _id: Id<"units">;
    name: string;
    projectName?: string;
    listPrice?: number;
    salesStatus?: string;
}

interface NewDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedUnitId?: string;
    preSelectedLeadId?: string;
}

export function NewDealModal({ isOpen, onClose, preSelectedUnitId, preSelectedLeadId }: NewDealModalProps) {
    const { language } = useLanguage();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [selectedLeadId, setSelectedLeadId] = useState<string>('');
    const [finalPrice, setFinalPrice] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [downPayment, setDownPayment] = useState<string>('');
    const [paymentPlan, setPaymentPlan] = useState<'cash' | 'monthly' | 'construction_linked'>('monthly');
    const [installmentCount, setInstallmentCount] = useState(12);
    const [milestones, setMilestones] = useState([
        { type: 'foundation', percentage: 25, taskId: '' },
        { type: 'structure', percentage: 25, taskId: '' },
        { type: 'roof', percentage: 25, taskId: '' },
        { type: 'finish', percentage: 25, taskId: '' },
    ]);
    const [notes, setNotes] = useState('');

    // Queries
    const units = useQuery(api.unitSales.getUnitsForSales, {}) as Unit[] | undefined;
    const leads = useQuery(api.leads.getLeads, {}) as Lead[] | undefined;
    const tasks = useQuery(api.tasks.getAllTasks, {});

    // Mutations
    const createDeal = useMutation(api.deals.createDeal);
    const generateInstallments = useMutation(api.installments.generateInstallmentPlan);

    // Initialize with pre-selected values
    useEffect(() => {
        if (preSelectedUnitId) {
            setSelectedUnitId(preSelectedUnitId);
            const unit = units?.find((u) => u._id === preSelectedUnitId);
            if (unit?.listPrice) {
                setFinalPrice(unit.listPrice.toString());
            }
        }
        if (preSelectedLeadId) {
            setSelectedLeadId(preSelectedLeadId);
        }
    }, [preSelectedUnitId, preSelectedLeadId, units]);

    // Available units only
    const availableUnits = units?.filter((u) => u.salesStatus === 'available' || !u.salesStatus) || [];

    // Get milestone tasks for selected unit
    const selectedUnit = units?.find((u) => u._id === selectedUnitId);
    const milestoneTasks = tasks?.filter((t: any) => t.isMilestone) || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateInstallment = () => {
        const price = Number(finalPrice) || 0;
        const down = Number(downPayment) || 0;
        const remaining = price - down;
        return Math.ceil(remaining / installmentCount);
    };

    const handleSubmit = async () => {
        if (!selectedUnitId || !selectedLeadId || !finalPrice) {
            toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create the deal
            const dealId = await createDeal({
                unitId: selectedUnitId as Id<"units">,
                leadId: selectedLeadId as Id<"leads">,
                finalPrice: Number(finalPrice),
                discount: discount ? Number(discount) : undefined,
                paymentPlan,
                downPayment: downPayment ? Number(downPayment) : undefined,
                notes: notes || undefined,
            });

            // Generate installment plan
            if (paymentPlan === 'monthly') {
                await generateInstallments({
                    dealId: dealId as Id<"deals">,
                    planType: 'monthly',
                    numberOfInstallments: installmentCount,
                });
            } else if (paymentPlan === 'construction_linked') {
                const milestonesData = milestones.map((m) => ({
                    milestoneType: m.type,
                    taskId: m.taskId ? (m.taskId as Id<"tasks">) : undefined,
                    percentage: m.percentage,
                }));
                await generateInstallments({
                    dealId: dealId as Id<"deals">,
                    planType: 'construction_linked',
                    milestones: milestonesData,
                });
            }

            toast.success(language === 'ar' ? 'تم إنشاء الصفقة بنجاح' : 'Deal created successfully');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create deal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labels = {
        title: { en: 'Create New Deal', ar: 'إنشاء صفقة جديدة' },
        step1: { en: 'Select Unit', ar: 'اختر الوحدة' },
        step2: { en: 'Select Client', ar: 'اختر العميل' },
        step3: { en: 'Payment Plan', ar: 'خطة الدفع' },
        next: { en: 'Next', ar: 'التالي' },
        back: { en: 'Back', ar: 'رجوع' },
        create: { en: 'Create Deal', ar: 'إنشاء الصفقة' },
        search: { en: 'Search...', ar: 'بحث...' },
        finalPrice: { en: 'Final Price', ar: 'السعر النهائي' },
        discount: { en: 'Discount', ar: 'الخصم' },
        downPayment: { en: 'Down Payment', ar: 'الدفعة الأولى' },
        paymentPlan: { en: 'Payment Plan', ar: 'خطة الدفع' },
        cash: { en: 'Cash (Full Payment)', ar: 'نقداً (دفعة كاملة)' },
        monthly: { en: 'Monthly Installments', ar: 'أقساط شهرية' },
        construction: { en: 'Construction Linked', ar: 'مرتبط بالبناء' },
        installments: { en: 'Number of Installments', ar: 'عدد الأقساط' },
        perMonth: { en: 'Per Installment', ar: 'لكل قسط' },
        milestone: { en: 'Milestone', ar: 'مرحلة' },
        percentage: { en: 'Percentage', ar: 'النسبة' },
        linkedTask: { en: 'Linked Task', ar: 'المهمة المرتبطة' },
        notes: { en: 'Notes', ar: 'ملاحظات' },
        foundation: { en: 'Foundation', ar: 'الأساس' },
        structure: { en: 'Structure', ar: 'الهيكل' },
        roof: { en: 'Roof', ar: 'السقف' },
        finish: { en: 'Finishing', ar: 'التشطيب' },
    };

    const milestoneLabels: Record<string, Record<string, string>> = {
        foundation: labels.foundation,
        structure: labels.structure,
        roof: labels.roof,
        finish: labels.finish,
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
                background: 'rgba(0,0,0,0.6)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {labels.title[language as 'en' | 'ar']}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    gap: '0.5rem',
                    background: 'var(--bg-mint)',
                }}>
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: step >= s ? 'var(--brand-primary)' : 'var(--border)',
                                color: step >= s ? 'white' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}>
                                {step > s ? <Check size={14} /> : s}
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: step === s ? 600 : 400,
                                color: step === s ? 'var(--text-primary)' : 'var(--text-muted)',
                            }}>
                                {s === 1 && labels.step1[language as 'en' | 'ar']}
                                {s === 2 && labels.step2[language as 'en' | 'ar']}
                                {s === 3 && labels.step3[language as 'en' | 'ar']}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                }}>
                    {/* Step 1: Select Unit */}
                    {step === 1 && (
                        <div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '1rem',
                            }}>
                                {availableUnits.map((unit) => (
                                    <motion.div
                                        key={unit._id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedUnitId(unit._id);
                                            if (unit.listPrice) {
                                                setFinalPrice(unit.listPrice.toString());
                                            }
                                        }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: `2px solid ${selectedUnitId === unit._id ? 'var(--brand-primary)' : 'var(--border)'}`,
                                            background: selectedUnitId === unit._id ? 'var(--bg-mint)' : 'var(--bg-card)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                        }}>
                                            <Building2 size={18} color="var(--brand-primary)" />
                                            <span style={{ fontWeight: 600 }}>{unit.name}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {unit.projectName}
                                        </div>
                                        {unit.listPrice && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                fontWeight: 600,
                                                color: 'var(--brand-primary)',
                                            }}>
                                                {formatCurrency(unit.listPrice)} IQD
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Client */}
                    {step === 2 && (
                        <div>
                            <div style={{
                                display: 'grid',
                                gap: '0.75rem',
                            }}>
                                {leads?.filter((l) => l.status !== 'lost').map((lead) => (
                                    <motion.div
                                        key={lead._id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => setSelectedLeadId(lead._id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: `2px solid ${selectedLeadId === lead._id ? 'var(--brand-primary)' : 'var(--border)'}`,
                                            background: selectedLeadId === lead._id ? 'var(--bg-mint)' : 'var(--bg-card)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem',
                                            }}>
                                                <User size={16} color="var(--brand-primary)" />
                                                <span style={{ fontWeight: 600 }}>{lead.name}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {lead.phone}
                                            </div>
                                        </div>
                                        {lead.budget && (
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'var(--border)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem',
                                            }}>
                                                {formatCurrency(lead.budget)} IQD
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment Plan */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Price & Discount */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {labels.finalPrice[language as 'en' | 'ar']} *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign size={16} style={{
                                            position: 'absolute',
                                            left: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }} />
                                        <input
                                            type="number"
                                            value={finalPrice}
                                            onChange={(e) => setFinalPrice(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                paddingLeft: '2.25rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {labels.discount[language as 'en' | 'ar']}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Percent size={16} style={{
                                            position: 'absolute',
                                            left: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }} />
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                paddingLeft: '2.25rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Down Payment */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {labels.downPayment[language as 'en' | 'ar']}
                                </label>
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
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

                            {/* Payment Plan Type */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {labels.paymentPlan[language as 'en' | 'ar']}
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'cash', label: labels.cash, icon: CreditCard },
                                        { key: 'monthly', label: labels.monthly, icon: Calendar },
                                        { key: 'construction_linked', label: labels.construction, icon: Hammer },
                                    ].map((plan) => (
                                        <button
                                            key={plan.key}
                                            type="button"
                                            onClick={() => setPaymentPlan(plan.key as any)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${paymentPlan === plan.key ? 'var(--brand-primary)' : 'var(--border)'}`,
                                                background: paymentPlan === plan.key ? 'var(--bg-mint)' : 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                minWidth: '120px',
                                            }}
                                        >
                                            <plan.icon size={20} color={paymentPlan === plan.key ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: paymentPlan === plan.key ? 600 : 400,
                                                color: paymentPlan === plan.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                                textAlign: 'center',
                                            }}>
                                                {plan.label[language as 'en' | 'ar']}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Installments Config */}
                            {paymentPlan === 'monthly' && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-mint)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            {labels.installments[language as 'en' | 'ar']}
                                        </label>
                                        <select
                                            value={installmentCount}
                                            onChange={(e) => setInstallmentCount(Number(e.target.value))}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-card)',
                                            }}
                                        >
                                            {[3, 6, 12, 18, 24, 36].map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{
                                        padding: '1rem',
                                        background: 'var(--bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            {labels.perMonth[language as 'en' | 'ar']}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                            {formatCurrency(calculateInstallment())} IQD
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Construction Linked Config */}
                            {paymentPlan === 'construction_linked' && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-mint)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {milestones.map((milestone, index) => (
                                            <div
                                                key={milestone.type}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 80px',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-card)',
                                                    borderRadius: 'var(--radius-md)',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                                                        {milestoneLabels[milestone.type][language as 'en' | 'ar']}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {formatCurrency((Number(finalPrice) - Number(downPayment || 0)) * (milestone.percentage / 100))} IQD
                                                    </div>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={milestone.percentage}
                                                    onChange={(e) => {
                                                        const newMilestones = [...milestones];
                                                        newMilestones[index].percentage = Number(e.target.value);
                                                        setMilestones(newMilestones);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: '1px solid var(--border)',
                                                        textAlign: 'center',
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {labels.notes[language as 'en' | 'ar']}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
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
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 500,
                            }}
                        >
                            <ChevronLeft size={16} />
                            {labels.back[language as 'en' | 'ar']}
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !selectedUnitId) {
                                    toast.error(language === 'ar' ? 'يرجى اختيار وحدة' : 'Please select a unit');
                                    return;
                                }
                                if (step === 2 && !selectedLeadId) {
                                    toast.error(language === 'ar' ? 'يرجى اختيار عميل' : 'Please select a client');
                                    return;
                                }
                                setStep(step + 1);
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 500,
                            }}
                        >
                            {labels.next[language as 'en' | 'ar']}
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                                color: 'white',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 500,
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            <Check size={16} />
                            {labels.create[language as 'en' | 'ar']}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
