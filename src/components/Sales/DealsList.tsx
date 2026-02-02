import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { DownloadContractButton } from '../PDF';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Copy,
    Check,
    FileText,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

export function DealsList() {
    const { language } = useLanguage();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const deals = useQuery(api.crm.getDeals, statusFilter !== 'all' ? { status: statusFilter } : {});

    // Magic Link Mutations
    const generateToken = useMutation(api.portal.generatePublicAccessToken);
    const disableAccess = useMutation(api.portal.disablePublicAccess);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
    };

    const handleGenerateLink = async (dealId: string) => {
        try {
            const token = await generateToken({ dealId: dealId as Id<"deals"> });
            const link = `${window.location.origin}/view?token=${token}`;
            copyToClipboard(link);
            toast.success(language === 'ar' ? 'تم إنشاء رابط العميل' : 'Client portal link generated');
        } catch (error) {
            toast.error('Failed to generate link');
        }
    };

    const handleDisableLink = async (dealId: string) => {
        try {
            await disableAccess({ dealId: dealId as Id<"deals"> });
            toast.success(language === 'ar' ? 'تم تعطيل الرابط' : 'Link disabled');
        } catch (error) {
            toast.error('Failed to disable link');
        }
    };

    const statusColors: Record<string, string> = {
        draft: '#9CA3AF',
        reserved: '#F59E0B',
        contract_signed: '#3B82F6',
        completed: '#10B981',
        cancelled: '#EF4444',
    };

    const labels = {
        search: { en: 'Search deals...', ar: 'بحث في الصفقات...' },
        unit: { en: 'Unit', ar: 'الوحدة' },
        client: { en: 'Client', ar: 'العميل' },
        price: { en: 'Price', ar: 'السعر' },
        status: { en: 'Status', ar: 'الحالة' },
        date: { en: 'Date', ar: 'التاريخ' },
        actions: { en: 'Actions', ar: 'إجراءات' },
        magicLink: { en: 'Magic Link', ar: 'رابط المشاهدة' },
        copy: { en: 'Copy Link', ar: 'نسخ الرابط' },
        createLink: { en: 'Create Link', ar: 'إنشاء رابط' },
        disable: { en: 'Disable', ar: 'تعطيل' },
        contract: { en: 'Contract', ar: 'العقد' },
        download: { en: 'Download', ar: 'تحميل' },
    };

    const filteredDeals = deals?.filter(deal =>
        (deal.clientName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (deal.unitName?.toLowerCase() || '').includes(search.toLowerCase())
    );

    if (!deals) {
        return <div className="p-8 text-center text-gray-500">Loading deals...</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={labels.search[language as 'en' | 'ar']}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="reserved">Reserved</option>
                        <option value="contract_signed">Contract Signed</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="p-4">{labels.unit[language as 'en' | 'ar']}</th>
                            <th className="p-4">{labels.client[language as 'en' | 'ar']}</th>
                            <th className="p-4">{labels.price[language as 'en' | 'ar']}</th>
                            <th className="p-4">{labels.status[language as 'en' | 'ar']}</th>
                            <th className="p-4">{labels.date[language as 'en' | 'ar']}</th>
                            <th className="p-4">{labels.magicLink[language as 'en' | 'ar']}</th>
                            <th className="p-4 text-center">{labels.actions[language as 'en' | 'ar']}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredDeals?.map((deal) => (
                            <tr key={deal._id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-brand-primary" />
                                        {deal.unitName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{deal.projectName}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{deal.clientName}</div>
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    {formatCurrency(deal.finalPrice)}
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: `${statusColors[deal.status]}20`, color: statusColors[deal.status] }}
                                    >
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {formatDate(deal.createdAt)}
                                </td>
                                <td className="p-4">
                                    {deal.publicAccessEnabled && deal.publicAccessToken ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const link = `${window.location.origin}/view?token=${deal.publicAccessToken}`;
                                                    copyToClipboard(link);
                                                }}
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100"
                                            >
                                                <Copy size={12} />
                                                {labels.copy[language as 'en' | 'ar']}
                                            </button>
                                            <button
                                                onClick={() => window.open(`/view?token=${deal.publicAccessToken}`, '_blank')}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="View"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleGenerateLink(deal._id)}
                                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-brand-primary bg-gray-100 px-2 py-1 rounded border border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
                                        >
                                            {statusColors[deal.status] === '#10B981' || statusColors[deal.status] === '#3B82F6' ? (
                                                <>
                                                    <Eye size={12} />
                                                    {labels.createLink[language as 'en' | 'ar']}
                                                </>
                                            ) : (
                                                <span className="opacity-50 cursor-not-allowed">Not available</span>
                                            )}
                                        </button>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DownloadContractButton dealId={deal._id} variant="icon" />

                                        {/* Toggle Access */}
                                        {deal.publicAccessEnabled && (
                                            <button
                                                onClick={() => handleDisableLink(deal._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                                                title={labels.disable[language as 'en' | 'ar']}
                                            >
                                                <EyeOff size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDeals?.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No deals found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Icon helper since I can't import Lucide directly inside the map sometimes if unused
import { Building2 } from 'lucide-react';
