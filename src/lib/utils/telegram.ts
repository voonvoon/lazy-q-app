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

export async function sendLongTelegramMessage(chatId: string, message: string) {
  const chunkSize = 4096;
  for (let i = 0; i < message.length; i += chunkSize) {
    const chunk = message.substring(i, i + chunkSize);
    await sendTelegramMessage(chatId, chunk);
  }
}
