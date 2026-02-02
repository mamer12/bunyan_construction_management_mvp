import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';

// Register Arabic font (using Cairo for better Arabic support)
Font.register({
    family: 'Cairo',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1w.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hL4-W1w.ttf', fontWeight: 'bold' },
    ],
});

// Common styles
const colors = {
    primary: '#059669',
    secondary: '#6B7280',
    border: '#E5E7EB',
    background: '#F9FAFB',
    text: '#111827',
    muted: '#6B7280',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Cairo',
        fontSize: 11,
        color: colors.text,
        direction: 'rtl',
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    logo: {
        width: 120,
    },
    companyInfo: {
        textAlign: 'right',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    companyDetail: {
        fontSize: 9,
        color: colors.muted,
        marginBottom: 2,
    },
    documentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: colors.primary,
    },
    documentNumber: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.muted,
        marginBottom: 30,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: colors.background,
        padding: 8,
        marginBottom: 10,
        borderRadius: 4,
    },
    row: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 8,
    },
    label: {
        width: '40%',
        fontWeight: 'bold',
        textAlign: 'right',
        color: colors.muted,
    },
    value: {
        width: '60%',
        textAlign: 'right',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: colors.primary,
        padding: 8,
        color: 'white',
    },
    tableHeaderCell: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        padding: 8,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
    },
    totalRow: {
        flexDirection: 'row-reverse',
        backgroundColor: colors.background,
        padding: 12,
        marginTop: 10,
    },
    totalLabel: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'right',
    },
    totalValue: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'left',
        color: colors.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: colors.muted,
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
    },
    signatureSection: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 50,
    },
    signatureBox: {
        width: '45%',
        textAlign: 'center',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: colors.text,
        marginBottom: 5,
        height: 50,
    },
    signatureLabel: {
        fontSize: 10,
        color: colors.muted,
    },
    stamp: {
        marginTop: 20,
        padding: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    stampText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-IQ', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(amount) + ' د.ع';
};

