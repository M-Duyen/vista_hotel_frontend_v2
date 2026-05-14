export interface VoucherEmailTemplateData {
  customerName?: string;
  eventName: string;
  voucherId: string;
  voucherName?: string;
  discount: string;
  endDate?: string;
}

export const voucherAssignedEmailTemplate = ({
  customerName = "Valued customer",
  eventName,
  voucherId,
  voucherName,
  discount,
  endDate,
}: VoucherEmailTemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Your Vista Hotel Voucher</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#6b5430;padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">Vista Hotel Voucher</h1>
              <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                A special voucher has been added to your account.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px;color:#333333;font-size:14px;line-height:1.6;">
              <p>Hello <strong>${customerName}</strong>,</p>
              <p>We have sent you a voucher for <strong>${eventName}</strong>.</p>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin:20px 0;border:1px solid #eadfce;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="background:#f8f4ed;padding:16px 20px;">
                    <div style="font-size:12px;color:#8a775d;text-transform:uppercase;letter-spacing:.08em;">Voucher Code</div>
                    <div style="font-size:28px;font-weight:bold;color:#6b5430;margin-top:4px;">${voucherId}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    ${voucherName ? `<p style="margin:0 0 8px;"><strong>${voucherName}</strong></p>` : ""}
                    <p style="margin:0 0 8px;">Discount: <strong>${discount}</strong></p>
                    ${endDate ? `<p style="margin:0;">Valid until: <strong>${endDate}</strong></p>` : ""}
                  </td>
                </tr>
              </table>

              <p style="text-align:center;margin:24px 0;">
                <a href="http://localhost:5173/customer/promotion-and-voucher"
                   style="background:#6b5430;color:#ffffff;text-decoration:none;padding:12px 28px;
                          border-radius:999px;font-weight:bold;display:inline-block;font-size:14px;">
                  View my vouchers
                </a>
              </p>
            </td>
          </tr>

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
