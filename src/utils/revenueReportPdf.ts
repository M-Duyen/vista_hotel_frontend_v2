import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import type { RevenueData } from '../types/Report';

interface RevenueReportOptions {
    data: RevenueData[];
    startDate: string;
    endDate: string;
    period: string;
    preparedBy: string;
}

// Helper function to get period-specific labels and title
const getPeriodConfig = (period: string) => {
    switch (period) {
        case 'daily':
            return {
                title: 'DAILY REVENUE REPORT',
                columnLabel: 'Date',
                subtitle: 'Daily Revenue Statistics',
            };
        case 'weekly':
            return {
                title: 'WEEKLY REVENUE REPORT',
                columnLabel: 'Week',
                subtitle: 'Weekly Revenue Statistics',
            };
        case 'monthly':
            return {
                title: 'MONTHLY REVENUE REPORT',
                columnLabel: 'Month',
                subtitle: 'Monthly Revenue Statistics',
            };
        case 'quarterly':
            return {
                title: 'QUARTERLY REVENUE REPORT',
                columnLabel: 'Quarter',
                subtitle: 'Quarterly Revenue Statistics',
            };
        case 'yearly':
            return {
                title: 'YEARLY REVENUE REPORT',
                columnLabel: 'Year',
                subtitle: 'Yearly Revenue Statistics',
            };
        default:
            return {
                title: 'REVENUE REPORT',
                columnLabel: 'Date',
                subtitle: 'Custom Date Range Statistics',
            };
    }
};

// Helper function to remove Vietnamese tones
const removeVietnameseTones = (str: string): string => {
    if (!str) return '';
    const from =
        'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ';
    const to =
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyđAAAAAEEEIIOOOOUUADIUOaaaaaeeeeiiiioooooouuuadiuoUAAAAAAAAAAAAAEEEEEEuaaaaaaaaaaaaaaaaeeeeeeeEEIIOOOOOOOOOOOOOOOOUUUUUeeiioooooooooooooouuuuuUUUYYYYYuuuyyyyyyy';

    let result = str;
    for (let i = 0; i < from.length; i++) {
        result = result.replace(new RegExp(from[i], 'g'), to[i]);
    }
    return result;
};

