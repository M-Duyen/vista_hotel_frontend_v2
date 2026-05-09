import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { LoyaltyData, BookingData } from "../types/Report";

/**
 * Xuất báo cáo Loyalty ra PDF
 */
export const exportLoyaltyToPDF = (data: LoyaltyData[], dateRange: string) => {
  const doc = new jsPDF();

  // Thêm tiêu đề
  doc.setFontSize(18);
  doc.text("Loyalty Report", 14, 20);

  // Thêm khoảng thời gian báo cáo
  doc.setFontSize(11);
  doc.text(`Period: ${dateRange}`, 14, 28);

  // Thêm ngày tạo báo cáo
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  // Chuẩn bị dữ liệu bảng
  const tableData = data.map((item) => [
    item.month,
    item.bronze.toString(),
    item.silver.toString(),
    item.gold.toString(),
    item.platinum.toString(),
    (item.bronze + item.silver + item.gold + item.platinum).toString(),
    item.totalPoints.toLocaleString(),
  ]);

  // Thêm bảng
  autoTable(doc, {
    head: [
      [
        "Period",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Total Members",
        "Total Points",
      ],
    ],
    body: tableData,
    startY: 40,
    theme: "grid",
    headStyles: {
      fillColor: [204, 189, 163], // #CCBDA3
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
      6: { halign: "right", fontStyle: "bold" },
    },
  });

  // Thêm phần tổng kết
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  const totalMembers = data.reduce(
    (sum, item) => sum + item.bronze + item.silver + item.gold + item.platinum,
    0
  );
  const totalPoints = data.reduce((sum, item) => sum + item.totalPoints, 0);

  doc.setFontSize(10);
  doc.text(
    `Total Members (All Periods): ${totalMembers.toLocaleString()}`,
    14,
    finalY + 10
  );
  doc.text(
    `Total Points (All Periods): ${totalPoints.toLocaleString()}`,
    14,
    finalY + 17
  );

  // Save PDF
  doc.save(`Loyalty_Report_${new Date().getTime()}.pdf`);
};

/**
 * Xuất báo cáo Loyalty ra Excel
 */
