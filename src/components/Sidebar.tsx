import {
    LayoutDashboard,
    Building2,
    Banknote,
    Users,
    Settings,
    LogOut,
    Menu
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen?: boolean;
}

import { useLanguage } from "../contexts/LanguageContext";

export function Sidebar({ activeTab, onTabChange, isOpen = true, onClose }: SidebarProps & { onClose?: () => void }) {
    const { signOut } = useAuthActions();
    const { t } = useLanguage();

    const menuItems = [
        { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { id: "projects", label: t("projects"), icon: Building2 },
        { id: "finance", label: t("finance"), icon: Banknote },
        { id: "team", label: t("team"), icon: Users },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'block' : 'hidden'}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div style={{ padding: "2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            background: "var(--brand-accent)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.25rem"
                        }}>
                            B
                        </div>
                        <div>
                            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", lineHeight: 1 }}>Bunyan</h1>
                            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Enterprise</span>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "1rem 0" }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                if (window.innerWidth < 768) onClose?.();
                            }}
                            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", borderLeft: activeTab === item.id ? "3px solid var(--brand-accent)" : "3px solid transparent" }}
                        >
                            <item.icon size={22} />
                            <span style={{ fontSize: "1rem" }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <button
                        className="sidebar-link"
                        onClick={() => void signOut()}
                        style={{ paddingLeft: 0, color: "#EF4444" }}
                    >
                        <LogOut size={20} />
                        <span>{t("signOut")}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
