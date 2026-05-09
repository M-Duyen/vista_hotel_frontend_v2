import React, { useState } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import type { DateRange } from '../../types/Report';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

interface ExportButtonProps {
    reportType: string;
    dateRange: DateRange;
    data?: any; // Data từ trang hiện tại
}

const ExportButton: React.FC<ExportButtonProps> = ({
    reportType,
    dateRange,
    data,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Hàm chuyển đổi tiếng Việt có dấu sang không dấu
    const removeVietnameseTones = (str: string): string => {
        if (!str) return '';

        // Bảng mapping đầy đủ các ký tự tiếng Việt
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
    // Chuẩn hóa dữ liệu revenue cho PDF + Excel
    const buildRevenueTable = (reportData: any, mode: string) => {
        if (!Array.isArray(reportData))
            return { head: [], body: [], totals: {} };

        // Xác định cột đầu tiên
        let firstColumn = 'Date';
        if (mode === 'weekly') firstColumn = 'Week';
        if (mode === 'monthly') firstColumn = 'Month';
        if (mode === 'yearly') firstColumn = 'Year';

        const head = [
            firstColumn,
            'Room Revenue',
            'Service Revenue',
            'Total Revenue',
        ];

        const body = reportData.map((item: any) => [
            item.date || item.week || item.month || item.year || '',
            item.roomRevenue?.toLocaleString('vi-VN') || 0,
            item.serviceRevenue?.toLocaleString('vi-VN') || 0,
            item.totalRevenue?.toLocaleString('vi-VN') || 0,
        ]);

        const totals = reportData.reduce(
            (acc: any, cur: any) => ({
                roomRevenue: (acc.roomRevenue || 0) + (cur.roomRevenue || 0),
                serviceRevenue:
                    (acc.serviceRevenue || 0) + (cur.serviceRevenue || 0),
                totalRevenue: (acc.totalRevenue || 0) + (cur.totalRevenue || 0),
            }),
            {},
        );

        return { head, body, totals };
    };

    const exportToPDF = (reportData: any) => {
        const doc = new jsPDF();

        // Sử dụng Times font - hỗ trợ Unicode tốt hơn Helvetica
        doc.setFont('times', 'normal');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Lấy thông tin user từ localStorage
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const currentDate = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        // ============ HEADER - Logo và thông tin công ty ============
        doc.setFillColor(204, 189, 163); // #CCBDA3
        doc.rect(0, 0, pageWidth, 35, 'F');

        // Logo text (có thể thay bằng hình ảnh logo thực tế)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('times', 'bold');
        doc.text('VISTA HOTEL', 14, 15);

        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        doc.text('Premium Hospitality Services', 14, 21);
        doc.text(
            'Phone: +84 123 456 789  |  Email: info@vistahotel.com',
            14,
            26,
        );
        doc.text(
            'Address: 123 Luxury Street, District 1, Ho Chi Minh City',
            14,
            31,
        );

        // ============ TIÊU ĐỀ BÁO CÁO ============
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('times', 'bold');
        const reportTitle = `${reportType.toUpperCase()} REPORT`;
        const titleWidth = doc.getTextWidth(reportTitle);
        doc.text(reportTitle, (pageWidth - titleWidth) / 2, 48);

        // Đường kẻ dưới tiêu đề
        doc.setDrawColor(204, 189, 163);
        doc.setLineWidth(0.5);
        doc.line(14, 52, pageWidth - 14, 52);

        // ============ THÔNG TIN BÁO CÁO ============
        let yPos = 60;
        doc.setFontSize(10);
        doc.setFont('times', 'normal');

        // Khung thông tin
        doc.setDrawColor(204, 189, 163);
        doc.setFillColor(245, 240, 235); // #F5F0EB
        doc.roundedRect(14, yPos, pageWidth - 28, 35, 2, 2, 'FD');

        yPos += 7;
        doc.setFont('times', 'bold');
        doc.text('Reporting Period:', 18, yPos);
        doc.setFont('times', 'normal');
        doc.text(`${dateRange.startDate} to ${dateRange.endDate}`, 65, yPos);

        yPos += 7;
        doc.setFont('times', 'bold');
        doc.text('Generated Date:', 18, yPos);
        doc.setFont('times', 'normal');
        doc.text(currentDate, 65, yPos);

        yPos += 7;
        doc.setFont('times', 'bold');
        doc.text('Prepared By:', 18, yPos);
        doc.setFont('times', 'normal');
        // Sử dụng tên không dấu
        doc.text(removeVietnameseTones(user?.fullName || 'N/A'), 65, yPos);

        yPos += 7;
        doc.setFont('times', 'bold');
        doc.text('Department:', 18, yPos);
        doc.setFont('times', 'normal');
        doc.text(removeVietnameseTones(user?.department || 'N/A'), 65, yPos);
        doc.text(
            `Position: ${removeVietnameseTones(user?.position || 'N/A')}`,
            120,
            yPos,
        );

        yPos += 12;
        yPos += 12;

        // ============ NỘI DUNG BÁO CÁO - BẢNG DỮ LIỆU ============
        // Phân nhánh theo loại báo cáo
        switch (reportType) {
            case 'services':
                if (data && Array.isArray(data)) {
                    const tableData = data.map((item: any) => [
                        item.date || '',
                        item.foodBeverage?.toLocaleString('vi-VN') || '0',
                        item.laundry?.toLocaleString('vi-VN') || '0',
                        item.spa?.toLocaleString('vi-VN') || '0',
                        item.transport?.toLocaleString('vi-VN') || '0',
                        item.tour?.toLocaleString('vi-VN') || '0',
                        item.others?.toLocaleString('vi-VN') || '0',
                        item.totalOrders || '0',
                    ]);

                    // Tính tổng
                    const totals = data.reduce(
                        (acc: any, item: any) => ({
                            foodBeverage:
                                (acc.foodBeverage || 0) +
                                (item.foodBeverage || 0),
                            laundry: (acc.laundry || 0) + (item.laundry || 0),
                            spa: (acc.spa || 0) + (item.spa || 0),
                            transport:
                                (acc.transport || 0) + (item.transport || 0),
                            tour: (acc.tour || 0) + (item.tour || 0),
                            others: (acc.others || 0) + (item.others || 0),
                            totalOrders:
                                (acc.totalOrders || 0) +
                                (item.totalOrders || 0),
                        }),
                        {},
                    );

                    autoTable(doc, {
                        startY: yPos,
                        head: [
                            [
                                'Date',
                                'Food & Beverage',
                                'Laundry',
                                'Spa',
                                'Transport',
                                'Tour',
                                'Others',
                                'Total Orders',
                            ],
                        ],
                        body: tableData,
                        foot: [
                            [
                                'TOTAL',
                                totals.foodBeverage?.toLocaleString('vi-VN'),
                                totals.laundry?.toLocaleString('vi-VN'),
                                totals.spa?.toLocaleString('vi-VN'),
                                totals.transport?.toLocaleString('vi-VN'),
                                totals.tour?.toLocaleString('vi-VN'),
                                totals.others?.toLocaleString('vi-VN'),
                                totals.totalOrders?.toString(),
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
                            1: { halign: 'center' },
                            2: { halign: 'center' },
                            3: { halign: 'center' },
                            4: { halign: 'center' },
                            5: { halign: 'center' },
                            6: { halign: 'center' },
                            7: { halign: 'center' },
                        },
                        didParseCell: (cellData) => {
                            // Áp dụng cùng alignment cho foot như body
                            if (cellData.section === 'foot') {
                                cellData.cell.styles.halign = 'center';
                            }
                        },
                        margin: { left: 14, right: 14 },
                    });

                    yPos = (doc as any).lastAutoTable.finalY + 10;
                }
                break;

            case 'revenue':
                if (data) {
                    const { head, body, totals } = buildRevenueTable(
                        data,
                        dateRange.mode || 'daily',
                    );

                    autoTable(doc, {
                        startY: yPos,
                        head: [head],
                        body,
                        foot: [
                            [
                                'TOTAL',
                                totals.roomRevenue?.toLocaleString('vi-VN'),
                                totals.serviceRevenue?.toLocaleString('vi-VN'),
                                totals.totalRevenue?.toLocaleString('vi-VN'),
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
                            fontSize: 9,
                            cellPadding: 3,
                            halign: 'center',
                        },
                        alternateRowStyles: {
                            fillColor: [250, 248, 245],
                        },
                        tableWidth: pageWidth - 28,
                        columnStyles: {
                            0: { halign: 'center' },
                            1: { halign: 'center' },
                            2: { halign: 'center' },
                            3: { halign: 'center' },
                        },
                        didParseCell: (cellData) => {
                            // Áp dụng cùng alignment cho foot như body
                            if (cellData.section === 'foot') {
                                cellData.cell.styles.halign = 'center';
                            }
                        },
                        margin: { left: 14, right: 14 },
                    });

                    yPos = (doc as any).lastAutoTable.finalY + 10;
                }
                break;

            case 'occupancy':
            case 'loyalty':
            case 'reviews':
            case 'bookings':
                // TODO: Implement cho các loại báo cáo khác
                doc.setFontSize(10);
                doc.text('Data not available for this report type', 14, yPos);
                yPos += 10;
                break;

            default:
                doc.setFontSize(10);
                doc.text('Unknown report type', 14, yPos);
                yPos += 10;
        }

        // ============ CHỮ KÝ VÀ PHÊ DUYỆT ============
        const signatureY = pageHeight - 70;

        // Đường kẻ phân cách
        doc.setDrawColor(204, 189, 163);
        doc.setLineWidth(0.3);
        doc.line(14, signatureY - 5, pageWidth - 14, signatureY - 5);

        // Phần chữ ký
        doc.setFontSize(9);
        doc.setFont('times', 'bold');

        // Người lập báo cáo
        doc.text('PREPARED BY', 25, signatureY);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text('(Report Preparer)', 21, signatureY + 5);
        doc.setFont('times', 'italic');
        doc.text('Signature:', 22, signatureY + 20);
        doc.line(22, signatureY + 21, 60, signatureY + 21);
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        // Sử dụng tên không dấu
        doc.text(
            removeVietnameseTones(user?.fullName || 'N/A'),
            22,
            signatureY + 27,
        );
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text(
            removeVietnameseTones(user?.position || ''),
            22,
            signatureY + 32,
        );

        // Người phê duyệt
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('APPROVED BY', pageWidth / 2 - 15, signatureY);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text('(Approver)', pageWidth / 2 - 12, signatureY + 5);
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.text('Signature:', pageWidth / 2 - 15, signatureY + 20);
        doc.line(
            pageWidth / 2 - 15,
            signatureY + 21,
            pageWidth / 2 + 23,
            signatureY + 21,
        );
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('_________________', pageWidth / 2 - 15, signatureY + 27);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text('Manager', pageWidth / 2 - 15, signatureY + 32);

        // Giám đốc
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('AUTHORIZED BY', pageWidth - 52, signatureY);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text('(Director)', pageWidth - 45, signatureY + 5);
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.text('Signature:', pageWidth - 50, signatureY + 20);
        doc.line(
            pageWidth - 50,
            signatureY + 21,
            pageWidth - 12,
            signatureY + 21,
        );
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('_________________', pageWidth - 50, signatureY + 27);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.text('Director', pageWidth - 50, signatureY + 32);

        // ============ FOOTER ============
        const footerY = pageHeight - 15;
        doc.setFillColor(204, 189, 163);
        doc.rect(0, footerY - 5, pageWidth, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('times', 'italic');
        const footerText =
            'This is a computer-generated report - Vista Hotel Management System';
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);

        doc.setFontSize(6);
        doc.text(
            `Page 1 | Generated on ${currentDate}`,
            (pageWidth -
                doc.getTextWidth(`Page 1 | Generated on ${currentDate}`)) /
                2,
            footerY + 4,
        );

        doc.text(
            'Confidential Document - For Internal Use Only',
            (pageWidth -
                doc.getTextWidth(
                    'Confidential Document - For Internal Use Only',
                )) /
                2,
            footerY + 8,
        );

        doc.save(
            `${reportType}_report_${dateRange.startDate}_${dateRange.endDate}.pdf`,
        );
    };

    const exportToExcel = async (reportData: any) => {
        // Lấy thông tin user
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const currentDate = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Tạo workbook và worksheet với ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportType.toUpperCase());

        let currentRow = 1;

        // ============ HEADER - Thông tin công ty ============
        const headerStyle = {
            font: { bold: true, size: 16 },
            alignment: {
                horizontal: 'left' as const,
                vertical: 'middle' as const,
            },
        };

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = 'VISTA HOTEL';
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCBDA3' },
        };
        currentRow++;

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value =
            'Premium Hospitality Services';
        worksheet.getCell(`A${currentRow}`).font = { size: 10 };
        currentRow++;

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value =
            'Phone: +84 123 456 789 | Email: info@vistahotel.com';
        worksheet.getCell(`A${currentRow}`).font = { size: 9 };
        currentRow++;

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value =
            'Address: 123 Luxury Street, District 1, Ho Chi Minh City';
        worksheet.getCell(`A${currentRow}`).font = { size: 9 };
        currentRow += 2;

        // ============ TIÊU ĐỀ BÁO CÁO ============
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const reportTitleCell = worksheet.getCell(`A${currentRow}`);
        reportTitleCell.value = `${reportType.toUpperCase()} REPORT`;
        reportTitleCell.font = { bold: true, size: 14 };
        reportTitleCell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
        currentRow += 2;

        // ============ THÔNG TIN BÁO CÁO ============
        const infoStartRow = currentRow;

        // Box background cho info section
        for (let row = currentRow; row < currentRow + 4; row++) {
            for (let col = 1; col <= 8; col++) {
                const cell = worksheet.getCell(row, col);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF5F0EB' },
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            }
        }

        worksheet.getCell(`A${currentRow}`).value = 'Reporting Period:';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(
            `B${currentRow}`,
        ).value = `${dateRange.startDate} to ${dateRange.endDate}`;
        worksheet.mergeCells(`B${currentRow}:H${currentRow}`);
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Generated Date:';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`B${currentRow}`).value = currentDate;
        worksheet.mergeCells(`B${currentRow}:H${currentRow}`);
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Prepared By:';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`B${currentRow}`).value = removeVietnameseTones(
            user?.fullName || 'N/A',
        );
        worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Department:';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`B${currentRow}`).value = removeVietnameseTones(
            user?.department || 'N/A',
        );
        worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
        worksheet.getCell(`D${currentRow}`).value = 'Position:';
        worksheet.getCell(`D${currentRow}`).font = { bold: true };
        worksheet.getCell(`E${currentRow}`).value = removeVietnameseTones(
            user?.position || 'N/A',
        );
        worksheet.mergeCells(`E${currentRow}:H${currentRow}`);
        currentRow += 2;

        // ============ DỮ LIỆU BẢNG ============
        const tableStartRow = currentRow;

        switch (reportType) {
            case 'services':
                if (data && Array.isArray(data)) {
                    // Header bảng
                    const headerRow = worksheet.getRow(currentRow);
                    const headers = [
                        'Date',
                        'Food & Beverage',
                        'Laundry',
                        'Spa',
                        'Transport',
                        'Tour',
                        'Others',
                        'Total Orders',
                    ];
                    headers.forEach((header, index) => {
                        const cell = headerRow.getCell(index + 1);
                        cell.value = header;
                        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFCCBDA3' },
                        };
                        cell.alignment = {
                            horizontal: 'center',
                            vertical: 'middle',
                        };
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                    currentRow++;

                    // Dữ liệu
                    data.forEach((item: any) => {
                        const dataRow = worksheet.getRow(currentRow);
                        const values = [
                            item.date || '',
                            item.foodBeverage || 0,
                            item.laundry || 0,
                            item.spa || 0,
                            item.transport || 0,
                            item.tour || 0,
                            item.others || 0,
                            item.totalOrders || 0,
                        ];

                        values.forEach((value, index) => {
                            const cell = dataRow.getCell(index + 1);
                            cell.value = value;
                            cell.alignment = {
                                horizontal: 'center',
                                vertical: 'middle',
                            };
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' },
                            };
                        });
                        currentRow++;
                    });

                    // Dòng tổng
                    const totals = data.reduce(
                        (acc: any, item: any) => ({
                            foodBeverage:
                                (acc.foodBeverage || 0) +
                                (item.foodBeverage || 0),
                            laundry: (acc.laundry || 0) + (item.laundry || 0),
                            spa: (acc.spa || 0) + (item.spa || 0),
                            transport:
                                (acc.transport || 0) + (item.transport || 0),
                            tour: (acc.tour || 0) + (item.tour || 0),
                            others: (acc.others || 0) + (item.others || 0),
                            totalOrders:
                                (acc.totalOrders || 0) +
                                (item.totalOrders || 0),
                        }),
                        {},
                    );

                    const totalRow = worksheet.getRow(currentRow);
                    const totalValues = [
                        'TOTAL',
                        totals.foodBeverage,
                        totals.laundry,
                        totals.spa,
                        totals.transport,
                        totals.tour,
                        totals.others,
                        totals.totalOrders,
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
                            horizontal: 'center',
                            vertical: 'middle',
                        };
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                    currentRow++;
                }
                break;

            default:
                worksheet.getCell(`A${currentRow}`).value =
                    'Data not available for this report type';
                currentRow++;
        }

        currentRow += 2;

        // ============ CHỮ KÝ ============
        // Box cho chữ ký
        const sigStartRow = currentRow;

        // PREPARED BY section
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const preparedCell = worksheet.getCell(`A${currentRow}`);
        preparedCell.value = 'PREPARED BY';
        preparedCell.font = { bold: true, size: 11 };
        preparedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        preparedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' },
        };
        preparedCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        // APPROVED BY section
        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        const approvedCell = worksheet.getCell(`D${currentRow}`);
        approvedCell.value = 'APPROVED BY';
        approvedCell.font = { bold: true, size: 11 };
        approvedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        approvedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' },
        };
        approvedCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        // AUTHORIZED BY section
        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        const authorizedCell = worksheet.getCell(`G${currentRow}`);
        authorizedCell.value = 'AUTHORIZED BY';
        authorizedCell.font = { bold: true, size: 11 };
        authorizedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        authorizedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' },
        };
        authorizedCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        currentRow++;

        // Subtitle row
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const prepSubCell = worksheet.getCell(`A${currentRow}`);
        prepSubCell.value = '(Report Preparer)';
        prepSubCell.alignment = { horizontal: 'center', vertical: 'middle' };
        prepSubCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        const appSubCell = worksheet.getCell(`D${currentRow}`);
        appSubCell.value = '(Approver)';
        appSubCell.alignment = { horizontal: 'center', vertical: 'middle' };
        appSubCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        const authSubCell = worksheet.getCell(`G${currentRow}`);
        authSubCell.value = '(Director)';
        authSubCell.alignment = { horizontal: 'center', vertical: 'middle' };
        authSubCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        currentRow++;

        // Empty space for signature
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        worksheet.getCell(`D${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        worksheet.getCell(`G${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        worksheet.getRow(currentRow).height = 30;
        currentRow++;

        // Signature line row
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const sigLineCell1 = worksheet.getCell(`A${currentRow}`);
        sigLineCell1.value = 'Signature: _______________';
        sigLineCell1.alignment = { horizontal: 'center', vertical: 'middle' };
        sigLineCell1.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        const sigLineCell2 = worksheet.getCell(`D${currentRow}`);
        sigLineCell2.value = 'Signature: _______________';
        sigLineCell2.alignment = { horizontal: 'center', vertical: 'middle' };
        sigLineCell2.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        const sigLineCell3 = worksheet.getCell(`G${currentRow}`);
        sigLineCell3.value = 'Signature: _______________';
        sigLineCell3.alignment = { horizontal: 'center', vertical: 'middle' };
        sigLineCell3.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        currentRow++;

        // Name row
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const nameCell1 = worksheet.getCell(`A${currentRow}`);
        nameCell1.value = removeVietnameseTones(user?.fullName || 'N/A');
        nameCell1.font = { bold: true };
        nameCell1.alignment = { horizontal: 'center', vertical: 'middle' };
        nameCell1.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        const nameCell2 = worksheet.getCell(`D${currentRow}`);
        nameCell2.value = 'Manager';
        nameCell2.alignment = { horizontal: 'center', vertical: 'middle' };
        nameCell2.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        const nameCell3 = worksheet.getCell(`G${currentRow}`);
        nameCell3.value = 'Director';
        nameCell3.alignment = { horizontal: 'center', vertical: 'middle' };
        nameCell3.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        currentRow++;

        // Position row
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const posCell = worksheet.getCell(`A${currentRow}`);
        posCell.value = removeVietnameseTones(user?.position || '');
        posCell.alignment = { horizontal: 'center', vertical: 'middle' };
        posCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
        worksheet.getCell(`D${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
        worksheet.getCell(`G${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        currentRow += 2;

        // ============ FOOTER ============
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value =
            'This is a computer-generated report - Vista Hotel Management System';
        worksheet.getCell(`A${currentRow}`).font = { italic: true, size: 9 };
        currentRow++;

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(
            `A${currentRow}`,
        ).value = `Page 1 | Generated on ${currentDate}`;
        worksheet.getCell(`A${currentRow}`).font = { size: 8 };
        currentRow++;

        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value =
            'Confidential Document - For Internal Use Only';
        worksheet.getCell(`A${currentRow}`).font = { size: 8 };

        // Định dạng cột
        worksheet.columns = [
            { width: 15 },
            { width: 18 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 15 },
        ];

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}_report_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        setLoading(true);
        try {
            if (!data || (Array.isArray(data) && data.length === 0)) {
                alert('No data available to export');
                return;
            }

            if (format === 'pdf') {
                exportToPDF(data);
            } else {
                exportToExcel(data);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition disabled:opacity-50"
            >
                <FaDownload />
                {loading ? 'Exporting...' : 'Export Report'}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#EBE3D7] z-10">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F0EB] transition"
                    >
                        <FaFilePdf className="text-red-500" />
                        <span>Export as PDF</span>
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F0EB] transition border-t border-[#EBE3D7]"
                    >
                        <FaFileExcel className="text-green-600" />
                        <span>Export as Excel</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