export const exportLoyaltyToExcel = (
  data: LoyaltyData[],
  dateRange: string
) => {
  // Chuẩn bị dữ liệu worksheet
  const worksheetData = [
    ["Loyalty Report"],
    [`Period: ${dateRange}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [], // Empty row
    [
      "Period",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Total Members",
      "Total Points",
      "Redemptions",
    ],
    ...data.map((item) => [
      item.month,
      item.bronze,
      item.silver,
      item.gold,
      item.platinum,
      item.bronze + item.silver + item.gold + item.platinum,
      item.totalPoints,
      item.redemptions,
    ]),
    [], // Empty row
    [
      "Summary",
      "",
      "",
      "",
      "",
      data.reduce(
        (sum, item) =>
          sum + item.bronze + item.silver + item.gold + item.platinum,
        0
      ),
      data.reduce((sum, item) => sum + item.totalPoints, 0),
      data.reduce((sum, item) => sum + item.redemptions, 0),
    ],
  ];

  // Tạo worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Đặt độ rộng cột
  ws["!cols"] = [
    { wch: 15 }, // Period
    { wch: 10 }, // Bronze
    { wch: 10 }, // Silver
    { wch: 10 }, // Gold
    { wch: 10 }, // Platinum
    { wch: 15 }, // Total Members
    { wch: 15 }, // Total Points
    { wch: 12 }, // Redemptions
  ];

  // Kiểu hàng tiêu đề (hàng 5, index 4)
  const headerRow = 4;
  for (let col = 0; col < 8; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCBDA3" } },
      alignment: { horizontal: "center" },
    };
  }

  // Tạo workbook và thêm worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Loyalty Report");

  // Lưu file Excel
  XLSX.writeFile(wb, `Loyalty_Report_${new Date().getTime()}.xlsx`);
};

/**
 * Xuất bất kỳ dữ liệu báo cáo nào ra PDF (chung)
 */
export const exportGenericToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  dateRange: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(11);
  doc.text(`Period: ${dateRange}`, 14, 28);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 40,
    theme: "grid",
    headStyles: {
      fillColor: [204, 189, 163],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  doc.save(`${title.replace(/\s/g, "_")}_${new Date().getTime()}.pdf`);
};

/**
 * Xuất bất kỳ dữ liệu báo cáo nào ra Excel (chung)
 */
export const exportGenericToExcel = (
  title: string,
  headers: string[],
  data: any[][],
  dateRange: string,
  sheetName: string = "Report"
) => {
  const worksheetData = [
    [title],
    [`Period: ${dateRange}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    headers,
    ...data,
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(
    wb,
    `${title.replace(/\s/g, "_")}_${new Date().getTime()}.xlsx`
  );
};

/**
 * Xuất báo cáo Booking ra PDF
 */
export const exportBookingToPDF = (data: BookingData[], dateRange: string) => {
  const doc = new jsPDF();

  // Thêm tiêu đề
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Report", 14, 20);

  // Thêm khoảng thời gian báo cáo
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${dateRange}`, 14, 28);

  // Thêm ngày tạo báo cáo
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  // Chuẩn bị dữ liệu bảng
  const tableData = data.map((item) => [
    item.period,
    item.totalBookings,
    item.completedBookings,
    item.cancelledBookings,
    item.cancellationRate.toFixed(2) + "%",
    item.totalRevenue.toLocaleString("vi-VN"),
    item.averageBookingValue.toLocaleString("vi-VN"),
  ]);

  // Thêm bảng
  autoTable(doc, {
    head: [
      [
        "Period",
        "Total",
        "Completed",
        "Cancelled",
        "Cancel Rate",
        "Total Revenue (VND)",
        "Avg Value (VND)",
      ],
    ],
    body: tableData,
    startY: 40,
    theme: "grid",
    headStyles: {
      fillColor: [204, 189, 163], // #CCBDA3
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      font: "helvetica",
    },
    columnStyles: {
      0: { cellWidth: 28, halign: "left" },
      1: { cellWidth: 20, halign: "right" },
      2: { cellWidth: 24, halign: "right" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 35, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 35, halign: "right" },
    },
  });

  // Thêm phần tổng kết
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  const totalBookings = data.reduce((sum, item) => sum + item.totalBookings, 0);
  const totalCompleted = data.reduce(
    (sum, item) => sum + item.completedBookings,
    0
  );
  const totalCancelled = data.reduce(
    (sum, item) => sum + item.cancelledBookings,
    0
  );
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const avgCancelRate =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.cancellationRate, 0) / data.length
      : 0;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary:", 14, finalY + 12);

  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Bookings (All Periods): ${totalBookings.toLocaleString()}`,
    14,
    finalY + 20
  );
  doc.text(
    `Total Completed: ${totalCompleted.toLocaleString()}`,
    14,
    finalY + 27
  );
  doc.text(
    `Total Cancelled: ${totalCancelled.toLocaleString()}`,
    14,
    finalY + 34
  );
  doc.text(
    `Average Cancellation Rate: ${avgCancelRate.toFixed(2)}%`,
    14,
    finalY + 41
  );
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Revenue: ${totalRevenue.toLocaleString("vi-VN")} VND`,
    14,
    finalY + 48
  );

  // Save PDF
  doc.save(`Booking_Report_${new Date().getTime()}.pdf`);
};

/**
 * Xuất báo cáo Booking ra Excel
 */
export const exportBookingToExcel = (
  data: BookingData[],
  dateRange: string
) => {
  // Chuẩn bị dữ liệu worksheet
  const worksheetData = [
    ["Booking Report"],
    [`Period: ${dateRange}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [], // Empty row
    [
      "Period",
      "Total Bookings",
      "Completed",
      "Cancelled",
      "Cancel Rate (%)",
      "Total Revenue (VNĐ)",
      "Average Value (VNĐ)",
    ],
    ...data.map((item) => [
      item.period,
      item.totalBookings,
      item.completedBookings,
      item.cancelledBookings,
      item.cancellationRate,
      item.totalRevenue,
      item.averageBookingValue,
    ]),
    [], // Empty row
    [
      "Summary",
      data.reduce((sum, item) => sum + item.totalBookings, 0),
      data.reduce((sum, item) => sum + item.completedBookings, 0),
      data.reduce((sum, item) => sum + item.cancelledBookings, 0),
      data.length > 0
        ? (
            data.reduce((sum, item) => sum + item.cancellationRate, 0) /
            data.length
          ).toFixed(2)
        : 0,
      data.reduce((sum, item) => sum + item.totalRevenue, 0),
      data.length > 0
        ? Math.round(
            data.reduce((sum, item) => sum + item.averageBookingValue, 0) /
              data.length
          )
        : 0,
    ],
  ];

  // Tạo worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Đặt độ rộng cột
  ws["!cols"] = [
    { wch: 15 }, // Period
    { wch: 15 }, // Total Bookings
    { wch: 12 }, // Completed
    { wch: 12 }, // Cancelled
    { wch: 15 }, // Cancel Rate
    { wch: 20 }, // Total Revenue
    { wch: 20 }, // Average Value
  ];

  // Kiểu hàng tiêu đề (hàng 5, index 4)
  const headerRow = 4;
  for (let col = 0; col < 7; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCBDA3" } },
      alignment: { horizontal: "center" },
    };
  }

  // Tạo workbook và thêm worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Booking Report");

  // Lưu file Excel
  XLSX.writeFile(wb, `Booking_Report_${new Date().getTime()}.xlsx`);
};
