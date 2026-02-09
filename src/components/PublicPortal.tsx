import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Building2, Home, DollarSign, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { PDFDownloadButton } from './PDF';

export function PublicPortal() {
    // Extract token from URL - could be ?token=xyz or window.location.pathname
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || window.location.pathname.split('/').pop() || "";
    
    const data = useQuery(api.portal.getPublicDealView, { token });

    if (data === undefined) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '1.25rem',
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '400px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        color: '#ef4444',
                        fontSize: '3rem',
                        marginBottom: '1rem',
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>Invalid Link</h2>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                        This link is invalid or has expired. Please contact your sales representative.
                    </p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IQ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const paidInstallments = data.installmentSchedule.filter((i) => i.status === 'paid').length;
    const totalInstallments = data.installmentSchedule.length;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem 1rem',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Building2 size={32} color="white" />
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: '1.875rem',
                                fontWeight: 700,
                                color: '#1f2937',
                            }}>
                                {data.projectName}
                            </h1>
                            <p style={{
                                margin: '0.25rem 0 0',
                                color: '#6b7280',
                            }}>
                                {data.projectLocation}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                marginBottom: '0.5rem',
                            }}>
                                Client Name
                            </div>
                            <div style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#1f2937',
                            }}>
                                {data.buyerName}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                marginBottom: '0.5rem',
                            }}>
                                Unit
                            </div>
                            <div style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#1f2937',
                            }}>
                                {data.unitName}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                marginBottom: '0.5rem',
                            }}>
                                Deal Date
                            </div>
                            <div style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#1f2937',
                            }}>
                                {formatDate(data.purchaseDate)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unit Details */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1f2937',
                    }}>
                        <Home size={24} />
                        Unit Details
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                    }}>
                        {data.area && (
                            <div style={{
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '0.5rem',
                            }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Area</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                                    {data.area} m²
                                </div>
                            </div>
                        )}
                        {data.bedrooms && (
                            <div style={{
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '0.5rem',
                            }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bedrooms</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                                    {data.bedrooms}
                                </div>
                            </div>
                        )}
                        {data.bathrooms && (
                            <div style={{
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '0.5rem',
                            }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bathrooms</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                                    {data.bathrooms}
                                </div>
                            </div>
                        )}
                        {data.floor && (
                            <div style={{
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '0.5rem',
                            }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Floor</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                                    {data.floor}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1f2937',
                    }}>
                        <DollarSign size={24} />
                        Payment Summary
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Total Price
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                                {formatCurrency(data.totalPrice)} IQD
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Deposit Paid
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                {formatCurrency(data.downPayment || 0)} IQD
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Installments Paid
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                {formatCurrency(data.totalPaid)} IQD
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Remaining Balance
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                                {formatCurrency(data.remaining)} IQD
                            </div>
                        </div>
                    </div>
                </div>

                {/* Installment Schedule */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1f2937',
                    }}>
                        <Calendar size={24} />
                        Payment Schedule ({paidInstallments}/{totalInstallments} Paid)
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        {data.installmentSchedule.map((installment) => (
                            <div
                                key={installment.number}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: installment.status === 'paid' ? '#f0fdf4' : '#fef3c7',
                                    border: `1px solid ${installment.status === 'paid' ? '#86efac' : '#fde047'}`,
                                    borderRadius: '0.5rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {installment.status === 'paid' ? (
                                        <CheckCircle size={24} color="#10b981" />
                                    ) : (
                                        <Clock size={24} color="#f59e0b" />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                                            Installment #{installment.number}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Due: {formatDate(installment.dueDate)}
                                            {installment.milestoneType && (
                                                <span> • {installment.milestoneType}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    color: installment.status === 'paid' ? '#10b981' : '#f59e0b',
                                }}>
                                    {formatCurrency(installment.amount)} IQD
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1f2937',
                    }}>
                        <FileText size={24} />
                        Documents
                    </h2>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                    }}>
                        Contact your sales representative for official documents and receipts.
                    </p>
                </div>
            </div>
        </div>
    );
}
