import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
    const totalBudget = projects.reduce((sum, p: any) => sum + (p.totalBudget || 0), 0);
    const totalSpent = projects.reduce((sum, p: any) => sum + (p.budgetSpent || 0), 0);
    const overallCompletionRate = allTasks.length > 0
        ? Math.round((allTasks.filter((t: any) => t.status === "APPROVED").length / allTasks.length) * 100)
        : 0;

    // Stock metrics
    const lowStockItems = materials.filter((m: any) => (m.currentStock || 0) <= (m.minimumStock || 0)).length;
    const totalStockValue = materials.reduce((sum: number, m: any) => sum + ((m.currentStock || 0) * (m.pricePerUnit || 0)), 0);

    // Finance metrics
    const pendingPayoutsAmount = payouts.filter((p: any) => p.status === "PENDING").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

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
                    <div className="flex flex-col gap-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {language === 'ar' ? 'لوحة القيادة' : 'Executive Overview'}
                                </h1>
                                <p className="text-slate-500 font-semibold mt-1 uppercase text-[10px] tracking-[0.15em]">
                                    {language === 'ar' ? 'مراقبة أداء المشاريع' : 'Project Performance & Metrics'}
                                </p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Updates
                                </div>
                            </div>
                        </div>

                        {/* Top Stats Grid */}
                        <BentoGrid columns={4}>
                            {overviewStats.map((stat, index) => (
                                <MotionCard key={stat.label} delay={index * 0.1} className="relative overflow-hidden group">
                                    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700 opacity-20", stat.bg)} />
                                    <div className="p-6 relative z-10">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm", stat.bg, stat.textColor)}>
                                            <stat.icon size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-1">
                                            <AnimatedCounter
                                                value={stat.value}
                                                className="text-2xl font-bold text-slate-800"
                                                prefix={stat.isCurrency ? "$" : ""}
                                                suffix={stat.suffix || ""}
                                            />
                                        </div>
                                        {stat.subValue && (
                                            <p className="text-[10px] font-bold text-slate-500 mt-1">{stat.subValue}</p>
                                        )}
                                    </div>
                                </MotionCard>
                            ))}
                        </BentoGrid>

                        {/* Middle Row: Projects Breakdown & Quick Data */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Detailed Projects List */}
                            <MotionCard className="xl:col-span-2" delay={0.4}>
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                        <Briefcase size={16} className="text-emerald-500" />
                                        {language === 'ar' ? 'تفاصيل المشاريع' : 'Project Distribution'}
                                    </h3>
                                    <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-100 uppercase">
                                        {projects.length} Total
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {projects.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Building2 size={48} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active projects</p>
                                        </div>
                                    ) : (
                                        projects.map((project: any, index) => {
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
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                                                {project.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{project.name}</h4>
                                                                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                                                    <MapPin size={10} /> {project.location || "Central"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-8">
                                                            <div className="hidden md:flex flex-col items-end">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completion</span>
                                                                <span className={cn("text-xs font-bold", completionRate > 75 ? "text-emerald-600" : "text-amber-500")}>
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
                                                                <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                                                                        <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">Budget Utilization</p>
                                                                        <p className="text-sm font-bold text-slate-800">{formatCurrency(project.budgetSpent || 0)}</p>
                                                                        <p className="text-[9px] text-slate-400 mt-1">of {formatCurrency(project.totalBudget || 0)}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                                                                        <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">Team Size</p>
                                                                        <p className="text-sm font-bold text-slate-800">{project.unitCount || 0} Units</p>
                                                                        <p className="text-[9px] text-slate-400 mt-1">Active on project</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                                                                        <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">Tasks Done</p>
                                                                        <p className="text-sm font-bold text-emerald-600">{project.completedTasksCount || 0}</p>
                                                                        <p className="text-[9px] text-slate-400 mt-1">out of {project.totalTasksCount || 0}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                                                                        <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">Status</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Healthy</span>
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
                                {/* Stock Insight */}
                                <MotionCard delay={0.5}>
                                    <div className="p-6">
                                        <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                                            <Package size={14} className="text-rose-500" />
                                            Stock Insights
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Inventory Value</span>
                                                <span className="text-sm font-bold text-slate-800">{formatCurrency(totalStockValue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">Critical Low Stock</span>
                                                <span className="text-sm font-bold text-rose-700">{lowStockItems} Items</span>
                                            </div>
                                        </div>
                                    </div>
                                </MotionCard>

                                {/* Team Insight */}
                                <MotionCard delay={0.6} className="bg-slate-900 border-none relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]" />
                                    <div className="p-6 relative z-10">
                                        <h4 className="font-bold text-white/50 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                                            <Users size={14} className="text-emerald-500" />
                                            Force Insight
                                        </h4>
                                        <div className="flex items-end gap-3 mb-2">
                                            <span className="text-4xl font-bold text-white">{overallCompletionRate}%</span>
                                            <div className="flex flex-col text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                                                <span>Global</span>
                                                <span>Rating</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-6">Aggregate across {projects.length} sites</p>
                                        <button className="w-full py-3 bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors">
                                            Generate Report
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
            <div className="flex flex-col gap-6">
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

            <main className="main-content">
                <TopBar
                    breadcrumb={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    userName={currentUser?.name || "User"}
                    userRole={role || "guest"}
                />

                <div className="p-4 md:p-8">
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
