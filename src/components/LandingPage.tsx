import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import {
    Globe,
    Building2,
    HardHat,
    ClipboardList,
    Plus,
    Minus,
    Check
} from "lucide-react";

import { Sparkles as SparklesComp } from "./ui/sparkles";
import { TimelineContent } from "./ui/timeline-animation";
import { VerticalCutReveal } from "./ui/vertical-cut-reveal";

const translations = {
    en: {
        ecosystem: "Ecosystem",
        features: "Features",
        pricing: "Pricing",
        logIn: "Log In",
        trial: "Start 10-Day Trial",
        pill: "The Blueprint of Innovation",
        headline: "The Complete Operating System for Real Estate Development",
        subheadline: "Precision-engineered for modern developers. From initial architectural drafting to final client handover, manage your entire real estate ecosystem on a single, unified platform.",
        bookDemo: "Book a Demo",
        status: "Status",
        salesMetrics: "Unit Sales: 84%",
        trilogyTitle: "The Trilogy Ecosystem",
        trilogyDesc: "One unified source of truth across three distinct dimensions of development.",
        bunyanTitle: "Bunyan",
        bunyanHeading: "Developer Control Center",
        bunyanDesc: "The core engine. Unified CRM, Financial Wallets, and Granular Project Control for leadership teams.",
        crm: "CRM",
        leadsFlow: "Leads Flow",
        fin: "Fin",
        automated: "Automated",
        kpi: "KPI",
        realTime: "Real-time",
        mukawilTitle: "Mukawil",
        mukawilDesc: "Real-time task execution and photo proofing directly from the field.",
        fieldUpload: "Field Upload",
        dalalTitle: "Dalal",
        dalalDesc: "Transparency for buyers. Track unit status and payment timelines instantly.",
        installment04: "Instalment #04",
        paid: "PAID",
        installment05: "Instalment #05",
        pending: "PENDING",
        financialsTitle: "Automated Financials",
        financialsDesc: "Manage multi-entity wallets and transaction flow without manual entry. Our engine synchronizes every payment with your general ledger.",
        reconciliation: "Instant Reconciliation",
        multiCurrency: "Multi-Currency Wallets",
        mainEscrow: "Main Escrow",
        usdReserves: "USD Reserves",
        featureLabel: "Engineered for Scale",
        featureHeading: "Technical Mastery at Every Corner",
        f1Title: "Dynamic Sales CRM",
        f1Desc: "Turn window shoppers into unit owners. Our lead-to-deal pipeline tracks interactions, contracts, and reservation status automatically.",
        f2Title: "Smart Inventory",
        f2Desc: "Real-time stock flow of materials and unit availability. Integrated with your supply chain to prevent project bottlenecks.",
        f3Title: "Predictive Analytics",
        f3Desc: "Forecast delivery timelines and cashflow gaps before they happen using our AI-driven architectural forecasting model.",
        tailored: "Tailored to Your Ambition",
        priceDesc: "Scalable pricing for developers of all sizes.",
        pricingAsas: "Al-Asas",
        foundation: "Foundation",
        asasPrice: "99k",
        iqdMo: "IQD / mo",
        asasItems: ["Single Project Support", "Basic CRM & Inventory", "5 Team Members"],
        chooseFoundation: "Choose Foundation",
        pricingBunyan: "Al-Bunyan",
        structure: "Structure",
        bunyanPrice: "249k",
        bunyanItems: ["Unlimited Projects", "Full Trilogy Ecosystem", "25 Team Members", "Financial Engine Access"],
        upgradeStructure: "Upgrade to Structure",
        recommended: "Most Popular",
        pricingMadina: "Al-Madina",
        city: "City",
        custom: "Custom",
        madinaItems: ["Enterprise Site Control", "Dedicated Account Manager", "Custom API Integrations", "White-label Option"],
        contactSales: "Contact Sales",
        ready: "Ready to Build Your Future?",
        leadDesc: "Join 50+ developers transforming the skyline of Baghdad, Erbil, and Basra with Bunyan's architectural OS.",
        trusted: "Trusted by leading firms",
        companyName: "Company Name",
        businessEmail: "Business Email",
        earlyAccess: "Request Early Access",
        rights: "© 2024 Bunyan Architectural Systems. All rights reserved."
    },
    ar: {
        ecosystem: "النظام الشامل",
        features: "الميزات",
        pricing: "الأسعار",
        logIn: "تسجيل الدخول",
        trial: "ابدأ تجربة لمدة 10 أيام",
        pill: "مخطط الابتكار المعماري",
        headline: "نظام التشغيل الكامل لتطوير العقارات",
        subheadline: "مصمم بدقة للمطورين المعاصرين. من المخطط الأولي إلى التسليم النهائي، أدر بيئتك العقارية بالكامل عبر منصة موحدة.",
        bookDemo: "احجز ديمو",
        status: "الحالة",
        salesMetrics: "مبيعات الوحدات: 84%",
        trilogyTitle: "نظام الثلاثي الرقمي الشامل",
        trilogyDesc: "مصدر واحد وموحد للمعلومات عبر ثلاثة أبعاد متميزة للتطوير.",
        bunyanTitle: "بنيان",
        bunyanHeading: "مركز تحكم المطور",
        bunyanDesc: "المحرك الأساسي. إدارة علاقات موحدة، محافظ مالية، وتحكم دقيق بالمشاريع لإدارة القيادة.",
        crm: "العملاء",
        leadsFlow: "تدفق العملاء",
        fin: "المالية",
        automated: "مؤتمتة",
        kpi: "الأداء",
        realTime: "فوري / حي",
        mukawilTitle: "مقاول",
        mukawilDesc: "تنفيذ المهام ورفع إثباتات الصور في الوقت الحقيقي مباشرة من الميدان والموقع.",
        fieldUpload: "رفع ميداني",
        dalalTitle: "دلال",
        dalalDesc: "شفافية مطلقة للمشترين. تتبع حالة الوحدات وجداول الأقساط الزمنية فوراً وبسهولة.",
        installment04: "القسط رقم #04",
        paid: "مدفوع",
        installment05: "القسط رقم #05",
        pending: "قيد الانتظار",
        financialsTitle: "المالية المؤتمتة",
        financialsDesc: "أدر المحافظ المالية المتعددة وتدفق المعاملات دون إدخال يدوي. يقوم محركنا بمزامنة الدفعات.",
        reconciliation: "مطابقة رصيد فورية",
        multiCurrency: "محافظ متعددة العملات",
        mainEscrow: "حساب الضمان الرئيسي",
        usdReserves: "احتياطيات الدولار",
        featureLabel: "مصمم لرفع الكفاءة والمقاييس",
        featureHeading: "إتقان فني في كل زاوية ونظام",
        f1Title: "إدارة مبيعات ديناميكية (CRM)",
        f1Desc: "حول المتصفحين إلى ملاك وحدات. يتتبع النظام الاتفاقيات، العقود، وحالة الحجز دورياً.",
        f2Title: "مخزون ذكي",
        f2Desc: "تدفق مخزون المواد وتوفر الوحدات لحظياً. مركب مع سلاسل المورين لمنع الاختناقات.",
        f3Title: "تحليلات تنبؤية",
        f3Desc: "توقع جداول التسليم والمشكلات النقدية قبل حدوثها بنظام الذكاء الاصطناعي الخاص بالمعايرة.",
        tailored: "مصمم بحجم طموحك",
        priceDesc: "أسعار مرنة لمطوري العقارات بجميع أحجامهم ومشاريعهم.",
        pricingAsas: "الأساس",
        foundation: "Foundation",
        asasPrice: "99 ألف",
        iqdMo: "دينار / شهرياً",
        asasItems: ["دعم مشروع واحد", "إدارة عملاء ومخزون أساسية", "5 أعضاء فريق مدمجين"],
        chooseFoundation: "اختر الأساس",
        pricingBunyan: "البنيان",
        structure: "Structure",
        bunyanPrice: "249 ألف",
        bunyanItems: ["مشاريع غير محدودة", "دعم كامل لنظام الثلاثي", "25 مستخدماً مدرجاً", "إدارة البوابة المالية المدمجة"],
        upgradeStructure: "الترقية إلى البنيان",
        recommended: "الأكثر شعبية",
        pricingMadina: "المدينة",
        city: "City",
        custom: "مخصص",
        madinaItems: ["تحكم شامل للمنظمات الكبرى", "مدير حساب مخصص لكم مسبقاً", "واجهات برمجة API مخصصة", "خيار الوايت-ليبل (تخصيص كامل)"],
        contactSales: "اتصل بالمبيعات",
        ready: "جاهز لبناء مستقبلك الرقمي؟",
        leadDesc: "انضم لأكثر من 50 مطوراً يحولون الأفق المعماري لبغداد، أربيل، والبصرة بنظام بنيان.",
        trusted: "موثوق من قبل الشركات الرائدة",
        companyName: "اسم الشركة / المنظمة",
        businessEmail: "البريد الإلكتروني للعمل",
        earlyAccess: "طلب وصول مبكر",
        rights: "© 2024 أنظمة بنيان المعمارية. جميع الحقوق محفوظة."
    }
};

