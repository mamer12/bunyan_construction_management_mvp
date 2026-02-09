import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import {
    Building2,
    TrendingUp,
    Package,
    DollarSign,
    Users,
    AlertTriangle,
    MapPin,
    Briefcase,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MotionCard,
    StaggerContainer,
    StaggerItem,
    BentoGrid,
    AnimatedCounter,
    ProjectCard
} from "./ui/motion";
import { useLanguage } from "../contexts/LanguageContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FloatingMobileNav } from "./FloatingMobileNav";
import { ProjectsView } from "./ProjectsView";
import { TeamsView } from "./TeamsView";
import { FinanceOverview } from "./FinanceOverview";
import { StockView } from "./StockView";
import { SettingsView } from "./SettingsView";
import { SalesView } from "./Sales/SalesView";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "@/lib/utils";

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

export function ManagementDashboard({ showHeader = true }: { showHeader?: boolean }) {
    const { t, language } = useLanguage();
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useIsMobile();

    // Fetch actual user data
    const role = useQuery(api.roles.getMyRole);
    const currentUser = useQuery(api.auth.loggedInUser);

    // Define which menu items each role can see
    const ROLE_MENU_ACCESS: Record<string, string[]> = {
        admin: ["dashboard", "management", "projects", "sales", "finance", "team", "stock", "settings"],
        acting_manager: ["dashboard", "management", "projects", "sales", "finance", "team"],
        lead: ["dashboard", "projects", "finance", "team"],
        engineer: ["dashboard", "projects"],
        finance: ["dashboard", "finance"],
        stock: ["dashboard", "stock"],
        sales_agent: ["dashboard", "sales"],
        broker: ["dashboard", "sales"],
        guest: ["dashboard"],
    };

    const allowedMenuIds = ROLE_MENU_ACCESS[role || "guest"] || ROLE_MENU_ACCESS.guest;

    // Fetch all data
    const allTasks = (useQuery(api.tasks.getAllTasks, {}) || []).filter((t): t is NonNullable<typeof t> => t != null);
    const projects = useQuery(api.projects.getProjects) || [];
    const units = useQuery(api.units.getAllUnits) || [];
    const engineers = useQuery(api.engineers.getMyEngineers) || [];
    const materials = useQuery(api.stock.getInventory) || [];
    const payouts = useQuery(api.wallet.getAllPayouts, {}) || [];

    // Calculate project-level metrics
    const projectMetrics: ProjectMetrics[] = projects.map((project) => {
        const projectUnits = units.filter((u) => u.projectId === project._id);
        const unitIds = projectUnits.map((u) => u._id);
        const projectTasks = allTasks.filter((t) => unitIds.includes(t.unitId));

        const completedTasks = projectTasks.filter((t) => t.status === "APPROVED").length;
        const inProgressTasks = projectTasks.filter((t) => t.status === "IN_PROGRESS").length;
        const pendingTasks = projectTasks.filter((t) => t.status === "PENDING" || t.status === "SUBMITTED").length;
        const totalSpent = projectTasks.filter((t) => t.status === "APPROVED").reduce((sum: number, t) => sum + (t.amount || 0), 0);

        // Get unique engineers assigned to this project
        const projectEngineers = [...new Set(projectTasks.map((t) => t.assignedTo))];

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
    const totalBudget = projects.reduce((sum: number, p) => sum + (p.totalBudget || 0), 0);
    const totalSpent = projects.reduce((sum: number, p) => sum + (p.budgetSpent || 0), 0);
    const overallCompletionRate = allTasks.length > 0
        ? Math.round((allTasks.filter((t) => t.status === "APPROVED").length / allTasks.length) * 100)
        : 0;

    // Stock metrics
    const lowStockItems = materials.filter((m) => (m.currentStock || 0) <= (m.minimumStock || 0)).length;
    const totalStockValue = materials.reduce((sum: number, m) => sum + ((m.currentStock || 0) * (m.pricePerUnit || 0)), 0);

    // Finance metrics
    const pendingPayoutsAmount = payouts.filter((p) => p.status === "PENDING").reduce((sum: number, p) => sum + (p.amount || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const overviewStats = [
        {
            label: language === 'ar' ? 'إجمالي المشاريع' : 'Total Projects',
            value: totalProjects,
            subValue: `${totalActiveProjects} ${language === 'ar' ? 'نشط' : 'active'}`,
            icon: Building2,
            color: 'emerald',
            bg: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: language === 'ar' ? 'إجمالي الميزانية' : 'Total Budget',
            value: totalBudget,
            isCurrency: true,
            subValue: `${formatCurrency(totalSpent)} ${language === 'ar' ? 'مصروف' : 'spent'}`,
            icon: DollarSign,
            color: 'blue',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: language === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate',
            value: overallCompletionRate,
            suffix: '%',
            icon: TrendingUp,
            color: 'purple',
            bg: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            label: language === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts',
            value: lowStockItems,
            subValue: language === 'ar' ? 'عناصر منخفضة' : 'low items',
            icon: lowStockItems > 0 ? AlertTriangle : Package,
            color: lowStockItems > 0 ? 'rose' : 'emerald',
            bg: lowStockItems > 0 ? 'bg-rose-50' : 'bg-emerald-50',
            textColor: lowStockItems > 0 ? 'text-rose-600' : 'text-emerald-600'
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "projects":
                return <ProjectsView />;
            case "team":
                return <TeamsView />;
            case "finance":
                return <FinanceOverview />;
            case "stock":
                return <StockView />;
            case "settings":
                return <SettingsView />;
            case "sales":
                return <SalesView />;
            case "dashboard":
            default:
                return (
                    <div className="flex flex-col gap-8 md:gap-10 flex-1 min-h-0">
                        {/* Header Section */}
                        <div className="flex flex-wrap justify-between items-end gap-4">
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {language === 'ar' ? 'لوحة القيادة' : 'Executive Overview'}
                                </h1>
                                <p className="text-slate-500 font-medium mt-1 text-xs uppercase tracking-wider">
                                    {language === 'ar' ? 'مراقبة أداء المشاريع' : 'Project Performance & Metrics'}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 shrink-0">
                                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {language === 'ar' ? 'تحديث مباشر' : 'Live'}
                                </span>
                            </div>
                        </div>

                        {/* Top Stats Grid */}
                        <BentoGrid columns={4} className="w-full gap-4 md:gap-5">
                            {overviewStats.map((stat, index) => (
                                <MotionCard key={stat.label} delay={index * 0.1} className="relative overflow-hidden group min-w-0">
                                    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700 opacity-20", stat.bg)} />
                                    <div className="p-5 relative z-10 min-w-0">
                                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 shadow-sm shrink-0", stat.bg, stat.textColor)}>
                                            <stat.icon size={22} />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 truncate">{stat.label}</p>
                                        <div className="flex items-baseline gap-1 flex-wrap">
                                            <AnimatedCounter
                                                value={stat.value}
                                                className="text-xl md:text-2xl font-bold text-slate-800 tabular-nums"
                                                prefix={stat.isCurrency ? "$" : ""}
                                                suffix={stat.suffix || ""}
                                            />
                                        </div>
                                        {stat.subValue && (
                                            <p className="text-xs font-medium text-slate-500 mt-1 truncate">{stat.subValue}</p>
                                        )}
                                    </div>
                                </MotionCard>
                            ))}
                        </BentoGrid>

                        {/* Middle Row: Projects Breakdown & Quick Data */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 flex-1 min-h-0">
                            {/* Detailed Projects List */}
                            <MotionCard className="xl:col-span-2 overflow-hidden" delay={0.4}>
                                <header className="dashboard-section__header">
                                    <h3 className="dashboard-section__title flex items-center gap-2">
                                        <Briefcase size={16} className="text-emerald-500 shrink-0" />
                                        <span className="truncate">{language === 'ar' ? 'تفاصيل المشاريع' : 'Project Distribution'}</span>
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 uppercase tracking-wide whitespace-nowrap shrink-0">
                                        {projects.length} {language === 'ar' ? 'الإجمالي' : 'Total'}
                                    </span>
                                </header>
                                <div className="divide-y divide-slate-100">
                                    {projects.length === 0 ? (
                                        <div className="py-16 px-4 text-center">
                                            <Building2 size={48} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" />
                                            <p className="text-slate-500 font-semibold text-sm">{language === 'ar' ? 'لا توجد مشاريع نشطة' : 'No active projects'}</p>
                                        </div>
                                    ) : (
                                        projects.map((project, index: number) => {
                                            const isExpanded = expandedProject === project._id;
                                            const completionRate = project.totalTasksCount > 0
                                                ? Math.round((project.completedTasksCount / project.totalTasksCount) * 100)
                                                : 0;

                                            return (
                                                <div key={project._id} className="group">
                                                    <div
                                                        onClick={() => setExpandedProject(isExpanded ? null : project._id)}
                                                        className={cn(
                                                            "p-4 flex items-center justify-between cursor-pointer transition-colors",
                                                            isExpanded ? "bg-emerald-50/30" : "hover:bg-slate-50/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                                {project.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors truncate">{project.name}</h4>
                                                                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                                                    <MapPin size={12} className="shrink-0 text-emerald-500" /> {project.location || "Central"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <div className="hidden md:flex flex-col items-end">
                                                                <span className="text-xs font-semibold text-slate-500 uppercase">{language === 'ar' ? 'الإنجاز' : 'Completion'}</span>
                                                                <span className={cn("text-sm font-bold tabular-nums", completionRate > 75 ? "text-emerald-600" : "text-amber-600")}>
                                                                    {completionRate}%
                                                                </span>
                                                            </div>
                                                            <div className="w-24 hidden lg:block">
                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                                                                </div>
                                                            </div>
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-slate-50/50"
                                                            >
                                                                <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4" dir="ltr">
                                                                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-start">
                                                                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{language === 'ar' ? 'استخدام الميزانية' : 'Budget'}</p>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">{formatCurrency(project.budgetSpent || 0)}</p>
                                                                        <p className="text-xs text-slate-400 mt-0.5">/ {formatCurrency(project.totalBudget || 0)}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-start">
                                                                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{language === 'ar' ? 'الوحدات' : 'Units'}</p>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">{project.unitCount || 0}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-start">
                                                                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{language === 'ar' ? 'المهام المنجزة' : 'Tasks Done'}</p>
                                                                        <p className="text-sm font-bold text-emerald-600 tabular-nums">{project.completedTasksCount || 0} / {project.totalTasksCount || 0}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-start">
                                                                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'ar' ? 'سليم' : 'Healthy'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </MotionCard>

                            {/* Right Sidebar: Quick Insights */}
                            <div className="flex flex-col gap-6">
                                {/* Stock Insight - RTL-safe alignment */}
                                <MotionCard delay={0.5} className="overflow-hidden">
                                    <header className="dashboard-section__header">
                                        <h4 className="dashboard-section__title flex items-center gap-2">
                                            <Package size={16} className="text-rose-500 shrink-0" />
                                            <span className="truncate">{language === 'ar' ? 'تنبيهات المخزون' : 'Stock Insights'}</span>
                                        </h4>
                                    </header>
                                    <div className="dashboard-section__body space-y-3">
                                        <div className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 min-w-0">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate text-start">{language === 'ar' ? 'قيمة المخزون' : 'Inventory Value'}</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 shrink-0 tabular-nums">{formatCurrency(totalStockValue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-3 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50 min-w-0">
                                            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide truncate text-start">{language === 'ar' ? 'منخفض حرج' : 'Critical Low Stock'}</span>
                                            <span className="text-sm font-bold text-rose-700 dark:text-rose-400 shrink-0 tabular-nums">{lowStockItems} {language === 'ar' ? 'عنصر' : 'Items'}</span>
                                        </div>
                                    </div>
                                </MotionCard>

                                {/* Team / Force Insight */}
                                <MotionCard delay={0.6} className="bg-slate-900 border-none relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]" />
                                    <div className="p-6 relative z-10">
                                        <h4 className="font-bold text-white/70 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                                            <Users size={16} className="text-emerald-400 shrink-0" />
                                            <span>{language === 'ar' ? 'أداء الفريق' : 'Force Insight'}</span>
                                        </h4>
                                        <div className="flex items-end gap-3 mb-2">
                                            <span className="text-3xl font-bold text-white tabular-nums">{overallCompletionRate}%</span>
                                            <div className="flex flex-col text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
                                                <span>{language === 'ar' ? 'إجمالي' : 'Global'}</span>
                                                <span>{language === 'ar' ? 'التقييم' : 'Rating'}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-6">{language === 'ar' ? `عبر ${projects.length} مشاريع` : `Across ${projects.length} sites`}</p>
                                        <button type="button" className="w-full py-3 bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-emerald-400 transition-colors">
                                            {language === 'ar' ? 'تقرير' : 'Generate Report'}
                                        </button>
                                    </div>
                                </MotionCard>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (!showHeader) {
        return (
            <div className="flex flex-col gap-6 md:gap-8 flex-1 min-h-0">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="main-content flex flex-col min-h-screen">
                <TopBar
                    breadcrumb={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    userName={currentUser?.name || "User"}
                    userRole={role || "guest"}
                />

                <div className="flex-1 p-6 md:p-8 lg:p-10 min-h-0">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </main>

            {isMobile && (
                <FloatingMobileNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    allowedMenuIds={allowedMenuIds}
                />
            )}
        </div>
    );
}
