import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { FileText, FileCheck, Receipt, Link2, Copy, Check, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PDFDownloadButton } from './PDF';

interface DealDocumentsProps {
    dealId: Id<"deals">;
    unitName: string;
    clientName: string;
}

export function DealDocuments({ dealId, unitName, clientName }: DealDocumentsProps) {
    const { language } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [magicLink, setMagicLink] = useState<string | null>(null);
    
    const generateToken = useMutation(api.portal.generatePublicAccessToken);
    const disableAccess = useMutation(api.portal.disablePublicAccess);

    const handleGenerateMagicLink = async () => {
        try {
            const token = await generateToken({ dealId });
            const link = `${window.location.origin}/portal/${token}`;
            setMagicLink(link);
        } catch (error) {
            console.error('Failed to generate magic link:', error);
            alert(language === 'ar' ? 'فشل في إنشاء الرابط' : 'Failed to generate link');
        }
    };

    const handleCopyLink = async () => {
        if (magicLink) {
            await navigator.clipboard.writeText(magicLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisableLink = async () => {
        if (window.confirm(language === 'ar' ? 'هل تريد تعطيل الرابط العام؟' : 'Disable public link?')) {
            try {
                await disableAccess({ dealId });
                setMagicLink(null);
            } catch (error) {
                console.error('Failed to disable access:', error);
            }
        }
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border)',
        }}>
            <h3 style={{
                margin: '0 0 1.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
            }}>
                {language === 'ar' ? 'المستندات والروابط' : 'Documents & Links'}
            </h3>

            {/* PDF Documents */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                <PDFDownloadButton
                    dealId={dealId}
                    type="invoice"
                    icon={FileText}
                    label={language === 'ar' ? 'الفاتورة' : 'Invoice'}
                />
                <PDFDownloadButton
                    dealId={dealId}
                    type="contract"
                    icon={FileCheck}
                    label={language === 'ar' ? 'العقد' : 'Contract'}
                />
                <PDFDownloadButton
                    dealId={dealId}
                    type="receipt"
                    icon={Receipt}
                    label={language === 'ar' ? 'الإيصال' : 'Receipt'}
                />
            </div>

            {/* Magic Link Section */}
            <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1.5rem',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <Link2 size={18} />
                        <span style={{ fontWeight: 500 }}>
                            {language === 'ar' ? 'رابط عام للعميل' : 'Public Client Link'}
                        </span>
                    </div>
                    {!magicLink && (
                        <button
                            onClick={handleGenerateMagicLink}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--brand-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            {language === 'ar' ? 'إنشاء رابط' : 'Generate Link'}
                        </button>
                    )}
                </div>

                {magicLink && (
                    <div style={{
                        background: 'var(--bg-mint)',
                        border: '1px solid var(--border-emerald)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.75rem',
                        }}>
                            <input
                                type="text"
                                value={magicLink}
                                readOnly
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'white',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace',
                                }}
                            />
                            <button
                                onClick={handleCopyLink}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: copied ? 'var(--success)' : 'var(--brand-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied
                                    ? (language === 'ar' ? 'تم النسخ' : 'Copied')
                                    : (language === 'ar' ? 'نسخ' : 'Copy')
                                }
                            </button>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                {language === 'ar'
                                    ? 'شارك هذا الرابط مع العميل لعرض تفاصيل الصفقة'
                                    : 'Share this link with the client to view deal details'
                                }
                            </div>
                            <button
                                onClick={handleDisableLink}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'transparent',
                                    color: 'var(--danger)',
                                    border: '1px solid var(--danger)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                }}
                            >
                                {language === 'ar' ? 'تعطيل' : 'Disable'}
                            </button>
                        </div>
                    </div>
                )}

                {!magicLink && (
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}>
                        {language === 'ar'
                            ? 'إنشاء رابط آمن يمكن مشاركته مع العميل لعرض معلومات الصفقة والمستندات'
                            : 'Generate a secure link to share with the client for viewing deal information and documents'
                        }
                    </p>
                )}
            </div>
        </div>
    );
}
