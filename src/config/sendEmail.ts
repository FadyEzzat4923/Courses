import nodemailer from "nodemailer";

export async function sendEmail(subject: string, html: string): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER as string,
        pass: process.env.GMAIL_PASS as string,
      },
    });

    await transporter.sendMail({
      from: `"Courses" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    throw new Error("Failed to send email");
  }
}
