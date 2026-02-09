import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    XCircle,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { MotionCard, StaggerContainer, StaggerItem } from "./ui/motion";
import { useLanguage } from "../contexts/LanguageContext";

export function FinanceOverview() {
    const { t, language } = useLanguage();

    // Fetch finance data
    const allTasks = useQuery(api.tasks.getAllTasks, {}) || [];
    const payouts = useQuery(api.wallet.getAllPayouts, {}) || [];
    const payoutStats = useQuery(api.wallet.getPayoutStats) || {
        pending: 0,
        pendingCount: 0,
        approved: 0,
        approvedCount: 0
    };

    // Calculate key metrics
    const approvedTasks = allTasks.filter((t: any) => t.status === "APPROVED");
    const totalPaidToEngineers = approvedTasks.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const totalPendingTasks = allTasks.filter((t: any) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;

    const pendingPayouts = payouts.filter((p: any) => p.status === "PENDING");
    const totalPendingPayoutAmount = pendingPayouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-IQ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' IQD';
    };

    const stats = [
        {
            label: language === 'ar' ? 'إجمالي المدفوعات للمهندسين' : 'Total Paid to Engineers',
            value: formatCurrency(totalPaidToEngineers),
            icon: DollarSign,
            color: '#059669',
            bg: '#ECFDF5',
            trend: `${approvedTasks.length} ${language === 'ar' ? 'مهمة' : 'tasks'}`,
            trendUp: true
        },
        {
            label: language === 'ar' ? 'طلبات السحب المعلقة' : 'Pending Payout Requests',
            value: formatCurrency(totalPendingPayoutAmount),
            subValue: `${pendingPayouts.length} ${language === 'ar' ? 'طلب' : 'requests'}`,
            icon: Clock,
            color: '#F59E0B',
            bg: '#FFFBEB',
        },
        {
            label: language === 'ar' ? 'المهام قيد التنفيذ' : 'Tasks In Progress',
            value: totalPendingTasks.toString(),
            icon: Wallet,
            color: '#3B82F6',
            bg: '#EFF6FF',
        },
        {
            label: language === 'ar' ? 'إجمالي المهام' : 'Total Tasks',
            value: allTasks.length.toString(),
            icon: TrendingUp,
            color: '#8B5CF6',
            bg: '#F5F3FF',
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.25rem"
                    }}>
                        {language === 'ar' ? 'نظرة عامة على المالية' : 'Financial Overview'}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {language === 'ar' ? 'تتبع التدفقات المالية والمدفوعات' : 'Track financial flows and payments'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StaggerItem key={stat.label}>
                        <MotionCard delay={index * 0.05}>
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "1rem",
                                padding: "1.25rem"
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "1rem",
                                    background: stat.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: stat.color,
                                    flexShrink: 0
                                }}>
                                    <stat.icon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "0.25rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>
                                        {stat.label}
                                    </p>
                                    <p style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                        marginBottom: stat.subValue ? "0.125rem" : 0
                                    }}>
                                        {stat.value}
                                    </p>
                                    {stat.subValue && (
                                        <p style={{
                                            fontSize: "0.75rem",
                                            color: "var(--text-secondary)"
                                        }}>
                                            {stat.subValue}
                                        </p>
                                    )}
                                    {stat.trend && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            marginTop: "0.5rem",
                                            fontSize: "0.75rem",
                                            color: stat.trendUp ? "#059669" : "#DC2626"
                                        }}>
                                            {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            <span>{stat.trend} {language === 'ar' ? 'هذا الشهر' : 'this month'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </MotionCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Task Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Status Breakdown */}
                <MotionCard delay={0.2}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <BarChart3 size={18} style={{ marginRight: "0.5rem" }} />
                            {language === 'ar' ? 'توزيع حالات المهام' : 'Task Status Breakdown'}
                        </h3>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                        {[
                            { status: 'APPROVED', label: language === 'ar' ? 'معتمد' : 'Approved', color: '#059669', count: allTasks.filter((t: any) => t.status === 'APPROVED').length },
                            { status: 'SUBMITTED', label: language === 'ar' ? 'مقدم' : 'Submitted', color: '#3B82F6', count: allTasks.filter((t: any) => t.status === 'SUBMITTED').length },
                            { status: 'IN_PROGRESS', label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress', color: '#F59E0B', count: allTasks.filter((t: any) => t.status === 'IN_PROGRESS').length },
                            { status: 'PENDING', label: language === 'ar' ? 'معلق' : 'Pending', color: '#6B7280', count: allTasks.filter((t: any) => t.status === 'PENDING').length },
                            { status: 'REJECTED', label: language === 'ar' ? 'مرفوض' : 'Rejected', color: '#DC2626', count: allTasks.filter((t: any) => t.status === 'REJECTED').length },
                        ].map((item) => {
                            const percentage = allTasks.length > 0 ? (item.count / allTasks.length) * 100 : 0;
                            return (
                                <div key={item.status} style={{ marginBottom: "1rem" }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                        fontSize: "0.875rem"
                                    }}>
                                        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
                                        <span style={{ color: "var(--text-muted)" }}>{item.count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{
                                        height: 8,
                                        background: "var(--bg-secondary)",
                                        borderRadius: 4,
                                        overflow: "hidden"
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                            style={{
                                                height: "100%",
                                                background: item.color,
                                                borderRadius: 4
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </MotionCard>

                {/* Recent Payouts */}
                <MotionCard delay={0.25}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <CreditCard size={18} style={{ marginRight: "0.5rem" }} />
                            {language === 'ar' ? 'طلبات السحب الأخيرة' : 'Recent Payout Requests'}
                        </h3>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                        {payouts.length === 0 ? (
                            <div style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--text-muted)"
                            }}>
                                {language === 'ar' ? 'لا توجد طلبات سحب' : 'No payout requests yet'}
                            </div>
                        ) : (
                            payouts.slice(0, 5).map((payout: any) => (
                                <div
                                    key={payout._id}
                                    style={{
                                        padding: "1rem 1.25rem",
                                        borderBottom: "1px solid var(--border)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <p style={{
                                            fontWeight: 600,
                                            color: "var(--text-primary)",
                                            fontSize: "0.875rem"
                                        }}>
                                            {payout.engineer?.name || payout.engineer?.email || 'Unknown'}
                                        </p>
                                        <p style={{
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)"
                                        }}>
                                            {new Date(payout._creationTime).toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{
                                            fontWeight: 700,
                                            color: "var(--text-primary)"
                                        }}>
                                            {formatCurrency(payout.amount)}
                                        </p>
                                        <span className={`badge badge--${payout.status === 'APPROVED' ? 'success' :
                                            payout.status === 'REJECTED' ? 'danger' : 'warning'
                                            }`} style={{ fontSize: "0.65rem" }}>
                                            {payout.status === 'PENDING' && (language === 'ar' ? 'معلق' : 'Pending')}
                                            {payout.status === 'APPROVED' && (language === 'ar' ? 'معتمد' : 'Approved')}
                                            {payout.status === 'REJECTED' && (language === 'ar' ? 'مرفوض' : 'Rejected')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </MotionCard>
            </div>
        </div>
    );
}
