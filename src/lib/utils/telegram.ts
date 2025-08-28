import axios from "axios";

export async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
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