export default function LandingPage() {
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const t = translations[language as "en" | "ar"] || translations.en;
    const isRtl = language === "ar";
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const user = useQuery(api.auth.loggedInUser);
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    return (
        <div className="bg-surface text-on-surface overflow-x-clip" style={{ fontFamily: isRtl ? 'Cairo, sans-serif' : 'Inter, sans-serif' }} dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* TopNavBar Component */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-transparent">
                <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-slate-900">Bunyan</div>
                    
                    <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight">
                        <a className="text-emerald-700 font-bold border-b-2 border-emerald-600 transition-colors duration-200" href="#ecosystem">{t.ecosystem}</a>
                        <a className="text-slate-600 hover:text-emerald-600 transition-colors duration-200" href="#features">{t.features}</a>
                        <a className="text-slate-600 hover:text-emerald-600 transition-colors duration-200" href="#pricing">{t.pricing}</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="text-slate-600 flex items-center gap-1 text-sm font-bold hover:text-emerald-600 transition-colors"
                        >
                            <Globe className="h-4 w-4" />
                            {language === 'en' ? 'عربي' : 'EN'}
                        </button>
                        <button onClick={() => navigate('/login')} className="text-slate-600 font-medium text-sm hover:text-emerald-600 transition-colors">{t.logIn}</button>
                        <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-[#006948] to-[#00855d] text-white px-5 py-2.5 rounded-xl text-sm font-bold scale-95 hover:scale-100 transition-transform duration-150 ease-in-out">
                            {t.trial}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                {/* Hero Section */}
                <section id="features" className="relative px-8 py-20 lg:py-32 max-w-7xl mx-auto overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="z-10 text-center lg:text-start"
                        >
                            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[#c0edd3] text-[#264e3c] rounded-full">
                                {t.pill}
                            </span>
                            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-[1.1] mb-8">
                                {t.headline.split("Real Estate").map((part, index) => (
                                    index === 1 ? <><span className="text-[#006948]" key={index}>Real Estate</span>{part}</> : part
                                ))}
                            </h1>
                            <p className="text-lg text-[#3d4a42] max-w-xl mb-10 mx-auto lg:mx-0 leading-relaxed font-medium">
                                {t.subheadline}
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-[#006948] to-[#00855d] text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-[#006948]/10 transition-transform hover:-translate-y-1">
                                    {t.trial}
                                </button>
                                <button className="bg-[#e2e7ff] text-[#006c4a] px-8 py-4 rounded-xl font-bold transition-colors hover:bg-[#dae2fd]">
                                    {t.bookDemo}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative group flex justify-center"
                        >
                            <div className="relative z-10 bg-white/40 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/20 transform rotate-1 group-hover:rotate-0 transition-transform duration-500 max-w-lg">
                                <img className="rounded-2xl w-full h-[450px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnqLcs2BePyr7cZ6nxg-U06pblU1-7zeEyjxCcxgiDgAiVvky9wxblwWdzfJvSMOVIAV0Scj0s5Skm993esdAygG2nA_xEjZym2UGe1-IOarKPnCabyMcvqr7wrIVuO8d0_9dpdTUMiVEU9CN7obl3LGGNq_uZn8sf1k61MsPyQUTIIyxRBh_J3cNIbCmtvZyAaEvnwuWpGlUgmKYLc6fhFSwiQK5gXam0jVVn2GoIlfrxpABUzgFG4JXZkwoNGtngq0cn7_oJH8p9" alt="Mockup" />
                                
                                <div className={`absolute -top-6 ${isRtl ? '-left-6' : '-right-6'} bg-white p-4 rounded-2xl shadow-xl w-48 border border-outline-variant/10`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.status}</span>
                                    </div>
                                    <div className="text-sm font-bold text-on-surface">{t.salesMetrics}</div>
                                    <div className="w-full bg-[#f2f3ff] h-1.5 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-[#006948] h-full w-[84%]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-emerald-500/5 -translate-x-12 translate-y-12 rounded-[4rem] -z-10 blur-3xl"></div>
                        </motion.div>
                    </div>
                </section>

                {/* Trilogy Ecosystem (Bento Grid) */}
                <section id="ecosystem" className="py-24 bg-[#f2f3ff]">
                    <div className="max-w-7xl mx-auto px-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 text-center md:text-start"
                        >
                            <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4">{t.trilogyTitle}</h2>
                            <p className="text-[#3d4a42] max-w-2xl font-medium">{t.trilogyDesc}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Bunyan: Developer Dashboard */}
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="md:col-span-2 bg-white rounded-3xl p-10 shadow-xl border border-slate-100 relative overflow-hidden group flex flex-col justify-between"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006948]">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold">{t.bunyanTitle}</h3>
                                    </div>
                                    <h4 className="text-xl font-black mb-4 text-[#006c4a]">{t.bunyanHeading}</h4>
                                    <p className="text-[#3d4a42] mb-8 max-w-md font-medium text-sm leading-relaxed">{t.bunyanDesc}</p>
                                </div>

                                <div className="mt-auto grid grid-cols-3 gap-4 relative z-10">
                                    <div className="p-4 bg-[#faf8ff] rounded-2xl border border-slate-50">
                                        <span className="block text-xs uppercase tracking-widest text-slate-400 mb-1">{t.crm}</span>
                                        <span className="font-bold text-on-surface text-sm">{t.leadsFlow}</span>
                                    </div>
                                    <div className="p-4 bg-[#faf8ff] rounded-2xl border border-slate-50">
                                        <span className="block text-xs uppercase tracking-widest text-slate-400 mb-1">{t.fin}</span>
                                        <span className="font-bold text-on-surface text-sm">{t.automated}</span>
                                    </div>
                                    <div className="p-4 bg-[#faf8ff] rounded-2xl border border-slate-50">
                                        <span className="block text-xs uppercase tracking-widest text-slate-400 mb-1">{t.kpi}</span>
                                        <span className="font-bold text-on-surface text-sm">{t.realTime}</span>
                                    </div>
                                </div>

                                <img className="absolute top-0 right-0 w-1/3 h-full object-cover opacity-5 group-hover:opacity-10 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkruuPzdBN3LmXjErSnTaAJGjDppRDpcF7CWzf0Fqg7N9182iQbjC2IxfBX5WB3WDRhaI0GBUwjpvPg0SDl6oySo_ufDFWLrWcns1uorrmoD4puo--duwiCsozmbxU76IJH7t1C4Ox5uSBGVrSDnEHIgi114su-uWEejm3xaQb5r3tEQYRvYQ0TzSLo9N7kFGAS6Lk8-Mt4QIKWFKyzhMarVSKUzodQXHTHXghBaXS16Dq6ckE4KC_U0iajPRgTZCHBFwY7XExYoZe" alt="analytics background" />
                            </motion.div>

                            {/* Mukawil: Contractor App */}
                            <motion.div 
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: 0.25 }}
                                className="bg-[#006948] p-10 rounded-3xl relative overflow-hidden text-white flex flex-col justify-between group"
                            >
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-8">
                                        <HardHat className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{t.mukawilTitle}</h3>
                                    <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">{t.mukawilDesc}</p>
                                </div>
                                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.fieldUpload}</span>
                                    </div>
                                    <div className="w-full h-32 bg-white/20 rounded-lg animate-pulse"></div>
                                </div>
                            </motion.div>

                            {/* Dalal: Client App */}
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="bg-[#dae2fd] p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden group"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/10 flex items-center justify-center text-slate-800 mb-8">
                                        <ClipboardList className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-slate-900">{t.dalalTitle}</h3>
                                    <p className="text-[#3d4a42] text-sm leading-relaxed mb-6 font-medium">{t.dalalDesc}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                                        <span className="text-xs font-bold text-slate-800">{t.installment04}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">{t.paid}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl flex items-center justify-between opacity-60 shadow-sm">
                                        <span className="text-xs font-bold text-slate-800">{t.installment05}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">{t.pending}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Core Features */}
                <section className="py-24 max-w-7xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <span className="text-[#006c4a] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
                            {t.featureLabel}
                        </span>
                        <h2 className="text-4xl font-black tracking-tight">{t.featureHeading}</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: t.f1Title, desc: t.f1Desc, icon: "account_tree" },
                            { title: t.f2Title, desc: t.f2Desc, icon: "inventory_2" },
                            { title: t.f3Title, desc: t.f3Desc, icon: "query_stats" }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="group text-center md:text-start"
                            >
                                <div className="w-14 h-14 bg-[#f2f3ff] rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6 group-hover:bg-[#006948] group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-extrabold mb-3">{item.title}</h3>
                                <p className="text-[#3d4a42] text-sm leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-[#faf8ff] relative overflow-hidden">
                    <TimelineContent
                        animationNum={4}
                        customVariants={{
                            visible: { opacity: 1 },
                            hidden: { opacity: 0 }
                        }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <SparklesComp
                            density={1200}
                            direction="bottom"
                            speed={0.5}
                            color="#006948"
                            opacity={0.15}
                            className="absolute inset-0"
                        />
                    </TimelineContent>

                    <div className="max-w-7xl mx-auto px-8 relative z-10 border border-transparent">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black mb-2 flex justify-center">
                                <VerticalCutReveal
                                    splitBy="words"
                                    staggerDuration={0.15}
                                    staggerFrom="first"
                                    reverse={true}
                                    containerClassName="justify-center"
                                >
                                    {t.tailored}
                                </VerticalCutReveal>
                            </h2>
                            <p className="text-slate-500 font-medium">{t.priceDesc}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Basic */}
                            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t.pricingAsas}</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">{t.foundation}</p>
                                    <div className="mb-8">
                                        <span className="text-4xl font-black text-slate-800">{t.asasPrice}</span>
                                        <span className="text-slate-400 font-medium text-sm ml-1">{t.iqdMo}</span>
                                    </div>
                                    <ul className="space-y-4 mb-10 text-sm font-medium text-slate-600">
                                        {(t.asasItems as string[]).map((itm, i) => (
                                            <li key={i} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#006948]" /> {itm}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button className="w-full bg-[#f2f3ff] text-[#006c4a] font-bold rounded-xl hover:bg-[#e2e7ff]">{t.chooseFoundation}</Button>
                            </motion.div>

                            {/* Most Popular */}
                            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.25 }} className="bg-white rounded-[2rem] p-10 border-2 border-[#006948] relative flex flex-col justify-between shadow-2xl shadow-[#006948]/5">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#006948] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    {t.recommended}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t.pricingBunyan}</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">{t.structure}</p>
                                    <div className="mb-8">
                                        <span className="text-4xl font-black text-[#006948]">{t.bunyanPrice}</span>
                                        <span className="text-slate-400 font-medium text-sm ml-1">{t.iqdMo}</span>
                                    </div>
                                    <ul className="space-y-4 mb-10 text-sm font-medium text-slate-600">
                                        {(t.bunyanItems as string[]).map((itm, i) => (
                                            <li key={i} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#006c4a]" /> {itm}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button className="w-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-bold rounded-xl shadow-md">{t.upgradeStructure}</Button>
                            </motion.div>

                            {/* Enterprise */}
                            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t.pricingMadina}</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">{t.city}</p>
                                    <div className="mb-8"><span className="text-4xl font-black text-slate-800">{t.custom}</span></div>
                                    <ul className="space-y-4 mb-10 text-sm font-medium text-slate-600">
                                        {(t.madinaItems as string[]).map((itm, i) => (
                                            <li key={i} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#006948]" /> {itm}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button variant="outline" className="w-full bg-[#f2f3ff] border-0 text-[#006c4a] font-bold rounded-xl hover:bg-[#e2e7ff]">{t.contactSales}</Button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Lead Capture */}
                <section id="contact" className="relative py-24 px-8">
                    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 opacity-40">
                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeus3iRFjaZMFJDaMcEBngN_Z5RTeZRUvsdFZ8LpWbdfLjfv_xo0ZpqtsbsVjf9xGJi5nKFG4pyF6hSwj6AAUHPJ5hoC_gAtMPlqIKG00xavRIyq06LTzrXj5yltkNawUYwEBsb4tkQGivmnxc6OKUtPMBw-KLiRTqicIK5mSXU5KB6VSswqMWwNzOZBCtsOpiitcJAniKtOjoj2xumtV9ev0B32DQDk_FLQylGtuPI8YT-eeGA_waE96TsxgxCbWprO4qYAyI0T8l" alt="background" />
                        </div>
                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-12 lg:p-20 items-center">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 leading-tight">{t.ready}</h2>
                                <p className="text-slate-300 text-base leading-relaxed mb-8">{t.leadDesc}</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-white text-sm font-bold bg-white/10 px-4 py-2 rounded-full border border-white/10">{t.trusted}</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20">
                                <form className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">{t.companyName}</label>
                                        <input type="text" className="w-full bg-white/5 border-b-2 border-white/20 text-white focus:border-emerald-500 focus:outline-none focus:ring-0 px-3 py-2 text-sm" placeholder="Skyline Dev Corp" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">{t.businessEmail}</label>
                                        <input type="email" className="w-full bg-white/5 border-b-2 border-white/20 text-white focus:border-emerald-500 focus:outline-none focus:ring-0 px-3 py-2 text-sm" placeholder="ceo@company.com" />
                                    </div>
                                    <Button className="w-full py-4 bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-extrabold rounded-xl transition-transform active:scale-95">
                                        {t.earlyAccess}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full py-12 px-8 bg-slate-50 border-t border-transparent">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                    <div className="text-lg font-bold text-slate-900">Bunyan</div>
                    <div className="text-slate-500 text-[10px] tracking-widest uppercase font-semibold">
                        {t.rights}
                    </div>
                </div>
            </footer>
        </div>
    );
}
