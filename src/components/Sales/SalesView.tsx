import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { UnitGrid } from './UnitGrid';
import { LeadKanban } from './LeadKanban';
import { NewDealModal } from './NewDealModal';
import { DealsList } from './DealsList';
import {
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    Clock,
    AlertCircle,
    Home,
    UserCheck,
    CreditCard,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

// Stats Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: { value: number; positive: boolean };
}) {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
            style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                border: '1px solid var(--border)',
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} />
                </div>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: trend.positive ? 'var(--success)' : 'var(--danger)',
                    }}>
                        <TrendingUp size={12} style={{
                            transform: trend.positive ? 'none' : 'rotate(180deg)'
                        }} />
                        {trend.value}%
                    </div>
                )}
            </div>
            <div style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
            }}>
                {title}
            </div>
            {subtitle && (
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                }}>
                    {subtitle}
                </div>
            )}
        </motion.div>
    );
}

// Overdue Alert Component
function OverdueAlert({
    count,
    amount,
    language
}: {
    count: number;
    amount: number;
    language: string;
}) {
    if (count === 0) return null;

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amt);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}
        >
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <AlertCircle size={22} color="white" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#991B1B' }}>
                    {language === 'ar'
                        ? `${count} أقساط متأخرة`
                        : `${count} Overdue Installments`}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#B91C1C' }}>
                    {language === 'ar'
                        ? `المبلغ الإجمالي: ${formatCurrency(amount)} دينار`
                        : `Total Amount: ${formatCurrency(amount)} IQD`}
                </div>
            </div>
            <button
                style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                }}
            >
                {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </button>
        </motion.div>
    );
}

// Tab Navigation
function TabNav({
    activeTab,
    onTabChange,
    language
}: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    language: string;
}) {
    const tabs = [
        { key: 'overview', en: 'Overview', ar: 'نظرة عامة', icon: BarChart3 },
        { key: 'deals', en: 'Deals', ar: 'الصفقات', icon: CreditCard },
        { key: 'inventory', en: 'Unit Inventory', ar: 'مخزون الوحدات', icon: Home },
        { key: 'leads', en: 'Lead Pipeline', ar: 'العملاء المحتملين', icon: Users },
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '0.25rem',
            marginBottom: '1.5rem',
            background: 'var(--bg-secondary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-lg)',
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                    }}
                >
                    <tab.icon size={18} />
                    {tab[language as 'en' | 'ar']}
                </button>
            ))}
        </div>
    );
}

