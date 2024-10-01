import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
}

interface LoanData {
    loanId: string;
    [key: string]: any;
}

interface ExportPDFProps {
    data: LoanData[];
    filename: string;
    title: string;
    columns: { header: string; dataKey: string }[];
    additionalInfo?: { label: string; value: string }[];
    msisdn: string; // Add MSISDN to props
}

const ExportPDF: React.FC<ExportPDFProps> = ({ data, filename, title, columns, additionalInfo, msisdn }) => {
    const downloadPDF = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // Set document properties
        doc.setProperties({
            title: title,
            subject: 'Transaction Histories',
            author: 'Your Company Name',
            keywords: 'transactions, history, loan',
            creator: 'Your Application Name'
        });

        // Add title with a grey background
        doc.setFillColor(220, 220, 220); // Light grey
        doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
        doc.setTextColor(0); // Black text
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), doc.internal.pageSize.width / 2, 17, { align: 'center' });

        let yPos = 40;

        // Add additional info if provided
        if (additionalInfo) {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            const infoColumns = 2;
            const columnWidth = (doc.internal.pageSize.width - 28) / infoColumns;
            additionalInfo.forEach((info, index) => {
                const xPos = 14 + (index % infoColumns) * columnWidth;
                yPos = 40 + Math.floor(index / infoColumns) * 10;
                doc.setFont('helvetica', 'bold');
                doc.text(`${info.label}:`, xPos, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(info.value + "", xPos + 30, yPos); // Adjust the +50 value to increase spacing
            });
            yPos += 20;
        }

        // Group data by loan ID
        const groupedData = data.reduce((acc, item) => {
            const loanItem = item as LoanData;
            if (!acc[loanItem.loanId]) {
                acc[loanItem.loanId] = [];
            }
            acc[loanItem.loanId].push(loanItem);
            return acc;
        }, {} as Record<string, LoanData[]>);

        // Iterate through each loan group
        Object.entries(groupedData).forEach(([loanId, loanData], index) => {
            // Add loan ID header
            doc.setFillColor(240, 240, 240); // Very light grey
            doc.roundedRect(10, yPos - 5, doc.internal.pageSize.width - 20, 12, 2, 2, 'F');
            doc.setFontSize(12);
            doc.setTextColor(0); // Black text
            doc.setFont('helvetica', 'bold');
            doc.text(`Loan ID: ${loanId}`, 14, yPos + 3);
            yPos += 15;

            // Add transaction table for this loan
            doc.autoTable({
                startY: yPos,
                head: [columns.map(col => col.header)],
                body: (loanData as LoanData[]).map(row => columns.map(col => row[col.dataKey])),
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' }, // Grey header with black text
                alternateRowStyles: { fillColor: [245, 245, 245] }, // Very light grey for alternate rows
                margin: { top: 10, bottom: 10, left: 10, right: 10 },
            });

            yPos = (doc as any).lastAutoTable.finalY + 20;

            // Add a new page if there's not enough space for the next loan
            if (yPos > doc.internal.pageSize.height - 30 && index < Object.keys(groupedData).length - 1) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Add page numbers
        const totalPages = doc.internal.pages.length;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100); // Dark grey for page numbers
            doc.text(`MoMoKash-Your Bank service anytime anywhere Page ${i} of ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        // Generate filename with timestamp and MSISDN
        const timestamp = new Date().toISOString().replace(/[:.]/g, '/'); // Replace ":" and "." to make it filename-friendly
        const fileNameWithTimestamp = `${filename}_${msisdn}_${timestamp}.pdf`;

        doc.save(fileNameWithTimestamp);
    };

    return (
        <button onClick={downloadPDF} className="btn btn-secondary btn-sm">
            Download PDF
        </button>
    );
};

export default ExportPDF;
