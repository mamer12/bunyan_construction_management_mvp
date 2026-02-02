import React, { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Clock,
    Home,
    MapPin,
    Calendar,
    CreditCard,
    Download,
    Phone,
    Share2
} from 'lucide-react';
import { toast } from 'sonner';

// Simplified format currency for public view
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(amount) + ' IQD';
};

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export function PublicDealViewer() {
    // In a real router, we'd use useParams(). simple hack for now:
    // assumes url is like /view?token=xyz
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        if (t) setToken(t);
    }, []);

    const data = useQuery(api.portal.getPublicDealView, token ? { token } : "skip");

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h1>
                    <p className="text-gray-500">Please check the URL and try again.</p>
                </div>
            </div>
        );
    }

    if (data === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (data === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg">
                    <Home size={48} className="mx-auto text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-500">This link may have expired or public access has been disabled.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="ltr">
            {/* HEROBANNER */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-bold text-lg text-gray-800">Bunyan</span>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied!");
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Share"
                    >
                        <Share2 size={20} className="text-gray-600" />
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* WELCOME CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-2">
                                {data.projectName}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {data.unitName}
                            </h1>
                            <div className="flex items-center text-gray-500 text-sm gap-4">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {data.projectLocation}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Home size={14} />
                                    {data.area} m²
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Welcome Home,</p>
                            <p className="font-bold text-xl text-brand-primary">{data.buyerName}</p>
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Construction Progress</span>
                            <span className="font-bold text-brand-primary">{data.progressPercentage}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progressPercentage}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* TIMELINE (CONSTRUCTION) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Clock className="text-brand-primary" size={20} />
                        Timeline
                    </h2>

                    <div className="space-y-6 relative pl-2">
                        {/* Vertical line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 -z-0" />

                        {data.milestones.map((milestone: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-4 relative z-10"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 
                                    ${milestone.isComplete ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {milestone.isComplete ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-semibold ${milestone.isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {milestone.title}
                                        </h3>
                                        {milestone.isComplete && milestone.completedAt && (
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                {formatDate(milestone.completedAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 capitalize">{milestone.type} Phase</p>

                                    {/* Proof Photo if available */}
                                    {milestone.proofPhotoId && (
                                        <ImagePreview
                                            token={token}
                                            storageId={milestone.proofPhotoId}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FINANCIALS */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <CreditCard className="text-brand-primary" size={20} />
                        Financial Status
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-xl">
                            <p className="text-xs text-green-600 font-medium mb-1">Total Paid</p>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(data.totalPaid)}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <p className="text-xs text-orange-600 font-medium mb-1">Remaining</p>
                            <p className="text-xl font-bold text-orange-700">{formatCurrency(data.remaining)}</p>
                        </div>
                    </div>

                    {data.nextInstallment && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Next Payment Due</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Installment #{data.nextInstallment.installmentNumber}
                                    {data.nextInstallment.milestoneType && ` • ${data.nextInstallment.milestoneType} milestone`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-blue-900">{formatCurrency(data.nextInstallment.amount)}</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                    {formatDate(data.nextInstallment.dueDate)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTACT */}
                <div className="text-center py-6 text-gray-500 text-sm">
                    <p className="mb-2">Questions? Contact Sales Support</p>
                    <a href="tel:+96400000000" className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow text-brand-primary font-medium">
                        <Phone size={16} />
                        Call Support
                    </a>
                </div>

            </main>
        </div>
    );
}

function ImagePreview({ token, storageId }: { token: string, storageId: string }) {
    // This assumes we have an API to get the URL securely
    // For now we'll skip because we need the storage URL
    // In a real app we'd use useQuery(api.portal.getPublicProofPhotoUrl, { token, storageId })
    const url = useQuery(api.portal.getPublicProofPhotoUrl, { token, storageId: storageId as any });

    if (!url) return null;

    return (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
            <img src={url} alt="Proof of work" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
        </div>
    );
}