// Main SalesView Component
export function SalesView() {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [showNewDealModal, setShowNewDealModal] = useState(false);
    const [preSelectedUnitId, setPreSelectedUnitId] = useState<string | undefined>();

    const stats = useQuery(api.crm.getSalesStats, {});

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const labels = {
        title: { en: 'Sales CRM', ar: 'إدارة المبيعات' },
        subtitle: { en: 'Manage leads, deals, and payments', ar: 'إدارة العملاء المحتملين والصفقات والمدفوعات' },
        totalLeads: { en: 'Total Leads', ar: 'إجمالي العملاء' },
        newThisMonth: { en: 'new this month', ar: 'جديد هذا الشهر' },
        activeDeals: { en: 'Active Deals', ar: 'الصفقات النشطة' },
        inProgress: { en: 'deals in progress', ar: 'صفقات قيد التنفيذ' },
        totalRevenue: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
        fromCompletedDeals: { en: 'from completed deals', ar: 'من الصفقات المكتملة' },
        pendingPayments: { en: 'Pending Payments', ar: 'المدفوعات المعلقة' },
        fromInstallments: { en: 'from installments', ar: 'من الأقساط' },
        unitsAvailable: { en: 'Units Available', ar: 'الوحدات المتاحة' },
        reserved: { en: 'Reserved', ar: 'محجوز' },
        sold: { en: 'Sold', ar: 'مباع' },
        conversionRate: { en: 'Conversion Rate', ar: 'معدل التحويل' },
        leadsToDeals: { en: 'leads to deals', ar: 'العملاء إلى صفقات' },
        collected: { en: 'Collected', ar: 'المحصّل' },
        fromPaidInstallments: { en: 'from paid installments', ar: 'من الأقساط المدفوعة' },
    };

    const handleCreateDeal = (unitId: string) => {
        setPreSelectedUnitId(unitId);
        setShowNewDealModal(true);
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                }}>
                    {labels.title[language as 'en' | 'ar']}
                </h1>
                <p style={{
                    margin: '0.25rem 0 0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                }}>
                    {labels.subtitle[language as 'en' | 'ar']}
                </p>
            </div>

            {/* Overdue Alert */}
            {stats && (
                <OverdueAlert
                    count={stats.installments.overdueCount}
                    amount={stats.installments.overdueAmount}
                    language={language}
                />
            )}

            {/* Tab Navigation */}
            <TabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                language={language}
            />

            {/* Content */}
            {activeTab === 'overview' && (
                <div>
                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}>
                        <StatCard
                            title={labels.totalLeads[language as 'en' | 'ar']}
                            value={stats?.leads.total || 0}
                            subtitle={`${stats?.leads.newThisMonth || 0} ${labels.newThisMonth[language as 'en' | 'ar']}`}
                            icon={Users}
                            color="#3B82F6"
                            trend={{ value: 12, positive: true }}
                        />
                        <StatCard
                            title={labels.activeDeals[language as 'en' | 'ar']}
                            value={stats?.deals.active || 0}
                            subtitle={labels.inProgress[language as 'en' | 'ar']}
                            icon={CreditCard}
                            color="#F59E0B"
                        />
                        <StatCard
                            title={labels.unitsAvailable[language as 'en' | 'ar']}
                            value={stats?.units.available || 0}
                            subtitle={`${stats?.units.reserved || 0} ${labels.reserved[language as 'en' | 'ar']} · ${stats?.units.sold || 0} ${labels.sold[language as 'en' | 'ar']}`}
                            icon={Home}
                            color="#10B981"
                        />
                        <StatCard
                            title={labels.conversionRate[language as 'en' | 'ar']}
                            value={`${stats?.leads.conversionRate || 0}%`}
                            subtitle={labels.leadsToDeals[language as 'en' | 'ar']}
                            icon={UserCheck}
                            color="#8B5CF6"
                        />
                    </div>

                    {/* Revenue Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            color: 'white',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                opacity: 0.9,
                            }}>
                                <DollarSign size={20} />
                                {labels.totalRevenue[language as 'en' | 'ar']}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                {formatCurrency(stats?.deals.totalRevenue || 0)}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                                IQD · {labels.fromCompletedDeals[language as 'en' | 'ar']}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                color: 'var(--text-secondary)',
                            }}>
                                <Clock size={20} />
                                {labels.pendingPayments[language as 'en' | 'ar']}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: 'var(--warning)',
                            }}>
                                {formatCurrency(stats?.installments.pendingAmount || 0)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                IQD · {stats?.installments.pendingCount || 0} {labels.fromInstallments[language as 'en' | 'ar']}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                color: 'var(--text-secondary)',
                            }}>
                                <DollarSign size={20} />
                                {labels.collected[language as 'en' | 'ar']}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: 'var(--success)',
                            }}>
                                {formatCurrency(stats?.installments.collectedAmount || 0)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                IQD · {labels.fromPaidInstallments[language as 'en' | 'ar']}
                            </div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {/* Recent Leads Preview */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.25rem',
                            border: '1px solid var(--border)',
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <Users size={18} color="var(--brand-primary)" />
                                {language === 'ar' ? 'العملاء الجدد' : 'New Leads'}
                            </h3>
                            <button
                                onClick={() => setActiveTab('leads')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-mint)',
                                    border: '1px dashed var(--border-emerald)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    color: 'var(--brand-primary)',
                                    fontWeight: 500,
                                }}
                            >
                                {language === 'ar' ? 'عرض كل العملاء' : 'View All Leads'}
                            </button>
                        </div>

                        {/* Available Units Preview */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.25rem',
                            border: '1px solid var(--border)',
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <Home size={18} color="var(--brand-primary)" />
                                {language === 'ar' ? 'الوحدات المتاحة' : 'Available Units'}
                            </h3>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-mint)',
                                    border: '1px dashed var(--border-emerald)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    color: 'var(--brand-primary)',
                                    fontWeight: 500,
                                }}
                            >
                                {language === 'ar' ? 'عرض كل الوحدات' : 'View All Units'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <UnitGrid onCreateDeal={handleCreateDeal} />
            )}

            {activeTab === 'deals' && (
                <DealsList />
            )}

            {activeTab === 'leads' && (
                <LeadKanban />
            )}

            {/* New Deal Modal */}
            <NewDealModal
                isOpen={showNewDealModal}
                onClose={() => {
                    setShowNewDealModal(false);
                    setPreSelectedUnitId(undefined);
                }}
                preSelectedUnitId={preSelectedUnitId}
            />
        </div>
    );
}
