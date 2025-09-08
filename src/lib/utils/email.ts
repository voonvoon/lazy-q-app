import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail({
  to,
  subject,
  html,
  from = "onboarding@resend.dev",
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