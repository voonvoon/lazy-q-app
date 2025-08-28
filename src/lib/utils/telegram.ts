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

// export async function sendLongTelegramMessage(chatId: string, message: string) {
//   const chunkSize = 4096;
//   for (let i = 0; i < message.length; i += chunkSize) {
//     const chunk = message.substring(i, i + chunkSize);
//     await sendTelegramMessage(chatId, chunk);
//   }
// }

// export async function sendLongTelegramMessage(chatId: string, message: string) {
//   const chunkSize = 4096;
//   let chunkCount = 0;
//   for (let i = 0; i < message.length; i += chunkSize) {
//     const chunk = message.substring(i, i + chunkSize);
//     chunkCount++;
//     console.log(`Sending chunk ${chunkCount}, length: ${chunk.length}`);
//     try {
//       await sendTelegramMessage(chatId, chunk);
//     } catch (err) {
//       console.error(`Failed to send chunk ${chunkCount}:`, err);
//     }
//   }
//   console.log(`Total chunks sent: ${chunkCount}`);
// }

export async function sendLongTelegramMessage(chatId: string, message: string) {
  const chunkSize = 4096;
  const lines = message.split('\n');
  let chunk = '';
  let chunkCount = 0;

  for (const line of lines) {
    if ((chunk + line + '\n').length > chunkSize) {
      chunkCount++;
      try {
        await sendTelegramMessage(chatId, chunk);
        console.log(`Sent chunk ${chunkCount}, length: ${chunk.length}`);
      } catch (err: any) {
        console.error(`Failed to send chunk ${chunkCount}:`, err?.response?.data || err);
      }
      chunk = '';
    }
    chunk += line + '\n';
  }
  if (chunk.length > 0) {
    chunkCount++;
    try {
      await sendTelegramMessage(chatId, chunk);
      console.log(`Sent chunk ${chunkCount}, length: ${chunk.length}`);
    } catch (err: any) {
      console.error(`Failed to send chunk ${chunkCount}:`, err?.response?.data || err);
    }
  }
  console.log(`Total chunks sent: ${chunkCount}`);
}