// Format date
const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ============================================
// INVOICE PDF (for Contractors)
// ============================================
interface InvoiceData {
    invoiceNumber: string;
    date: number;
    company: {
        companyName?: string;
        companyNameAr?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    contractor: {
        name: string;
        email?: string;
    };
    task: {
        title: string;
        description?: string;
        amount: number;
        approvedAt?: number;
    };
    project: {
        name?: string;
        location?: string;
    };
    unit: {
        name?: string;
    };
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{data.company.companyNameAr || 'بنيان للتطوير'}</Text>
                        <Text style={styles.companyDetail}>{data.company.address}</Text>
                        <Text style={styles.companyDetail}>{data.company.phone}</Text>
                        <Text style={styles.companyDetail}>{data.company.email}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.documentTitle}>فاتورة</Text>
                <Text style={styles.documentNumber}>رقم الفاتورة: {data.invoiceNumber}</Text>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>معلومات الفاتورة</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>التاريخ:</Text>
                        <Text style={styles.value}>{formatDate(data.date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>اسم المقاول:</Text>
                        <Text style={styles.value}>{data.contractor.name}</Text>
                    </View>
                    {data.contractor.email && (
                        <View style={styles.row}>
                            <Text style={styles.label}>البريد الإلكتروني:</Text>
                            <Text style={styles.value}>{data.contractor.email}</Text>
                        </View>
                    )}
                </View>

                {/* Project Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>تفاصيل المشروع</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>المشروع:</Text>
                        <Text style={styles.value}>{data.project.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>الوحدة:</Text>
                        <Text style={styles.value}>{data.unit.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>الموقع:</Text>
                        <Text style={styles.value}>{data.project.location}</Text>
                    </View>
                </View>

                {/* Work Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>تفاصيل العمل</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>الوصف</Text>
                            <Text style={styles.tableHeaderCell}>المبلغ</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                                {data.task.title}
                                {data.task.description && `\n${data.task.description}`}
                            </Text>
                            <Text style={styles.tableCell}>{formatCurrency(data.task.amount)}</Text>
                        </View>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>المجموع الكلي:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.task.amount)}</Text>
                    </View>
                </View>

                {/* Stamp */}
                <View style={styles.stamp}>
                    <Text style={styles.stampText}>معتمد</Text>
                    <Text style={[styles.stampText, { fontSize: 8 }]}>
                        {data.task.approvedAt ? formatDate(data.task.approvedAt) : ''}
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    هذه الفاتورة صادرة من نظام بنيان لإدارة المشاريع | bunyan.iq
                </Text>
            </Page>
        </Document>
    );
}

// ============================================
// SALES CONTRACT PDF
// ============================================
interface ContractData {
    contractNumber: string;
    date: number;
    seller: {
        companyName?: string;
        companyNameAr?: string;
        address?: string;
        phone?: string;
        registrationNumber?: string;
    };
    buyer: {
        name: string;
        phone?: string;
        email?: string;
    };
    property: {
        projectName?: string;
        projectLocation?: string;
        unitName?: string;
        area?: number;
        bedrooms?: number;
        bathrooms?: number;
        floor?: number;
    };
    financial: {
        totalPrice: number;
        discount?: number;
        downPayment?: number;
        paymentPlan?: string;
        installmentsCount?: number;
    };
    installments: Array<{
        number: number;
        amount: number;
        dueDate: number;
        milestoneType?: string;
    }>;
}

export function ContractPDF({ data }: { data: ContractData }) {
    const paymentPlanLabels: Record<string, string> = {
        cash: 'نقداً',
        monthly: 'أقساط شهرية',
        construction_linked: 'مرتبط بالبناء',
    };

    const milestoneLabels: Record<string, string> = {
        foundation: 'الأساس',
        structure: 'الهيكل',
        roof: 'السقف',
        finish: 'التشطيب',
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{data.seller.companyNameAr || 'بنيان للتطوير'}</Text>
                        <Text style={styles.companyDetail}>{data.seller.address}</Text>
                        {data.seller.registrationNumber && (
                            <Text style={styles.companyDetail}>رقم السجل: {data.seller.registrationNumber}</Text>
                        )}
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.documentTitle}>عقد حجز عقاري</Text>
                <Text style={styles.documentNumber}>رقم العقد: {data.contractNumber}</Text>

                {/* Contract Intro */}
                <View style={styles.section}>
                    <Text style={{ marginBottom: 10, lineHeight: 1.6 }}>
                        بناءً على ما اتفق عليه الطرفان، تم إبرام هذا العقد في تاريخ {formatDate(data.date)} بين كل من:
                    </Text>
                </View>

                {/* Parties */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>الطرف الأول (البائع)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>الشركة:</Text>
                        <Text style={styles.value}>{data.seller.companyNameAr || data.seller.companyName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>العنوان:</Text>
                        <Text style={styles.value}>{data.seller.address}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>الطرف الثاني (المشتري)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>الاسم:</Text>
                        <Text style={styles.value}>{data.buyer.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>الهاتف:</Text>
                        <Text style={styles.value}>{data.buyer.phone}</Text>
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>العقار موضوع العقد</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>المشروع:</Text>
                        <Text style={styles.value}>{data.property.projectName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>الوحدة:</Text>
                        <Text style={styles.value}>{data.property.unitName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>الموقع:</Text>
                        <Text style={styles.value}>{data.property.projectLocation}</Text>
                    </View>
                    {data.property.area && (
                        <View style={styles.row}>
                            <Text style={styles.label}>المساحة:</Text>
                            <Text style={styles.value}>{data.property.area} م²</Text>
                        </View>
                    )}
                    {data.property.bedrooms && (
                        <View style={styles.row}>
                            <Text style={styles.label}>غرف النوم:</Text>
                            <Text style={styles.value}>{data.property.bedrooms}</Text>
                        </View>
                    )}
                </View>

                {/* Financial Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>التفاصيل المالية</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>السعر الإجمالي:</Text>
                        <Text style={styles.value}>{formatCurrency(data.financial.totalPrice)}</Text>
                    </View>
                    {data.financial.discount && (
                        <View style={styles.row}>
                            <Text style={styles.label}>الخصم:</Text>
                            <Text style={styles.value}>{formatCurrency(data.financial.discount)}</Text>
                        </View>
                    )}
                    {data.financial.downPayment && (
                        <View style={styles.row}>
                            <Text style={styles.label}>الدفعة الأولى:</Text>
                            <Text style={styles.value}>{formatCurrency(data.financial.downPayment)}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>طريقة الدفع:</Text>
                        <Text style={styles.value}>
                            {paymentPlanLabels[data.financial.paymentPlan || 'monthly']}
                        </Text>
                    </View>
                </View>

                {/* Installment Schedule */}
                {data.installments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>جدول الأقساط</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderCell}>القسط</Text>
                                <Text style={styles.tableHeaderCell}>المبلغ</Text>
                                <Text style={styles.tableHeaderCell}>تاريخ الاستحقاق</Text>
                                <Text style={styles.tableHeaderCell}>ملاحظات</Text>
                            </View>
                            {data.installments.map((inst, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{inst.number}</Text>
                                    <Text style={styles.tableCell}>{formatCurrency(inst.amount)}</Text>
                                    <Text style={styles.tableCell}>{formatDate(inst.dueDate)}</Text>
                                    <Text style={styles.tableCell}>
                                        {inst.milestoneType ? milestoneLabels[inst.milestoneType] : '-'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>توقيع الطرف الأول (البائع)</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>توقيع الطرف الثاني (المشتري)</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    هذا العقد صادر من نظام بنيان لإدارة المشاريع | bunyan.iq
                </Text>
            </Page>
        </Document>
    );
}

// ============================================
// PAYMENT RECEIPT PDF
// ============================================
interface ReceiptData {
    receiptNumber: string;
    date: number;
    company: {
        companyName?: string;
        companyNameAr?: string;
        address?: string;
        phone?: string;
    };
    payer: {
        name: string;
        phone?: string;
    };
    payment: {
        installmentNumber: number;
        amount: number;
        method?: string;
        paidAt?: number;
    };
    reference: {
        projectName?: string;
        unitName?: string;
        dealId: string;
    };
}

export function ReceiptPDF({ data }: { data: ReceiptData }) {
    const methodLabels: Record<string, string> = {
        cash: 'نقداً',
        bank_transfer: 'تحويل بنكي',
        check: 'شيك',
    };

    return (
        <Document>
            <Page size="A5" style={[styles.page, { padding: 30 }]}>
                {/* Header */}
                <View style={[styles.header, { marginBottom: 20 }]}>
                    <View style={styles.companyInfo}>
                        <Text style={[styles.companyName, { fontSize: 14 }]}>
                            {data.company.companyNameAr || 'بنيان للتطوير'}
                        </Text>
                        <Text style={styles.companyDetail}>{data.company.address}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.documentTitle, { fontSize: 18 }]}>إيصال استلام</Text>
                <Text style={[styles.documentNumber, { marginBottom: 20 }]}>
                    رقم الإيصال: {data.receiptNumber}
                </Text>

                {/* Receipt Content */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>التاريخ:</Text>
                        <Text style={styles.value}>{formatDate(data.date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>استلمنا من:</Text>
                        <Text style={styles.value}>{data.payer.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>المبلغ:</Text>
                        <Text style={[styles.value, { fontWeight: 'bold', color: colors.primary }]}>
                            {formatCurrency(data.payment.amount)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>طريقة الدفع:</Text>
                        <Text style={styles.value}>
                            {methodLabels[data.payment.method || 'cash']}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>وذلك عن:</Text>
                        <Text style={styles.value}>
                            القسط رقم {data.payment.installmentNumber} - {data.reference.unitName}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>المشروع:</Text>
                        <Text style={styles.value}>{data.reference.projectName}</Text>
                    </View>
                </View>

                {/* Stamp */}
                <View style={[styles.stamp, { marginTop: 30 }]}>
                    <Text style={styles.stampText}>تم الاستلام</Text>
                </View>

                {/* Footer */}
                <Text style={[styles.footer, { bottom: 20 }]}>
                    إيصال صادر من نظام بنيان | {data.receiptNumber}
                </Text>
            </Page>
        </Document>
    );
}
