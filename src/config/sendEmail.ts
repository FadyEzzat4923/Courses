import nodemailer from "nodemailer";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER as string,
        pass: process.env.GMAIL_PASS as string,
      },
    });

    await transporter.sendMail({
      from: `"MWD" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error("Failed to send email");
  }
}
