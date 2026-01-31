import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Building2,
    TrendingUp,
    Package,
    DollarSign,
    Users,
    CheckCircle2,
    Clock,
    AlertTriangle,
    BarChart3,
    ChevronDown,
    ChevronUp,
    MapPin,
    Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionCard, StaggerContainer, StaggerItem } from "./ui/motion";
import { useLanguage } from "../contexts/LanguageContext";

interface ProjectMetrics {
    projectId: string;
    projectName: string;
    location: string;
    budget: number;
    totalUnits: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalSpent: number;
    engineers: string[];
}

export function ManagementDashboard() {
    const { t, language } = useLanguage();
    const [expandedProject, setExpandedProject] = useState<string | null>(null);

    // Fetch all data
    const allTasks = useQuery(api.tasks.getAllTasks) || [];
    const projects = useQuery(api.tasks.getProjects) || [];
    const units = useQuery(api.tasks.getAllUnits) || [];
    const engineers = useQuery(api.tasks.getMyEngineers) || [];
    const materials = useQuery(api.stock.getInventory) || [];
    const payouts = useQuery(api.wallet.getAllPayouts, {}) || [];

    // Calculate project-level metrics
    const projectMetrics: ProjectMetrics[] = projects.map((project: any) => {
        const projectUnits = units.filter((u: any) => u.projectId === project._id);
        const unitIds = projectUnits.map((u: any) => u._id);
        const projectTasks = allTasks.filter((t: any) => unitIds.includes(t.unitId));

        const completedTasks = projectTasks.filter((t: any) => t.status === "APPROVED").length;
        const inProgressTasks = projectTasks.filter((t: any) => t.status === "IN_PROGRESS").length;
        const pendingTasks = projectTasks.filter((t: any) => t.status === "PENDING" || t.status === "SUBMITTED").length;
        const totalSpent = projectTasks.filter((t: any) => t.status === "APPROVED").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        // Get unique engineers assigned to this project
        const projectEngineers = [...new Set(projectTasks.map((t: any) => t.assignedTo))];

        return {
            projectId: project._id,
            projectName: project.name,
            location: project.location || "",
            budget: project.budget || 0,
            totalUnits: projectUnits.length,
            totalTasks: projectTasks.length,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            totalSpent,
            engineers: projectEngineers,
        };
    });

    // Overall metrics
    const totalProjects = projects.length;
    const totalActiveProjects = projectMetrics.filter(p => p.inProgressTasks > 0 || p.pendingTasks > 0).length;
    const totalBudget = projectMetrics.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projectMetrics.reduce((sum, p) => sum + p.totalSpent, 0);
    const overallCompletionRate = allTasks.length > 0
        ? Math.round((allTasks.filter((t: any) => t.status === "APPROVED").length / allTasks.length) * 100)
        : 0;

    // Stock metrics - use currentStock and minimumStock fields
    const lowStockItems = materials.filter((m: any) => (m.currentStock || 0) <= (m.minimumStock || 0)).length;
    const totalStockValue = materials.reduce((sum: number, m: any) => sum + ((m.currentStock || 0) * (m.pricePerUnit || 0)), 0);

    // Finance metrics
    const pendingPayoutsAmount = payouts.filter((p: any) => p.status === "PENDING").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-IQ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' IQD';
    };

    const overviewStats = [
        {
            label: language === 'ar' ? 'إجمالي المشاريع' : 'Total Projects',
            value: totalProjects.toString(),
            subValue: `${totalActiveProjects} ${language === 'ar' ? 'نشط' : 'active'}`,
            icon: Building2,
            color: '#059669',
            bg: '#ECFDF5'
        },
        {
            label: language === 'ar' ? 'إجمالي الميزانية' : 'Total Budget',
            value: formatCurrency(totalBudget),
            subValue: `${formatCurrency(totalSpent)} ${language === 'ar' ? 'صرف' : 'spent'}`,
            icon: DollarSign,
            color: '#3B82F6',
            bg: '#EFF6FF'
        },
        {
            label: language === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate',
            value: `${overallCompletionRate}%`,
            icon: TrendingUp,
            color: '#8B5CF6',
            bg: '#F5F3FF'
        },
        {
            label: language === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts',
            value: lowStockItems.toString(),
            subValue: language === 'ar' ? 'عناصر منخفضة' : 'low items',
            icon: lowStockItems > 0 ? AlertTriangle : Package,
            color: lowStockItems > 0 ? '#DC2626' : '#059669',
            bg: lowStockItems > 0 ? '#FEF2F2' : '#ECFDF5'
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "0.25rem"
                }}>
                    {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Management Dashboard'}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {language === 'ar' ? 'نظرة شاملة على المشاريع والأداء والموارد' : 'Comprehensive overview of projects, performance, and resources'}
                </p>
            </div>

            {/* Overview Stats */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => (
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
                                        fontSize: "1.5rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)"
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
                                </div>
                            </div>
                        </MotionCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Project-by-Project Breakdown */}
            <MotionCard delay={0.2}>
                <div className="card-header" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h3 className="card-title">
                        <Briefcase size={18} style={{ marginRight: "0.5rem" }} />
                        {language === 'ar' ? 'تفاصيل المشاريع' : 'Projects Breakdown'}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {projectMetrics.length} {language === 'ar' ? 'مشروع' : 'projects'}
                    </span>
                </div>
                <div>
                    {projectMetrics.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                            {language === 'ar' ? 'لا توجد مشاريع' : 'No projects yet'}
                        </div>
                    ) : (
                        projectMetrics.map((project, index) => {
                            const isExpanded = expandedProject === project.projectId;
                            const completionRate = project.totalTasks > 0
                                ? Math.round((project.completedTasks / project.totalTasks) * 100)
                                : 0;
                            const budgetUsed = project.budget > 0
                                ? Math.round((project.totalSpent / project.budget) * 100)
                                : 0;

                            return (
                                <motion.div
                                    key={project.projectId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                                    {/* Project Header */}
                                    <div
                                        onClick={() => setExpandedProject(isExpanded ? null : project.projectId)}
                                        style={{
                                            padding: "1rem 1.25rem",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: isExpanded ? "var(--bg-mint)" : "transparent",
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "0.75rem",
                                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: 700,
                                                fontSize: "0.875rem"
                                            }}>
                                                {project.projectName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                                    {project.projectName}
                                                </p>
                                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                    <MapPin size={12} />
                                                    {project.location || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            {/* Mini stats */}
                                            <div style={{ textAlign: "center", display: "none" }} className="md:block">
                                                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{project.totalUnits}</p>
                                                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{language === 'ar' ? 'وحدة' : 'Units'}</p>
                                            </div>
                                            <div style={{ textAlign: "center", display: "none" }} className="md:block">
                                                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{project.totalTasks}</p>
                                                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{language === 'ar' ? 'مهمة' : 'Tasks'}</p>
                                            </div>
                                            <div style={{ textAlign: "center", display: "none" }} className="md:block">
                                                <p style={{ fontSize: "1rem", fontWeight: 700, color: completionRate >= 50 ? "#059669" : "#F59E0B" }}>{completionRate}%</p>
                                                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{language === 'ar' ? 'إنجاز' : 'Done'}</p>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div style={{
                                                    padding: "1.25rem",
                                                    background: "var(--bg-secondary)",
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                                    gap: "1rem"
                                                }}>
                                                    {/* Task Status */}
                                                    <div style={{
                                                        background: "var(--bg-card)",
                                                        padding: "1rem",
                                                        borderRadius: "0.75rem"
                                                    }}>
                                                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                            {language === 'ar' ? 'حالة المهام' : 'Task Status'}
                                                        </p>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                                                <span style={{ color: "#059669" }}>✓ {language === 'ar' ? 'مكتمل' : 'Completed'}</span>
                                                                <span style={{ fontWeight: 600 }}>{project.completedTasks}</span>
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                                                <span style={{ color: "#3B82F6" }}>◐ {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                                                                <span style={{ fontWeight: 600 }}>{project.inProgressTasks}</span>
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                                                <span style={{ color: "#F59E0B" }}>○ {language === 'ar' ? 'معلق' : 'Pending'}</span>
                                                                <span style={{ fontWeight: 600 }}>{project.pendingTasks}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Budget */}
                                                    <div style={{
                                                        background: "var(--bg-card)",
                                                        padding: "1rem",
                                                        borderRadius: "0.75rem"
                                                    }}>
                                                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                            {language === 'ar' ? 'الميزانية' : 'Budget'}
                                                        </p>
                                                        <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                                            {formatCurrency(project.budget)}
                                                        </p>
                                                        <div style={{ marginTop: "0.5rem" }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                                                                <span>{language === 'ar' ? 'مصروف' : 'Spent'}</span>
                                                                <span style={{ color: budgetUsed > 90 ? "#DC2626" : "var(--text-secondary)" }}>{budgetUsed}%</span>
                                                            </div>
                                                            <div style={{ height: 6, background: "var(--bg-secondary)", borderRadius: 3, overflow: "hidden" }}>
                                                                <div style={{
                                                                    width: `${Math.min(budgetUsed, 100)}%`,
                                                                    height: "100%",
                                                                    background: budgetUsed > 90 ? "#DC2626" : budgetUsed > 70 ? "#F59E0B" : "#059669",
                                                                    borderRadius: 3
                                                                }} />
                                                            </div>
                                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                                                {formatCurrency(project.totalSpent)} / {formatCurrency(project.budget)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Team */}
                                                    <div style={{
                                                        background: "var(--bg-card)",
                                                        padding: "1rem",
                                                        borderRadius: "0.75rem"
                                                    }}>
                                                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                            {language === 'ar' ? 'الفريق' : 'Team'}
                                                        </p>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <Users size={20} color="var(--brand-primary)" />
                                                            <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                                                                {project.engineers.length}
                                                            </span>
                                                            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                                                {language === 'ar' ? 'مهندسين' : 'engineers'}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                                                            {project.totalUnits} {language === 'ar' ? 'وحدة' : 'units'}
                                                        </p>
                                                    </div>

                                                    {/* Completion */}
                                                    <div style={{
                                                        background: "var(--bg-card)",
                                                        padding: "1rem",
                                                        borderRadius: "0.75rem"
                                                    }}>
                                                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                            {language === 'ar' ? 'نسبة الإنجاز' : 'Completion'}
                                                        </p>
                                                        <div style={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: "50%",
                                                            background: `conic-gradient(${completionRate >= 50 ? "#059669" : "#F59E0B"} ${completionRate * 3.6}deg, var(--bg-secondary) 0deg)`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}>
                                                            <div style={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: "50%",
                                                                background: "var(--bg-card)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: "0.875rem",
                                                                fontWeight: 700,
                                                                color: completionRate >= 50 ? "#059669" : "#F59E0B"
                                                            }}>
                                                                {completionRate}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </MotionCard>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock Summary */}
                <MotionCard delay={0.3}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <Package size={18} style={{ marginRight: "0.5rem" }} />
                            {language === 'ar' ? 'ملخص المخزون' : 'Stock Summary'}
                        </h3>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'إجمالي العناصر' : 'Total Items'}</span>
                            <span style={{ fontWeight: 600 }}>{materials.length}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'قيمة المخزون' : 'Stock Value'}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(totalStockValue)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: lowStockItems > 0 ? "#DC2626" : "var(--text-muted)" }}>
                                {language === 'ar' ? 'منخفض المخزون' : 'Low Stock'}
                            </span>
                            <span style={{ fontWeight: 600, color: lowStockItems > 0 ? "#DC2626" : "var(--text-primary)" }}>
                                {lowStockItems}
                            </span>
                        </div>
                    </div>
                </MotionCard>

                {/* Finance Summary */}
                <MotionCard delay={0.35}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <DollarSign size={18} style={{ marginRight: "0.5rem" }} />
                            {language === 'ar' ? 'ملخص المالية' : 'Finance Summary'}
                        </h3>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'إجمالي المصروف' : 'Total Spent'}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(totalSpent)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'طلبات معلقة' : 'Pending Payouts'}</span>
                            <span style={{ fontWeight: 600, color: "#F59E0B" }}>{formatCurrency(pendingPayoutsAmount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'الميزانية المتبقية' : 'Remaining Budget'}</span>
                            <span style={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(totalBudget - totalSpent)}</span>
                        </div>
                    </div>
                </MotionCard>

                {/* Team Performance */}
                <MotionCard delay={0.4}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <Users size={18} style={{ marginRight: "0.5rem" }} />
                            {language === 'ar' ? 'أداء الفريق' : 'Team Performance'}
                        </h3>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'إجمالي المهندسين' : 'Total Engineers'}</span>
                            <span style={{ fontWeight: 600 }}>{engineers.length}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'مهام مكتملة' : 'Completed Tasks'}</span>
                            <span style={{ fontWeight: 600, color: "#059669" }}>{allTasks.filter((t: any) => t.status === "APPROVED").length}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>{language === 'ar' ? 'متوسط الإنجاز' : 'Avg Completion'}</span>
                            <span style={{ fontWeight: 600 }}>{overallCompletionRate}%</span>
                        </div>
                    </div>
                </MotionCard>
            </div>
        </div>
    );
}
