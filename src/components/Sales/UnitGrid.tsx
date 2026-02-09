import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Home,
    Building2,
    Clock,
    DollarSign,
    Maximize2,
    Bed,
    Bath,
    MapPin,
    CheckCircle,
    AlertCircle,
    X,
    Plus,
    Filter,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Types
interface Unit {
    _id: string;
    name: string;
    projectId: string;
    projectName?: string;
    projectLocation?: string;
    status: string;
    salesStatus: string;
    listPrice?: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor?: number;
    features?: string[];
    reservationTimeLeft?: number;
}

// Unit Card Component
function UnitCard({
    unit,
    onClick,
    language
}: {
    unit: Unit;
    onClick: () => void;
    language: string;
}) {
    const [timeLeft, setTimeLeft] = useState(unit.reservationTimeLeft || 0);

    useEffect(() => {
        if (unit.salesStatus !== 'reserved' || !unit.reservationTimeLeft) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [unit.salesStatus, unit.reservationTimeLeft]);

    const formatTimeLeft = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getStatusColor = () => {
        switch (unit.salesStatus) {
            case 'available': return 'var(--success)';
            case 'reserved': return 'var(--warning)';
            case 'sold': return 'var(--danger)';
            default: return 'var(--success)';
        }
    };

    const getStatusLabel = () => {
        const labels: Record<string, Record<string, string>> = {
            available: { en: 'Available', ar: 'متاح' },
            reserved: { en: 'Reserved', ar: 'محجوز' },
            sold: { en: 'Sold', ar: 'مباع' },
        };
        return labels[unit.salesStatus]?.[language] || labels.available[language];
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: `2px solid ${getStatusColor()}40`,
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Status Badge */}
            <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: language === 'ar' ? 'auto' : '0.75rem',
                left: language === 'ar' ? '0.75rem' : 'auto',
                background: getStatusColor(),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
            }}>
                {unit.salesStatus === 'available' && <CheckCircle size={12} />}
                {unit.salesStatus === 'reserved' && <Clock size={12} />}
                {unit.salesStatus === 'sold' && <AlertCircle size={12} />}
                {getStatusLabel()}
            </div>

            {/* Timer for Reserved */}
            {unit.salesStatus === 'reserved' && timeLeft > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: language === 'ar' ? 'auto' : '0.75rem',
                    left: language === 'ar' ? '0.75rem' : 'auto',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'var(--warning)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                }}>
                    ⏱ {formatTimeLeft(timeLeft)}
                </div>
            )}

            {/* Icon/Visual */}
            <div style={{
                height: '80px',
                background: `linear-gradient(135deg, ${getStatusColor()}20, ${getStatusColor()}10)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Home size={32} color={getStatusColor()} />
            </div>

            {/* Content */}
            <div style={{ padding: '1rem' }}>
                <h4 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem',
                }}>
                    {unit.name}
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                }}>
                    <MapPin size={12} />
                    {unit.projectName}
                </p>

                {/* Price */}
                {unit.listPrice && (
                    <div style={{
                        marginTop: '0.75rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--brand-primary)',
                    }}>
                        {formatCurrency(unit.listPrice)} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>IQD</span>
                    </div>
                )}

                {/* Details */}
                <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                }}>
                    {unit.area && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Maximize2 size={12} />
                            {unit.area}m²
                        </span>
                    )}
                    {unit.bedrooms && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bed size={12} />
                            {unit.bedrooms}
                        </span>
                    )}
                    {unit.bathrooms && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bath size={12} />
                            {unit.bathrooms}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Unit Detail Drawer
function UnitDrawer({
    unit,
    onClose,
    onCreateDeal,
    language
}: {
    unit: Unit | null;
    onClose: () => void;
    onCreateDeal: (unitId: string) => void;
    language: string;
}) {
    if (!unit) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const labels = {
        details: { en: 'Unit Details', ar: 'تفاصيل الوحدة' },
        project: { en: 'Project', ar: 'المشروع' },
        location: { en: 'Location', ar: 'الموقع' },
        price: { en: 'List Price', ar: 'السعر' },
        area: { en: 'Area', ar: 'المساحة' },
        bedrooms: { en: 'Bedrooms', ar: 'غرف النوم' },
        bathrooms: { en: 'Bathrooms', ar: 'الحمامات' },
        floor: { en: 'Floor', ar: 'الطابق' },
        features: { en: 'Features', ar: 'المميزات' },
        createDeal: { en: 'Create Deal', ar: 'إنشاء صفقة' },
        notAvailable: { en: 'Not Available', ar: 'غير متاح' },
        reserved: { en: 'Reserved', ar: 'محجوز' },
        sold: { en: 'Sold', ar: 'مباع' },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'flex-end',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ x: language === 'ar' ? -400 : 400 }}
                animate={{ x: 0 }}
                exit={{ x: language === 'ar' ? -400 : 400 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '400px',
                    maxWidth: '100%',
                    background: 'var(--bg-card)',
                    height: '100%',
                    padding: '1.5rem',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {labels.details[language as 'en' | 'ar']}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Unit Icon */}
                <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, var(--brand-primary)20, var(--brand-primary)10)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                }}>
                    <Building2 size={48} color="var(--brand-primary)" />
                </div>

                {/* Unit Name */}
                <h3 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                }}>
                    {unit.name}
                </h3>

                {/* Project & Location */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{
                        margin: '0 0 0.25rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <Building2 size={16} />
                        {unit.projectName}
                    </p>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <MapPin size={16} />
                        {unit.projectLocation || '-'}
                    </p>
                </div>

                {/* Price */}
                {unit.listPrice && (
                    <div style={{
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        color: 'white',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {labels.price[language as 'en' | 'ar']}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            {formatCurrency(unit.listPrice)} IQD
                        </div>
                    </div>
                )}

                {/* Specifications */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    {unit.area && (
                        <div style={{
                            background: 'var(--bg-mint)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.25rem',
                            }}>
                                {labels.area[language as 'en' | 'ar']}
                            </div>
                            <div style={{ fontWeight: 600 }}>{unit.area} m²</div>
                        </div>
                    )}
                    {unit.bedrooms && (
                        <div style={{
                            background: 'var(--bg-mint)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.25rem',
                            }}>
                                {labels.bedrooms[language as 'en' | 'ar']}
                            </div>
                            <div style={{ fontWeight: 600 }}>{unit.bedrooms}</div>
                        </div>
                    )}
                    {unit.bathrooms && (
                        <div style={{
                            background: 'var(--bg-mint)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.25rem',
                            }}>
                                {labels.bathrooms[language as 'en' | 'ar']}
                            </div>
                            <div style={{ fontWeight: 600 }}>{unit.bathrooms}</div>
                        </div>
                    )}
                    {unit.floor && (
                        <div style={{
                            background: 'var(--bg-mint)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.25rem',
                            }}>
                                {labels.floor[language as 'en' | 'ar']}
                            </div>
                            <div style={{ fontWeight: 600 }}>{unit.floor}</div>
                        </div>
                    )}
                </div>

                {/* Features */}
                {unit.features && unit.features.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                        }}>
                            {labels.features[language as 'en' | 'ar']}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {unit.features.map((feature) => (
                                <span
                                    key={feature}
                                    style={{
                                        background: 'var(--border)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={() => unit.salesStatus === 'available' && onCreateDeal(unit._id)}
                    disabled={unit.salesStatus !== 'available'}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: unit.salesStatus === 'available'
                            ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))'
                            : 'var(--border)',
                        color: unit.salesStatus === 'available' ? 'white' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: unit.salesStatus === 'available' ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {unit.salesStatus === 'available' ? (
                        <>
                            <Plus size={20} />
                            {labels.createDeal[language as 'en' | 'ar']}
                        </>
                    ) : (
                        <>
                            <AlertCircle size={20} />
                            {unit.salesStatus === 'reserved'
                                ? labels.reserved[language as 'en' | 'ar']
                                : labels.sold[language as 'en' | 'ar']}
                        </>
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
}

// Main UnitGrid Component
export function UnitGrid({ onCreateDeal }: { onCreateDeal?: (unitId: string) => void }) {
    const { language } = useLanguage();
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedProject, setSelectedProject] = useState<string>('all');

    const units = useQuery(api.unitSales.getUnitsForSales, {}) as Unit[] | undefined;
    const projects = useQuery(api.projects.getProjects, {});
    const releaseExpired = useMutation(api.unitSales.releaseExpiredReservations);

    // Filter units
    const filteredUnits = units?.filter((unit) => {
        const matchesStatus = statusFilter === 'all' || unit.salesStatus === statusFilter;
        const matchesProject = selectedProject === 'all' || unit.projectId === selectedProject;
        return matchesStatus && matchesProject;
    }) || [];

    // Group counts
    const statusCounts = {
        available: units?.filter((u) => u.salesStatus === 'available' || !u.salesStatus).length || 0,
        reserved: units?.filter((u) => u.salesStatus === 'reserved').length || 0,
        sold: units?.filter((u) => u.salesStatus === 'sold').length || 0,
    };

    const handleRefresh = async () => {
        try {
            const result = await releaseExpired({});
            if (result.released > 0) {
                toast.success(
                    language === 'ar'
                        ? `تم تحرير ${result.released} حجوزات منتهية`
                        : `Released ${result.released} expired reservations`
                );
            }
        } catch (error) {
            console.error('Failed to release reservations:', error);
        }
    };

    const labels = {
        title: { en: 'Unit Inventory', ar: 'مخزون الوحدات' },
        all: { en: 'All', ar: 'الكل' },
        available: { en: 'Available', ar: 'متاح' },
        reserved: { en: 'Reserved', ar: 'محجوز' },
        sold: { en: 'Sold', ar: 'مباع' },
        filter: { en: 'Filter by Project', ar: 'تصفية حسب المشروع' },
        allProjects: { en: 'All Projects', ar: 'جميع المشاريع' },
        noUnits: { en: 'No units found', ar: 'لا توجد وحدات' },
        refresh: { en: 'Refresh', ar: 'تحديث' },
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    {labels.title[language as 'en' | 'ar']}
                </h2>
                <button
                    onClick={handleRefresh}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'var(--bg-mint)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                    }}
                >
                    <RefreshCw size={16} />
                    {labels.refresh[language as 'en' | 'ar']}
                </button>
            </div>

            {/* Status Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
            }}>
                {[
                    { key: 'all', label: labels.all, count: units?.length || 0 },
                    { key: 'available', label: labels.available, count: statusCounts.available, color: 'var(--success)' },
                    { key: 'reserved', label: labels.reserved, count: statusCounts.reserved, color: 'var(--warning)' },
                    { key: 'sold', label: labels.sold, count: statusCounts.sold, color: 'var(--danger)' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: statusFilter === tab.key
                                ? (tab.color || 'var(--brand-primary)')
                                : 'var(--bg-card)',
                            color: statusFilter === tab.key ? 'white' : 'var(--text-primary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            boxShadow: statusFilter === tab.key ? 'var(--shadow-md)' : 'none',
                        }}
                    >
                        {tab.label[language as 'en' | 'ar']}
                        <span style={{
                            background: statusFilter === tab.key
                                ? 'rgba(255,255,255,0.3)'
                                : 'var(--border)',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Project Filter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
            }}>
                <Filter size={16} color="var(--text-muted)" />
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    <option value="all">{labels.allProjects[language as 'en' | 'ar']}</option>
                    {projects?.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Unit Grid */}
            {filteredUnits.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)',
                }}>
                    <Home size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>{labels.noUnits[language as 'en' | 'ar']}</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '1rem',
                }}>
                    {filteredUnits.map((unit) => (
                        <UnitCard
                            key={unit._id}
                            unit={unit}
                            onClick={() => setSelectedUnit(unit)}
                            language={language}
                        />
                    ))}
                </div>
            )}

            {/* Unit Detail Drawer */}
            <AnimatePresence>
                {selectedUnit && (
                    <UnitDrawer
                        unit={selectedUnit}
                        onClose={() => setSelectedUnit(null)}
                        onCreateDeal={(unitId) => {
                            setSelectedUnit(null);
                            onCreateDeal?.(unitId);
                        }}
                        language={language}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
