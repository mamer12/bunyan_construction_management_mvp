import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Building2,
    Banknote,
    Users,
    Package,
    Settings,
    Briefcase,
    ShoppingBag
} from "lucide-react";

interface FloatingMobileNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    allowedMenuIds: string[];
}

const ALL_MOBILE_ITEMS = [
    { id: "dashboard", icon: LayoutDashboard },
    { id: "management", icon: Briefcase },
    { id: "projects", icon: Building2 },
    { id: "sales", icon: ShoppingBag },
    { id: "finance", icon: Banknote },
    { id: "team", icon: Users },
    { id: "stock", icon: Package },
    { id: "settings", icon: Settings },
];

const SCROLL_DOWN_THRESHOLD = 50;
const SCROLL_UP_EXPAND_THRESHOLD = 30;
const SCROLL_TOP_EXPAND = 20;
const MINIMIZED_OFFSET = 48;
const MINIMIZED_SCALE = 0.88;

function getScrollTop(): number {
    const main = document.querySelector(".main-content");
    if (main && main.scrollHeight > main.clientHeight) {
        return (main as HTMLElement).scrollTop;
    }
    return window.scrollY ?? document.documentElement?.scrollTop ?? 0;
}

export function FloatingMobileNav({ activeTab, onTabChange }: FloatingMobileNavProps) {
    const [expanded, setExpanded] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;
            ticking.current = true;
            requestAnimationFrame(() => {
                const y = getScrollTop();
                const delta = y - lastScrollY.current;
                lastScrollY.current = y;

                if (y <= SCROLL_TOP_EXPAND) {
                    setExpanded(true);
                } else if (delta > 0 && y > SCROLL_DOWN_THRESHOLD) {
                    setExpanded(false);
                } else if (delta < 0 && y > SCROLL_UP_EXPAND_THRESHOLD) {
                    setExpanded(true);
                }
                ticking.current = false;
            });
        };

        const main = document.querySelector(".main-content");
        main?.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            main?.removeEventListener("scroll", handleScroll);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className="fixed bottom-5 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none md:hidden"
        >
            <motion.nav
                initial={false}
                animate={{
                    y: expanded ? 0 : MINIMIZED_OFFSET,
                    scale: expanded ? 1 : MINIMIZED_SCALE,
                    opacity: expanded ? 1 : 0.92,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 38,
                    mass: 0.8,
                }}
                style={{
                    pointerEvents: "auto",
                    transformOrigin: "center bottom",
                }}
                className="w-full max-w-[min(calc(100vw-2rem),420px)]"
            >
                <div
                    className="mobile-nav-glass flex items-center justify-center gap-1 py-2 px-2 overflow-x-auto overflow-y-hidden"
                >
                    <style>{` [data-mobile-nav]::-webkit-scrollbar { display: none; } `}</style>
                    <div data-mobile-nav className="flex items-center gap-1 min-w-0">
                        {ALL_MOBILE_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onTabChange(item.id)}
                                    className={`
                                        flex items-center justify-center shrink-0 w-11 h-11 rounded-[20px]
                                        border-0 cursor-pointer
                                        ${isActive
                                            ? "bg-emerald-500 text-white shadow-sm"
                                            : "bg-transparent text-slate-600 hover:bg-black/5 active:bg-black/10"
                                        }
                                    `}
                                    style={{
                                        // Fixed size + radius so no layout morph = no glitch
                                        minWidth: 44,
                                        minHeight: 44,
                                        borderRadius: 20,
                                    }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <item.icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="shrink-0"
                                    />
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>
        </div>
    );
}
