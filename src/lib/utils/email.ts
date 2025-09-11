import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail({
  to,
  subject,
  html,
  //from = "onboarding@resend.dev",
  from = "receipts@pelicanwebdev.com",
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  return resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo: replyTo,
  });
}

export function buildOrderEmailHtml(
  data: any,
  meta: any,
  orderNumber: string,
  address: any,
  receiptNo?: string,
  merchantCompanyName?: string,
  merchantCompanyRegNo?: string,
  merchantLogoUrl?: string
): string {
  const customer = meta.customerInfo || {};
  const items = meta.cartItems || [];
  const hasTax = meta.totalTax && meta.totalTax > 0;
  const delivery = meta.delivery;
  const hasDelivery = meta.deliveryFee && meta.deliveryFee > 0;
  const hasDiscount = meta.discount && meta.discount.value > 0;

  let itemsHtml = items
    .map(
      (item: any, idx: number) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <strong>${idx + 1}. ${item.title || "-"}</strong>
          ${
            item.remarks
              ? `<div style="color:#888;font-size:12px;">Remarks: ${item.remarks}</div>`
              : ""
          }
          ${
            item.addOns && item.addOns.length > 0
              ? `<div style="font-size:12px;color:#555;">Add-ons: ${item.addOns
                  .map(
                    (a: any) =>
                      `${a.name} (${data.currency} ${
                        a.price?.toFixed(2) || "0.00"
                      })`
                  )
                  .join(", ")}</div>`
              : ""
          }
        </td>
        <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${
          item.quantity || 1
        }</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${
          data.currency
        } ${item.price?.toFixed(2) || "0.00"}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${
          data.currency
        } ${item.itemTotal?.toFixed(2) || "0.00"}</td>
      </tr>
    `
    )
    .join("");

  return `
 <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
  <div style="background:#4f8cff;color:#fff;padding:16px 10px;">
    <div style="text-align:center;">
      ${
        merchantLogoUrl
          ? `<img src="${merchantLogoUrl}" alt="Logo" style="width:56px;height:56px;object-fit:contain;border-radius:8px;background:#fff;box-shadow:0 2px 8px #0001;margin-bottom:10px;" />`
          : ""
      }
      <h2 style="margin:0;font-size:20px;color:#fff;">
        ${merchantCompanyName || meta.merchantData?.name || "-"}
      </h2>
      ${
        merchantCompanyRegNo
          ? `<div style="font-size:14px;font-weight:normal;margin-top:2px;color:#fff;">(${merchantCompanyRegNo})</div>`
          : ""
      }
      <div style="margin-top:2px;font-size:12px;font-weight:400;color:#fff;">
        ${
          address
            ? [
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country,
              ]
                .filter(Boolean)
                .join(", ")
            : ""
        }
      </div>
    </div>
  </div>
    <div style="padding:24px 32px;background:#fafbfc;">
      <table style="width:100%;margin-bottom:16px;">
        <tr>
          <td><strong>Order #:</strong></td>
          <td>${orderNumber}</td>
        </tr>
        ${
          receiptNo
            ? `<tr>
          <td><strong>Receipt No:</strong></td>
          <td>${receiptNo}</td>
        </tr>`
            : ""
        }
        <tr>
          <td><strong>Merchant:</strong></td>
          <td>${meta.merchantData?.name || "-"}</td>
        </tr>
      
        <tr>
          <td><strong>Order ID:</strong></td>
          <td>${data.orderid}</td>
        </tr>
        <tr>
          <td><strong>Order Date:</strong></td>
          <td>${data.paydate}</td>
        </tr>
      </table>
      <h3 style="margin-top:0;">Customer Info</h3>
      <table style="width:100%;margin-bottom:16px;">
        <tr>
          <td><strong>Name:</strong></td>
          <td>${customer.name || "-"}</td>
        </tr>
        ${
          delivery
            ? `
        <tr>
          <td><strong>Delivery Address:</strong></td>
          <td>${customer.address || "-"}</td>
        </tr>
        <tr>
          <td><strong>Postcode:</strong></td>
          <td>${customer.postcode || "-"}</td>
        </tr>
        <tr>
          <td><strong>State:</strong></td>
          <td>${customer.state || "-"}</td>
        </tr>
        <tr>
          <td><strong>Delivery Time:</strong></td>
          <td>${meta.selectedTime || "-"}</td>
        </tr>
        `
            : `
        <tr>
          <td><strong>Self Pick-up Time:</strong></td>
          <td>${meta.selectedTime || "-"}</td>
        </tr>
        `
        }
      </table>
      <h3 style="margin-top:0;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f0f4fa;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Unit Price</th>
            <th style="padding:8px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <table style="width:100%;margin-top:24px;font-size:14px;">
        <tr>
          <td style="text-align:right;"><strong>Subtotal:</strong></td>
          <td style="text-align:right;">${data.currency} ${
    meta.subtotal?.toFixed(2) || "0.00"
  }</td>
        </tr>
        ${
          hasDiscount
            ? `<tr>
                <td style="text-align:right;"><strong>Discount:</strong></td>
                <td style="text-align:right;color:#1aaf5d;">- ${
                  data.currency
                } ${meta.discountAmount?.toFixed(2) || "0.00"}</td>
              </tr>`
            : ""
        }
        ${
          hasTax
            ? `<tr>
                <td style="text-align:right;"><strong>Tax:</strong></td>
                <td style="text-align:right;">${
                  data.currency
                } ${meta.totalTax.toFixed(2)}</td>
              </tr>`
            : ""
        }
        ${
          hasDelivery
            ? `<tr>
                <td style="text-align:right;"><strong>Delivery Fee:</strong></td>
                <td style="text-align:right;">${
                  data.currency
                } ${meta.deliveryFee.toFixed(2)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td colspan="2" style="height:6px;"></td>
        </tr>
        <tr>
          <td style="text-align:right;font-size:18px;"><strong>Total Paid:</strong></td>
          <td style="text-align:right;font-size:18px;"><strong>${
            data.currency
          } ${data.amount}</strong></td>
        </tr>
      </table>
      ${
        meta.remarks
          ? `<div style="margin-top:16px;padding:12px 16px;background:#fffbe6;border-left:4px solid #ffe066;">
              <strong>Remarks:</strong> ${meta.remarks}
            </div>`
          : ""
      }

      <div style="margin-top:32px;text-align:center;">
        <a href="https://lazy-q-app.vercel.app/merchant/${
          meta.merchantData?.slug
        }" 
           style="display:inline-block;padding:12px 28px;background:#4f8cff;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
          View Menu
        </a>
      </div>

      <div style="margin-top:32px;color:#888;font-size:12px;text-align:center;">
        <i>Thank you for shopping with us!<br>
        If you have any questions, reply to this email.</i>
      </div>
    </div>
  </div>
  `;
}
