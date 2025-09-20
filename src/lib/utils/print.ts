import axios from "axios";

export async function printReceipt(printServerAPI: string, message: string) {
  try {
    const buffer = Buffer.from(message, "utf-8");
    const res = await axios.post(printServerAPI, buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });
    return res.data;
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
}