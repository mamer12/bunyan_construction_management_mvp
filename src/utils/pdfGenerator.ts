import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePayoutInvoice = (payout: any) => {
    const doc = new jsPDF();

    // Company Logo/Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Bunyan Construction", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Enterprise Management System", 20, 28);

    // Invoice Details
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const date = new Date().toLocaleDateString();

    doc.text(`Invoice ID: INV-${payout._id.slice(0, 8).toUpperCase()}`, 130, 20);
    doc.text(`Date: ${date}`, 130, 28);

    // Bill To
    doc.setFontSize(14);
    doc.text("Payment Advice", 20, 50);

    doc.setFontSize(10);
    doc.text(`Payee: ${payout.engineerName}`, 20, 60);
    doc.text(`Method: ${payout.paymentMethod || "CASH"}`, 20, 66);
    doc.text(`Status: ${payout.status}`, 20, 72);

    // Table
    const tableColumn = ["Description", "Amount (IQD)"];

    // In a real app, we would list specific tasks here. 
    // For this MVP, we just show the total payout amount.
    const tableRows = [
        ["Project Task Performance Payout", payout.amount.toLocaleString()],
    ];

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: $${payout.amount.toLocaleString()}`, 130, finalY);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Authorized Signature:", 20, finalY + 30);
    doc.line(60, finalY + 30, 100, finalY + 30);

    doc.save(`Payout_${payout.engineerName}_${date}.pdf`);
};
