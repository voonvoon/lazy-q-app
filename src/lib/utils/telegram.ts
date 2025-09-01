import axios from "axios";

export async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
}

//Avoid Splitting in the middle of Markdown formatting causes Telegram to reject the message.
//Solution: Split on line breaks, not at arbitrary character counts.
//Example:
// *New Order Paid!*
// Order ID: 123
// Amount: 50 USD
// Customer: John
// Items: 2
// Time: 2025-08-29
//lines will give me:
//  [
//   "*New Order Paid!*",
//   "Order ID: 123",
//   "Amount: 50 USD",
//   "Customer: John",
//   "Items: 2",
//   "Time: 2025-08-29",
//   ""
// ]
export async function sendLongTelegramMessage(chatId: string, message: string) {
  const chunkSize = 4096; // Set the maximum allowed message size for Telegram
  const lines = message.split("\n"); // Split the message into lines using newline as separator

  let chunk = ""; // Initialize an empty string to build each chunk
  let chunkCount = 0; // Counter to keep track of how many chunks are sent

  // Loop through each line in the message
  for (const line of lines) {
    // Check if adding this line would make the chunk too big
    if ((chunk + line + "\n").length > chunkSize) {
      chunkCount++; // Increase the chunk counter
      try {
        await sendTelegramMessage(chatId, chunk); // Send the current chunk to Telegram
        console.log(`Sent chunk ${chunkCount}, length: ${chunk.length}`); // Log success
      } catch (err: any) {
        // Log any error that occurs while sending
        console.error(
          `Failed to send chunk ${chunkCount}:`,
          err?.response?.data || err
        );
      }
      chunk = ""; // Reset chunk to start a new one
    }
    chunk += line + "\n"; // Add the current line (with newline) to the chunk
  }

  // After the loop, check if there's any leftover chunk to send
  if (chunk.length > 0) {
    chunkCount++; // Increase the chunk counter
    try {
      await sendTelegramMessage(chatId, chunk); // Send the last chunk
      console.log(`Sent chunk ${chunkCount}, length: ${chunk.length}`); // Log success
    } catch (err: any) {
      // Log any error that occurs while sending
      console.error(
        `Failed to send chunk ${chunkCount}:`,
        err?.response?.data || err
      );
    }
  }
  console.log(`Total chunks sent: ${chunkCount}`); // Log the total number of chunks sent
}

// Build the order message for Telegram
// note that only can use \n for next line not </br>
export function buildOrderMessage(
  data: any,
  meta: any,
  orderNumber: string
): string {
  // Build and return the formatted Telegram message string
  // Use the improved formatting from earlier suggestions
  const customer = meta.customerInfo || {};
  const items = meta.cartItems || [];
  const hasTax = meta.totalTax && meta.totalTax > 0;
  const delivery = meta.delivery;
  const hasDelivery = meta.deliveryFee && meta.deliveryFee > 0;
  const hasDiscount = meta.discount && meta.discount.value > 0;

  let itemsText = "";
  items.forEach((item: any, idx: number) => {
    itemsText += `<b>${idx + 1}. ${item.title || "-"}</b> - <i>${
      data.currency
    } ${item.price?.toFixed(2) || "0.00"}</i>\n`;

    if (item.addOns && item.addOns.length > 0) {
      itemsText += `  <i>Add-ons:</i> ${item.addOns
        .map(
          (a: any) =>
            `<i>${a.name} (${data.currency} ${
              a.price?.toFixed(2) || "0.00"
            })</i>`
        )
        .join(", ")}\n`;
    }

    itemsText += `  Qty: <b>${item.quantity || 1}</b>\n`;
    itemsText += `  Total: <b>${data.currency} ${
      item.itemTotal?.toFixed(2) || "0.00"
    } </b>\n`;

    if (item.remarks) {
      itemsText += `  <i>Remarks: ${item.remarks}</i>\n`;
    }

    itemsText += `\n`;
  });

  let summary = `<b><u>New Order Paid!</u>🎉</b>\n`;
  summary += `<b>Order #:</b> <code>${orderNumber}</code>\n`;
  summary += `<b>Customer:</b> <i>${customer.name || "-"}</i>\n`;
  summary += `<b>Email:</b> <i>${customer.email || "-"}</i>\n`;
  summary += `<b>Phone:</b> <i>${customer.phone || "-"}</i>\n`;
  summary += `<b>Order ID:</b> <code>${data.orderid}</code>\n`;
  //summary += `<b>Time:</b> <code>${meta.selectedTime}</code>\n`;
  if (delivery) {
    summary += `\n`;
   summary += `<b>🚚<u>For Delivery</u></b> - <b>Time:</b> <code>${meta.selectedTime}</code>\n`;
    summary += `<b>Address:</b> <i>${customer.address || "-"}</i>\n`;
    summary += `<b>Postcode:</b> <i>${customer.postcode || "-"}</i>\n`;
    summary += `<b>State:</b> <i>${customer.state || "-"}</i>\n`;
    summary += `\n`;
  } else {
    summary += `\n`;
    summary += `<b>🏃‍♂️<u>Self-Pick Up</u></b> - <b>Time:</b> <code>${meta.selectedTime}</code>\n`;
    summary += `\n`;
  }

  summary += `<b>Items:</b> <b>${items.length}</b>\n`;
  summary += "\n";
  summary += itemsText + "\n";
  summary += `<b>Order on:</b> <code>${data.paydate}</code>\n`;

  // Add Remarks if remarks exists
  if (meta.remarks) {
    summary += `<b>Remarks:</b> <i>${meta.remarks}</i>\n\n`;
  }

  if (meta.subtotal) {
    summary += `<b>Subtotal:</b> ${data.currency} ${meta.subtotal.toFixed(
      2
    )}\n`;
  }

  if (hasDiscount) {
    summary += `<b>Discount:</b> -${data.currency} ${
      meta.discountAmount?.toFixed(2) || "0.00"
    }\n`;
  }

  if (hasTax) {
    summary += `<b>Tax:</b> ${data.currency} ${meta.totalTax.toFixed(2)}\n`;
  }

  if (hasDelivery) {
    summary += `<b>Delivery Fee:</b>${data.currency} ${meta.deliveryFee.toFixed(
      2
    )} \n`;
  }

  summary += `\n<b>Total Paid:</b> <u><b>${data.currency} ${data.amount}</b></u>`;
  return summary;
}
