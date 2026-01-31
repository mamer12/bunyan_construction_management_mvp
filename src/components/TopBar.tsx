import { Bell, Search, Globe, ChevronRight, Menu } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function TopBar({ breadcrumb = "Dashboard", onToggleSidebar }: { breadcrumb?: string; onToggleSidebar?: () => void }) {
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <header style={{
            height: 72,
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            position: "sticky",
            top: 0,
            zIndex: 10
        }}>
            {/* Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
                {onToggleSidebar && (
                    <button onClick={onToggleSidebar} className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", marginRight: 8 }}>
                        <Menu size={24} color="var(--text-primary)" />
                    </button>
                )}
                <span className="hidden md:inline" style={{ fontWeight: 500 }}>Bunyan</span>
                <ChevronRight size={16} className="hidden md:block rtl:rotate-180" />
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{breadcrumb}</span>
            </div>

            {/* Right Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: language === 'en' ? 12 : 'auto', right: language === 'ar' ? 12 : 'auto', top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        style={{
                            padding: language === 'en' ? "0.5rem 1rem 0.5rem 2.5rem" : "0.5rem 2.5rem 0.5rem 1rem",
                            borderRadius: "20px",
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: "0.875rem",
                            outline: "none",
                            width: 200
                        }}
                    />
                </div>

                {/* Icons */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        onClick={toggleLanguage}
                        style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                        <Globe size={20} />
                        <span className="text-xs font-bold">{language === 'en' ? 'EN' : 'GL'}</span>
                    </button>
                    <div style={{ position: "relative" }}>
                        <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                            <Bell size={20} />
                        </button>
                        <span style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            background: "var(--danger)",
                            borderRadius: "50%"
                        }} />
                    </div>
                </div>

                {/* Profile */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 16, borderLeft: "1px solid var(--border)" }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>Ahmed Al-Rahim</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Lead Engineer</div>
                    </div>
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
                        alt="Profile"
                        style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid white", boxShadow: "var(--shadow-sm)" }}
                    />
                </div>
            </div>
        </header>
    );
}
