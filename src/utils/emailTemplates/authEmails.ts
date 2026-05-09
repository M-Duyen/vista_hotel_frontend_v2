export const registerSuccessEmail = (fullName: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Đăng ký thành công - Vista Hotel</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" 
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#6b5430;padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">Chào mừng đến với VISTA HOTEL</h1>
              <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                Cảm ơn bạn đã đăng ký tài khoản.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;color:#333333;font-size:14px;line-height:1.6;">
              <p>Xin chào <strong>${fullName}</strong>,</p>
              <p>
                Tài khoản của bạn tại <strong>VISTA HOTEL</strong> đã được tạo thành công.
                Từ bây giờ, bạn có thể: 
              </p>
              <ul style="padding-left:18px;margin:8px 0;">
                <li>Đặt phòng nhanh chóng và dễ dàng.</li>
                <li>Nhận ưu đãi độc quyền dành cho thành viên.</li>
                <li>Theo dõi lịch sử đặt phòng và điểm tích luỹ.</li>
              </ul>
              <p style="margin-top:16px;">
                Nhấn vào nút bên dưới để đăng nhập ngay:
              </p>
              <p style="text-align:center;margin:24px 0;">
                <a href="http://localhost:5173/auth/login"
                   style="background:#6b5430;color:#ffffff;text-decoration:none;padding:12px 32px;
                          border-radius:999px;font-weight:bold;display:inline-block;font-size:14px;">
                  Đăng nhập ngay
                </a>
              </p>
              <p style="font-size:12px;color:#777777;margin-top:16px;">
                Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email này.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f2eee7;padding:16px 32px;text-align:center;font-size:12px;color:#777777;">
              © ${new Date().getFullYear()} VISTA HOTEL. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const loginWelcomeBackEmail = (fullName: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Chào mừng trở lại - Vista Hotel</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#6b5430;padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">Rất vui được gặp lại bạn!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;color:#333333;font-size:14px;line-height:1.6;">
              <p>Xin chào <strong>${fullName}</strong>,</p>
              <p>
                Cảm ơn bạn đã đăng nhập lại vào <strong>VISTA HOTEL</strong>.  
                Đừng quên kiểm tra các ưu đãi và voucher hiện có dành cho bạn nhé.
              </p>
              <p style="margin-top:16px;">
                Chúc bạn có trải nghiệm đặt phòng thật tuyệt vời cùng chúng tôi!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f2eee7;padding:16px 32px;text-align:center;font-size:12px;color:#777777;">
              Đây là email tự động, vui lòng không trả lời lại email này.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const otpEmailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; padding:20px; background:#f8f5f0;">
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="color:#c3923c;">Vista Hotel</h2>
      <p style="font-size:14px;">Mã xác thực đặt lại mật khẩu của bạn</p>
    </div>

    <div style="text-align:center; margin:30px 0;">
      <div style="font-size:32px; font-weight:bold; letter-spacing:10px; color:#c3923c;">
        ${otp}
      </div>
    </div>

    <p>Mã OTP có hiệu lực trong <b>5 phút</b>.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>

    <hr style="margin-top:30px; border:none; border-top:1px solid #ddd;" />

    <p style="font-size:12px; color:#999; text-align:center;">
      © Vista Hotel – Hệ thống đặt phòng & chăm sóc khách hàng
    </p>
  </div>
`;

export const passwordChangedTemplate = (name: string) => `
  <div style="font-family:Arial;padding:20px;">
    <h2 style="color:#c3923c;">Xin chào ${name},</h2>
    <p>Mật khẩu tài khoản Vista Hotel của bạn đã được thay đổi thành công.</p>
    <p>Nếu bạn KHÔNG thực hiện hành động này, vui lòng liên hệ ngay với bộ phận hỗ trợ.</p>

    <div style="margin-top:20px;padding:15px;background:#f6f2e8;border-left:4px solid #c3923c;">
      <p><strong>Vista Hotel Security Team</strong></p>
    </div>
  </div>
`;

export const sendBookingOfCheckoutTemplate = (name: string) => `
  <div style="font-family:Arial;padding:20px;">
    <h2 style="color:#c3923c;">Xin chào ${name},</h2>
    <p>Mật khẩu tài khoản Vista Hotel của bạn đã được thay đổi thành công.</p>
    <p>Nếu bạn KHÔNG thực hiện hành động này, vui lòng liên hệ ngay với bộ phận hỗ trợ.</p>

    <div style="margin-top:20px;padding:15px;background:#f6f2e8;border-left:4px solid #c3923c;">
      <p><strong>Vista Hotel Security Team</strong></p>
    </div>
  </div>
`;

export const confirmBookingEmail = (
  fullName: string,
  bookingID?: string,
  checkInDate?: string,
  checkOutDate?: string,
  totalAmount?: number,
  roomDetails?: string[]
) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Xác nhận đặt phòng - Vista Hotel</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" 
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header với icon checkmark -->
          <tr>
            <td style="background:linear-gradient(135deg, #6b5430 0%, #8b7355 100%);padding:32px;text-align:center;color:#ffffff;">
              <div style="width:64px;height:64px;background:#ffffff;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b5430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h1 style="margin:0;font-size:28px;font-weight:bold;">Đặt phòng thành công!</h1>
              <p style="margin:12px 0 0;font-size:15px;opacity:0.95;">
                Cảm ơn bạn đã tin tưởng Vista Hotel
              </p>
            </td>
          </tr>

          <!-- Booking Info -->
          <tr>
            <td style="padding:32px;color:#333333;font-size:14px;line-height:1.6;">
              <p style="font-size:16px;margin:0 0 24px;">
                Xin chào <strong style="color:#6b5430;">${fullName}</strong>,
              </p>
              
              <p style="margin:0 0 24px;">
                Chúng tôi rất vui thông báo rằng đặt phòng của bạn đã được xác nhận thành công. 
                Dưới đây là thông tin chi tiết về đơn đặt phòng của bạn:
              </p>

              ${
                bookingID
                  ? `
              <!-- Booking Details Card -->
              <div style="background:#f8f5f0;border-left:4px solid #6b5430;padding:20px;border-radius:8px;margin:24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#666;font-size:13px;">Mã đặt phòng</span><br/>
                      <strong style="font-size:18px;color:#6b5430;">${bookingID}</strong>
                    </td>
                  </tr>
                  ${
                    checkInDate
                      ? `
                  <tr>
                    <td style="padding:8px 0;border-top:1px solid #e0d8cc;">
                      <span style="color:#666;font-size:13px;">Ngày nhận phòng</span><br/>
                      <strong style="font-size:15px;color:#333;">${checkInDate}</strong>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    checkOutDate
                      ? `
                  <tr>
                    <td style="padding:8px 0;border-top:1px solid #e0d8cc;">
                      <span style="color:#666;font-size:13px;">Ngày trả phòng</span><br/>
                      <strong style="font-size:15px;color:#333;">${checkOutDate}</strong>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    roomDetails && roomDetails.length > 0
                      ? `
                  <tr>
                    <td style="padding:8px 0;border-top:1px solid #e0d8cc;">
                      <span style="color:#666;font-size:13px;">Phòng đã đặt</span><br/>
                      ${roomDetails
                        .map(
                          (room) =>
                            `<strong style="font-size:15px;color:#333;display:block;margin-top:4px;">• ${room}</strong>`
                        )
                        .join("")}
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    totalAmount
                      ? `
                  <tr>
                    <td style="padding:12px 0;border-top:2px solid #6b5430;">
                      <span style="color:#666;font-size:13px;">Tổng thanh toán</span><br/>
                      <strong style="font-size:20px;color:#6b5430;">${totalAmount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</strong>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </div>
              `
                  : ""
              }

              <!-- Important Notes -->
              <div style="background:#fff8e1;border-radius:8px;padding:16px;margin:24px 0;">
                <p style="margin:0 0 12px;font-weight:bold;color:#f57c00;">
                  📌 Lưu ý quan trọng:
                </p>
                <ul style="margin:0;padding-left:20px;color:#666;font-size:13px;line-height:1.8;">
                  <li>Vui lòng mang theo CMND/CCCD khi check-in</li>
                  <li>Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00</li>
                  <li>Liên hệ lễ tân nếu cần hỗ trợ thêm</li>
                  <li>Kiểm tra email này để biết mã đặt phòng khi check-in</li>
                </ul>
              </div>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5173/customer/mybooking${
                      bookingID ? `/${bookingID}` : ""
                    }"
                       style="background:#6b5430;color:#ffffff;text-decoration:none;padding:14px 32px;
                              border-radius:8px;font-weight:bold;display:inline-block;font-size:14px;
                              box-shadow:0 2px 8px rgba(107,84,48,0.3);">
                      Xem chi tiết đặt phòng
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 8px;font-size:13px;color:#666;">
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi:
              </p>
              <p style="margin:0;font-size:13px;color:#666;">
                📞 Hotline: <strong style="color:#6b5430;">1900 xxxx</strong><br/>
                📧 Email: <strong style="color:#6b5430;">support@vistahotel.com</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f2eee7;padding:20px 32px;text-align:center;font-size:12px;color:#777777;">
              <p style="margin:0 0 8px;">
                Chúng tôi rất mong được phục vụ bạn tại Vista Hotel
              </p>
              <p style="margin:0;">
                © ${new Date().getFullYear()} VISTA HOTEL. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
export const bookingReceipt = (paymentData: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn thanh toán - ${paymentData.bookingId}</title>
    <style>
        @page {
            size: A5;
            margin: 10mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            max-width: 148mm;
            margin: 0 auto;
            padding: 10px;
            line-height: 1.4;
            font-size: 11px;
        }
        
        .logo-container {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #6b5430;
            font-family: Georgia, serif;
            font-style: italic;
        }
        
        .invoice-header {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
        }
        
        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .invoice-number {
            font-size: 10px;
            color: #666;
            text-align: right;
        }
        
        .invoice-info {
            margin: 15px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .invoice-info div {
            display: flex;
            justify-content: space-between;
            padding: 6px 8px;
            background-color: #f5f5f5;
            border-radius: 3px;
            gap: 15px;
        }
        
        .invoice-info .label {
            font-weight: bold;
            white-space: nowrap;
            min-width: 90px;
        }
        
        .invoice-info .value {
            text-align: right;
            flex: 1;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
        }
        
        table thead {
            background-color: #333;
            color: white;
        }
        
        table th, table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        
        table th {
            font-weight: bold;
            font-size: 10px;
        }
        
        table td.number {
            text-align: right;
        }
        
        table td.center {
            text-align: center;
        }
        
        .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        
        .payment-row {
            background-color: #e8f5e9;
            font-weight: bold;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            margin-bottom: 20px;
        }
        
        .signature-box {
            text-align: center;
            width: 45%;
        }
        
        .signature-box p {
            margin: 3px 0;
            font-size: 10px;
            font-weight: bold;
        }
        
        .signature-name {
            font-size: 9px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
        
        .signature-line {
            margin-top: 30px;
            border-top: 1px solid #333;
            padding-top: 3px;
        }
        
        .footer-info {
            text-align: center;
            font-size: 10px;
            color: #555;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
        
        .footer-info p {
            margin: 2px 0;
        }
        
        .notes-section {
            margin-top: 20px;
            padding: 10px;
            background-color: #fff9e6;
            border: 1px solid #f0e68c;
            border-radius: 3px;
            font-size: 9px;
        }
        
        .notes-section h3 {
            margin: 0 0 6px 0;
            font-size: 10px;
            color: #856404;
        }
        
        .notes-section ul {
            margin: 3px 0;
            padding-left: 15px;
            color: #856404;
        }
        
        .notes-section li {
            margin: 3px 0;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="logo-container">
        <div class="logo-text">Vista Hotel</div>
    </div>
    
    <div class="invoice-header">
        <div class="invoice-title">Hóa Đơn</div>  
    </div>
    
    <div class="invoice-info">
        <div>
            <span class="label">Số hóa đơn:</span>
            <span class="value">${paymentData.bookingId}</span>
        </div>
        <div>
            <span class="label">Ngày đặt phòng:</span>
            <span class="value">${formatDate(paymentData.bookingDate)}</span>
        </div>
        <div>
            <span class="label">Khách hàng:</span>
            <span class="value">${paymentData.guestName}</span>
        </div>
        <div>
            <span class="label">Phòng:</span>
            <span class="value">${paymentData.roomNumber}</span>
        </div>
        <div>
            <span class="label">Check-in dự kiến:</span>
            <span class="value">${formatDate(paymentData.checkInDate)}</span>
        </div>
        <div>
            <span class="label">Check-out dự kiến:</span>
            <span class="value">${formatDate(paymentData.checkOutDate)}</span>
        </div>
        ${
          paymentData.actualCheckInTime
            ? `
        <div>
            <span class="label">Check-in thực tế:</span>
            <span class="value">${formatDate(
              paymentData.actualCheckInTime
            )}</span>
        </div>`
            : ""
        }
        ${
          paymentData.actualCheckOutTime
            ? `
        <div>
            <span class="label">Check-out thực tế:</span>
            <span class="value">${formatDate(
              paymentData.actualCheckOutTime
            )}</span>
        </div>`
            : ""
        }
    </div>
    
    <table>
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Nội dung</th>
                <th class="center" style="width: 60px;">SL</th>
                <th class="number" style="width: 80px;">Đơn giá</th>
                <th class="number" style="width: 90px;">Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="center">1</td>
                <td>
                    <div><strong>Tiền phòng</strong></div>
                    <div style="font-size: 9px; color: #666;">Phòng ${
                      paymentData.roomNumber
                    }</div>
                </td>
                <td class="center">1</td>
                <td class="number">${paymentData.totalAmount}</td>
                <td class="number">${paymentData.totalAmount}</td>
            </tr>
            <tr class="total-row">
                <td colspan="4" style="text-align: right; padding-right: 10px;">Tổng tiền</td>
                <td class="number">${paymentData.totalAmount}</td>
            </tr>
            <tr class="payment-row">
                <td colspan="4" style="text-align: right; padding-right: 10px;">Thanh toán</td>
                <td class="number">${paymentData.balanceDue}</td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: right; padding-right: 10px; font-weight: bold;">Số tiền còn lại</td>
                <td class="number" style="font-weight: bold;">${
                  paymentData.balanceDue
                }</td>
            </tr>
        </tbody>
    </table>

    <div class="signature-section">
        <div class="signature-box">
            <p>Lễ tân</p>
            <div class="signature-name">
              ${paymentData.employeeName}
            </div>
        </div>
        <div class="signature-box">
            <p>Khách hàng</p>
            <div class="signature-name">${paymentData.guestName}</div>
        </div>
    </div>
    
    <div class="footer-info">
        <p><strong>Vista Hotel - Premium Hotel</strong></p>
        <p>112 Nguyễn Văn Trỗi, quận 2</p>
        <p><strong>T:</strong> +84 98 348 06 83 | <strong>E:</strong> vistahotel@gmail.com</p>
        <p>www.vistahotel.com</p>
    </div>
    
    <div class="notes-section">
        <h3>Lưu ý:</h3>
        <ul>
            <li><strong>Chính sách dành cho trẻ em và khách bổ sung (không bao gồm giường phụ):</strong></li>
            <li>• Trẻ em dưới 5 tuổi: miễn phí. Tối đa 1 trẻ/phòng. Trẻ em thứ 2 trở đi phụ thu 70.000đ/trẻ/phòng/đêm.</li>
            <li>• Trẻ em từ 6-11 tuổi phụ thu 150.000đ/trẻ/phòng/đêm.</li>
        </ul>
    </div>
</body>
</html>
        `;
};