// Get current date time formatted
const getCurrentDateTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
    ).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(
        now.getMonth() + 1,
    ).padStart(2, '0')}/${now.getFullYear()}`;
};

// Calculate totals from data
const calculateTotals = (data: RevenueData[]) => {
    return {
        roomRevenue: data.reduce(
            (sum, item) => sum + (item.roomRevenue || 0),
            0,
        ),
        serviceRevenue: data.reduce(
            (sum, item) => sum + (item.serviceRevenue || 0),
            0,
        ),
        totalRevenue: data.reduce((sum, item) => sum + item.totalRevenue, 0),
        bookingCount: data.reduce(
            (sum, item) => sum + (item.bookingCount || 0),
            0,
        ),
    };
};

/**
 * Generate Revenue Report PDF
 */
export const generateRevenueReportPdf = ({
    data,
    startDate,
    endDate,
    period,
    preparedBy,
}: RevenueReportOptions) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const periodConfig = getPeriodConfig(period);
    const formattedDateTime = getCurrentDateTime();
    const totals = calculateTotals(data);
    const avgPerBooking =
        totals.bookingCount > 0
            ? Math.round(totals.totalRevenue / totals.bookingCount)
            : 0;

    // ============ HEADER ============
    doc.setFillColor(204, 189, 163); // #CCBDA3
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text('VISTA HOTEL', 14, 15);

    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text('Premium Hospitality Services', 14, 21);
    doc.text('Phone: +84 123 456 789  |  Email: info@vistahotel.com', 14, 26);
    doc.text(
        'Address: 123 Luxury Street, District 1, Ho Chi Minh City',
        14,
        31,
    );

    // ============ REPORT TITLE ============
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text(periodConfig.title, pageWidth / 2, 48, { align: 'center' });

    doc.setDrawColor(204, 189, 163);
    doc.setLineWidth(0.5);
    doc.line(14, 52, pageWidth - 14, 52);

    // ============ REPORT INFO BOX ============
    let yPos = 58;
    doc.setDrawColor(204, 189, 163);
    doc.setFillColor(245, 240, 235);
    doc.roundedRect(14, yPos, pageWidth - 28, 28, 2, 2, 'FD');

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Reporting Period:', 18, yPos);
    doc.setFont('times', 'normal');
    doc.text(`${startDate} to ${endDate}`, 55, yPos);

    doc.setFont('times', 'bold');
    doc.text('Report Type:', 115, yPos);
    doc.setFont('times', 'normal');
    doc.text(period.charAt(0).toUpperCase() + period.slice(1), 150, yPos);

    yPos += 7;
    doc.setFont('times', 'bold');
    doc.text('Generated Date:', 18, yPos);
    doc.setFont('times', 'normal');
    doc.text(formattedDateTime, 55, yPos);

    yPos += 7;
    doc.setFont('times', 'bold');
    doc.text('Prepared By:', 18, yPos);
    doc.setFont('times', 'normal');
    doc.text(removeVietnameseTones(preparedBy), 55, yPos);

    doc.setFont('times', 'bold');
    doc.text('Department:', 115, yPos);
    doc.setFont('times', 'normal');
    doc.text('Finance', 150, yPos);

    yPos += 12;

    // ============ DATA TABLE ============
    const headers = [
        periodConfig.columnLabel,
        'Room Revenue',
        'Service Revenue',
        'Total Revenue',
        'Bookings',
        'Avg/Booking',
    ];

    const tableData = data.map((item) => {
        const avg =
            item.bookingCount && item.bookingCount > 0
                ? Math.round(item.totalRevenue / item.bookingCount)
                : 0;
        return [
            item.label || item.date || 'N/A',
            (item.roomRevenue || 0).toLocaleString('vi-VN'),
            (item.serviceRevenue || 0).toLocaleString('vi-VN'),
            item.totalRevenue.toLocaleString('vi-VN'),
            (item.bookingCount || 0).toString(),
            avg.toLocaleString('vi-VN'),
        ];
    });

    // Generate table
    autoTable(doc, {
        startY: yPos,
        head: [headers],
        body: tableData,
        foot: [
            [
                'TOTAL',
                totals.roomRevenue.toLocaleString('vi-VN'),
                totals.serviceRevenue.toLocaleString('vi-VN'),
                totals.totalRevenue.toLocaleString('vi-VN'),
                totals.bookingCount.toString(),
                avgPerBooking.toLocaleString('vi-VN'),
            ],
        ],
        theme: 'striped',
        headStyles: {
            fillColor: [204, 189, 163],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
        },
        footStyles: {
            fillColor: [204, 189, 163],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [250, 248, 245],
        },
        tableWidth: pageWidth - 28,
        columnStyles: {
            0: { halign: 'center' },
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' },
            5: { halign: 'right' },
        },
        // Áp dụng cùng columnStyles cho foot
        didParseCell: (data) => {
            if (data.section === 'foot') {
                // Áp dụng cùng alignment như body
                if (data.column.index === 0) {
                    data.cell.styles.halign = 'center';
                } else if (data.column.index === 4) {
                    data.cell.styles.halign = 'center';
                } else {
                    data.cell.styles.halign = 'right';
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // ============ SIGNATURE SECTION ============
    const signatureY = Math.min(yPos + 10, pageHeight - 65);

    doc.setDrawColor(204, 189, 163);
    doc.setLineWidth(0.3);
    doc.line(14, signatureY - 5, pageWidth - 14, signatureY - 5);

    doc.setFontSize(9);
    doc.setFont('times', 'bold');

    // Prepared By
    doc.text('PREPARED BY', 25, signatureY);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('(Report Preparer)', 21, signatureY + 5);
    doc.setFont('times', 'italic');
    doc.text('Signature:', 22, signatureY + 18);
    doc.line(22, signatureY + 19, 60, signatureY + 19);
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text(removeVietnameseTones(preparedBy), 22, signatureY + 25);

    // Approved By
    doc.setFont('times', 'bold');
    doc.text('APPROVED BY', pageWidth / 2 - 15, signatureY);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('(Approver)', pageWidth / 2 - 12, signatureY + 5);
    doc.setFont('times', 'italic');
    doc.text('Signature:', pageWidth / 2 - 15, signatureY + 18);
    doc.line(
        pageWidth / 2 - 15,
        signatureY + 19,
        pageWidth / 2 + 23,
        signatureY + 19,
    );
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Manager', pageWidth / 2 - 15, signatureY + 25);

    // Authorized By
    doc.setFont('times', 'bold');
    doc.text('AUTHORIZED BY', pageWidth - 52, signatureY);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('(Director)', pageWidth - 45, signatureY + 5);
    doc.setFont('times', 'italic');
    doc.text('Signature:', pageWidth - 50, signatureY + 18);
    doc.line(pageWidth - 50, signatureY + 19, pageWidth - 12, signatureY + 19);
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Director', pageWidth - 50, signatureY + 25);

    // ============ FOOTER ============
    const footerY = pageHeight - 12;
    doc.setFillColor(204, 189, 163);
    doc.rect(0, footerY - 3, pageWidth, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('times', 'italic');
    doc.text(
        'This is a computer-generated report - Vista Hotel Management System',
        pageWidth / 2,
        footerY,
        { align: 'center' },
    );
    doc.setFontSize(6);
    doc.text(
        `Page 1 | Generated on ${formattedDateTime} | Confidential Document`,
        pageWidth / 2,
        footerY + 4,
        { align: 'center' },
    );

    // Save PDF
    const fileName = `Vista_Revenue_Report_${period}_${startDate}_to_${endDate}.pdf`;
    doc.save(fileName);
};

/**
 * Generate Revenue Report Excel
 */
export const generateRevenueReportExcel = async ({
    data,
    startDate,
    endDate,
    period,
    preparedBy,
}: RevenueReportOptions) => {
    const periodConfig = getPeriodConfig(period);
    const formattedDateTime = getCurrentDateTime();
    const totals = calculateTotals(data);
    const avgPerBooking =
        totals.bookingCount > 0
            ? Math.round(totals.totalRevenue / totals.bookingCount)
            : 0;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revenue Report');

    let currentRow = 1;

    // ============ HEADER ============
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = 'VISTA HOTEL';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCBDA3' },
    };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Premium Hospitality Services';
    worksheet.getCell(`A${currentRow}`).font = {
        size: 10,
        color: { argb: 'FFFFFFFF' },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCBDA3' },
    };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
        'Phone: +84 123 456 789 | Email: info@vistahotel.com';
    worksheet.getCell(`A${currentRow}`).font = {
        size: 9,
        color: { argb: 'FFFFFFFF' },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCBDA3' },
    };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
        'Address: 123 Luxury Street, District 1, Ho Chi Minh City';
    worksheet.getCell(`A${currentRow}`).font = {
        size: 9,
        color: { argb: 'FFFFFFFF' },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCBDA3' },
    };
    currentRow += 2;

    // ============ REPORT TITLE ============
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const reportTitleCell = worksheet.getCell(`A${currentRow}`);
    reportTitleCell.value = periodConfig.title;
    reportTitleCell.font = { bold: true, size: 16 };
    reportTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(currentRow).height = 25;
    currentRow += 2;

    // ============ REPORT INFO ============
    const infoStyle = {
        fill: {
            type: 'pattern' as const,
            pattern: 'solid' as const,
            fgColor: { argb: 'FFF5F0EB' },
        },
        border: {
            top: { style: 'thin' as const },
            left: { style: 'thin' as const },
            bottom: { style: 'thin' as const },
            right: { style: 'thin' as const },
        },
    };

    // Row 1: Reporting Period & Report Type
    worksheet.getCell(`A${currentRow}`).value = 'Reporting Period:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    Object.assign(worksheet.getCell(`A${currentRow}`), infoStyle);
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = `${startDate} to ${endDate}`;
    Object.assign(worksheet.getCell(`B${currentRow}`), infoStyle);
    worksheet.getCell(`D${currentRow}`).value = 'Report Type:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    Object.assign(worksheet.getCell(`D${currentRow}`), infoStyle);
    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value =
        period.charAt(0).toUpperCase() + period.slice(1);
    Object.assign(worksheet.getCell(`E${currentRow}`), infoStyle);
    currentRow++;

    // Row 2: Generated Date & Department
    worksheet.getCell(`A${currentRow}`).value = 'Generated Date:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    Object.assign(worksheet.getCell(`A${currentRow}`), infoStyle);
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = formattedDateTime;
    Object.assign(worksheet.getCell(`B${currentRow}`), infoStyle);
    worksheet.getCell(`D${currentRow}`).value = 'Department:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    Object.assign(worksheet.getCell(`D${currentRow}`), infoStyle);
    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = 'Finance';
    Object.assign(worksheet.getCell(`E${currentRow}`), infoStyle);
    currentRow++;

    // Row 3: Prepared By
    worksheet.getCell(`A${currentRow}`).value = 'Prepared By:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    Object.assign(worksheet.getCell(`A${currentRow}`), infoStyle);
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value =
        removeVietnameseTones(preparedBy);
    Object.assign(worksheet.getCell(`B${currentRow}`), infoStyle);
    currentRow += 2;

    // ============ DATA TABLE ============
    const headers = [
        periodConfig.columnLabel,
        'Room Revenue',
        'Service Revenue',
        'Total Revenue',
        'Bookings',
        'Avg/Booking',
    ];
    const headerRow = worksheet.getRow(currentRow);
    headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCBDA3' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });
    currentRow++;

    // Data rows
    data.forEach((item, rowIndex) => {
        const avg =
            item.bookingCount && item.bookingCount > 0
                ? Math.round(item.totalRevenue / item.bookingCount)
                : 0;
        const values = [
            item.label || item.date || 'N/A',
            item.roomRevenue || 0,
            item.serviceRevenue || 0,
            item.totalRevenue,
            item.bookingCount || 0,
            avg,
        ];

        const dataRow = worksheet.getRow(currentRow);
        values.forEach((value, index) => {
            const cell = dataRow.getCell(index + 1);
            cell.value = value;
            cell.alignment = {
                horizontal: index === 0 ? 'center' : 'right',
                vertical: 'middle',
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            if (rowIndex % 2 === 1) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFAF8F5' },
                };
            }
            // Format numbers
            if ((index >= 1 && index <= 3) || index === 5) {
                cell.numFmt = '#,##0';
            }
        });
        currentRow++;
    });

    // Total row
    const totalRow = worksheet.getRow(currentRow);
    const totalValues = [
        'TOTAL',
        totals.roomRevenue,
        totals.serviceRevenue,
        totals.totalRevenue,
        totals.bookingCount,
        avgPerBooking,
    ];
    totalValues.forEach((value, index) => {
        const cell = totalRow.getCell(index + 1);
        cell.value = value;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCBDA3' },
        };
        cell.alignment = {
            horizontal: index === 0 ? 'center' : 'right',
            vertical: 'middle',
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        if ((index >= 1 && index <= 3) || index === 5) {
            cell.numFmt = '#,##0';
        }
    });
    currentRow += 2;

    // ============ SIGNATURE SECTION ============
    // Prepared By
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'PREPARED BY';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
    };

    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'APPROVED BY';
    worksheet.getCell(`C${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`C${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
    };

    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = 'AUTHORIZED BY';
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`E${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
    };
    currentRow++;

    // Subtitles
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = '(Report Preparer)';
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = '(Approver)';
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = '(Director)';
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
    currentRow++;

    // Empty row for signature space
    worksheet.getRow(currentRow).height = 30;
    currentRow++;

    // Signature lines
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Signature: _______________';
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Signature: _______________';
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = 'Signature: _______________';
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
    currentRow++;

    // Names
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
        removeVietnameseTones(preparedBy);
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Manager';
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = 'Director';
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
    currentRow += 2;

    // ============ FOOTER ============
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
        'This is a computer-generated report - Vista Hotel Management System';
    worksheet.getCell(`A${currentRow}`).font = { italic: true, size: 9 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(
        `A${currentRow}`,
    ).value = `Page 1 | Generated on ${formattedDateTime} | Confidential Document`;
    worksheet.getCell(`A${currentRow}`).font = { size: 8 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    // Column widths
    worksheet.columns = [
        { width: 20 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 12 },
        { width: 18 },
    ];

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vista_Revenue_Report_${period}_${startDate}_to_${endDate}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
};
