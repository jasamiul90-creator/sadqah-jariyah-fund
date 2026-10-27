import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Contribution, Expense, FundSummary } from '@/types/database';
import { getBanglaMonthName, formatBDT, toBengaliNumber } from './bangla';

export function exportFinancialStatementCSV(
  summary: FundSummary,
  contributions: Contribution[],
  expenses: Expense[],
  title = 'Sadqah_Jariyah_Financial_Report'
) {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Bengali/Excel support

  // Fund Summary Section
  csvContent += '--- SADQAH JARIYAH MONTHLY FUND (সদকায়ে জারিয়া মাসিক ফান্ড) ---\n';
  csvContent += `Generated At: ${new Date().toLocaleString()}\n\n`;

  csvContent += 'FINANCIAL SUMMARY (আর্থিক সারসংক্ষেপ)\n';
  csvContent += `Total Members (মোট সদস্য),${summary.total_members}\n`;
  csvContent += `Total Collection (মোট আদায়),BDT ${summary.total_collection}\n`;
  csvContent += `Total Expenses (মোট ব্যয়),BDT ${summary.total_expenses}\n`;
  csvContent += `Current Net Balance (বর্তমান তহবিল স্থিতি),BDT ${summary.current_balance}\n`;
  csvContent += `Total Due Amount (মোট বকেয়া),BDT ${summary.total_due}\n\n`;

  // Contributions Section
  csvContent += 'CONTRIBUTION RECORDS (মাসিক চাঁদা আদায়ের বিবরণী)\n';
  csvContent += 'Member Name,Month,Year,Expected Amount,Paid Amount,Due,Payment Date,Payment Method,Transaction ID,Notes\n';

  contributions.forEach((c) => {
    const memberName = `"${(c.member?.full_name || 'Member').replace(/"/g, '""')}"`;
    const month = getBanglaMonthName(c.contribution_month);
    const expected = c.expected_amount;
    const paid = c.paid_amount;
    const due = Math.max(0, expected - paid);
    const date = c.payment_date || '';
    const method = c.payment_method || '';
    const trx = `"${(c.transaction_reference || '').replace(/"/g, '""')}"`;
    const notes = `"${(c.notes || '').replace(/"/g, '""')}"`;

    csvContent += `${memberName},${month},${c.contribution_year},${expected},${paid},${due},${date},${method},${trx},${notes}\n`;
  });

  csvContent += '\nEXPENSE RECORDS (তহবিল ব্যয়ের বিবরণী)\n';
  csvContent += 'Date,Expense Title,Category,Amount,Description\n';

  expenses.forEach((e) => {
    const titleClean = `"${e.expense_title.replace(/"/g, '""')}"`;
    const category = `"${e.category.replace(/"/g, '""')}"`;
    const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
    csvContent += `${e.expense_date},${titleClean},${category},${e.amount},${desc}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportFinancialStatementPDF(
  summary: FundSummary,
  contributions: Contribution[],
  expenses: Expense[],
  reportTitle = 'Monthly Financial Statement'
) {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(6, 78, 59); // Emerald-900
  doc.text('Sadqah Jariyah Monthly Fund', 105, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87); // Emerald-700
  doc.text('সদকায়ে জারিয়া মাসিক ফান্ড | প্রতিটি অবদান হোক কল্যাণের পথে', 105, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Official Financial Report | Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 31, { align: 'center' });

  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // Summary Table
  autoTable(doc, {
    startY: 38,
    head: [['Financial Metric', 'Value (BDT)', 'Status']],
    body: [
      ['Total Active Members', `${summary.total_members} Members`, 'Registered'],
      ['Total Fund Collection', `BDT ${summary.total_collection.toLocaleString()}`, 'Received'],
      ['Total Fund Expenses', `BDT ${summary.total_expenses.toLocaleString()}`, 'Disbursed'],
      ['Current Net Fund Balance', `BDT ${summary.current_balance.toLocaleString()}`, 'Available'],
      ['Total Pending Due', `BDT ${summary.total_due.toLocaleString()}`, 'Receivable'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 95, 70], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  // Contributions Summary
  const lastY1 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(6, 78, 59);
  doc.text('Member Contributions (Recent / Filtered)', 14, lastY1);

  const contribRows = contributions.slice(0, 40).map((c) => [
    c.member?.full_name || 'Member',
    `${c.contribution_month}/${c.contribution_year}`,
    `BDT ${c.expected_amount}`,
    `BDT ${c.paid_amount}`,
    `BDT ${Math.max(0, c.expected_amount - c.paid_amount)}`,
    c.payment_method,
    c.payment_date,
  ]);

  autoTable(doc, {
    startY: lastY1 + 4,
    head: [['Member Name', 'Period', 'Expected', 'Paid', 'Due', 'Method', 'Date']],
    body: contribRows.length > 0 ? contribRows : [['No records found', '-', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87] },
    styles: { fontSize: 8 },
  });

  // Expenses Summary
  const lastY2 = (doc as any).lastAutoTable.finalY + 10;
  if (lastY2 > 240) {
    doc.addPage();
  }
  const currentY = lastY2 > 240 ? 20 : lastY2;

  doc.setFontSize(12);
  doc.setTextColor(6, 78, 59);
  doc.text('Disbursed Fund Expenses', 14, currentY);

  const expenseRows = expenses.slice(0, 30).map((e) => [
    e.expense_date,
    e.expense_title,
    e.category,
    `BDT ${e.amount.toLocaleString()}`,
    e.description || '-',
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Date', 'Title', 'Category', 'Amount', 'Description']],
    body: expenseRows.length > 0 ? expenseRows : [['No expense records yet', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [180, 83, 9] }, // Amber/gold heading
    styles: { fontSize: 8 },
  });

  // Footer notes & signature lines
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  if (finalY < 265) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Certified by Fund Administrator: Md Samiul Islam', 14, finalY);
    doc.line(14, finalY + 8, 70, finalY + 8);
    doc.text('Authorized Signature', 14, finalY + 12);
  }

  doc.save(`Sadqah_Fund_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
