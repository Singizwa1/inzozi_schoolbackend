import { Resend } from "resend";
import ejs from "ejs";
import path from "path";
import {config} from "dotenv";

config();

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateVars: Record<string, any>
) => {
  const templatePath = path.join(__dirname, "../templates", `${templateName}.ejs`);
  const html = await ejs.renderFile(templatePath, templateVars);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL as string,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend failed to send email: ${error.message}`);
}