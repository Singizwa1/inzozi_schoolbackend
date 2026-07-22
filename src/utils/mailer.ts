import sgMail from "@sendgrid/mail";
import ejs from "ejs";
import path from "path";
import {config} from "dotenv";

config();


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateVars: Record<string, any>
) => {
  const templatePath = path.join(__dirname, "../templates", `${templateName}.ejs`);
  const html = await ejs.renderFile(templatePath, templateVars);
  
  await sgMail.send({
    from: process.env.SENDGRID_SENDER_EMAIL as string,
    to,
    subject,
    html,
  });
}