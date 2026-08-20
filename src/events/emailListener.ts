
import { emailEmitter } from "./emailEvent";
import { sendEmail } from "../utils/mailer";

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const loginUrl = `${FRONTEND_URL}/login`;
const resetUrl = `${FRONTEND_URL}/reset`;
const trackUrl = (code: string) => `${FRONTEND_URL}/track?ref=${encodeURIComponent(code)}`;
const applicationsUrl = `${FRONTEND_URL}/schoolAdmin/application`;

emailEmitter.on("sendResetCode", async (email: string, code: string) => {
  try {
    await sendEmail(
      email,
      "Password Reset Request",
      "resetPassword",
      { resetCode: code, resetUrl }
    );
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
});

emailEmitter.on("schoolApproved", async (manager: { email: string; firstName: string }, school: { schoolName: string; approvedAt: Date }) => {
  try {
    await sendEmail(
      manager.email,
      "Your school has been approved!",
      "schoolApproval", // schoolApproval.ejs
      {
        managerName: manager.firstName,
        schoolName: school.schoolName,
        approvedAt: school.approvedAt,
        loginUrl,
      }
    );
    console.log(`School approval email sent to ${manager.email}`);
  } catch (err) {
    console.error("Error sending school approval email:", err);
  }
});
emailEmitter.on(
  "schoolRejected",
  async (
    manager: { email: string; firstName: string },
    school: { schoolName: string; approvedAt: Date },
    reason: string
  ) => {
    try {
      await sendEmail(
        manager.email,
        "Your school registration has been rejected",
        "schoolRejection", 
        {
          managerName: manager.firstName,
          schoolName: school.schoolName,
          rejectedAt: school.approvedAt,
          reason,
          loginUrl,
        }
      );
      console.log(`School rejection email sent to ${manager.email}`);
    } catch (err) {
      console.error("Error sending school rejection email:", err);
    }
  }
);
emailEmitter.on("admissionManagerCreated", async(payload:{email:string,name:string,password:string,schoolName:string})=>{
  try{
    await sendEmail(
      payload.email,
      "Your Admission Manager Account Details",
      "admissionManager",
      {
        name:payload.name,
        schoolName:payload.schoolName,
        password:payload.password,
        email:payload.email,
        loginUrl,
      }
    )
    console.log(`Admission Manager account email sent to ${payload.email}`);
  } catch(err){
    console.error("Error sending Admission Manager account email:", err);
  }   
}
);


emailEmitter.on('newApplication', async ({ parentEmail, studentName, schoolName, trackingCode }) => {
  try {
    await sendEmail(parentEmail, 'Application Received', 'newApplication', {
      studentName,
      schoolName,
      trackingCode,
      trackUrl: trackUrl(trackingCode),
    });
  } catch (err) {
    console.error('Error sending parent email:', err);
  }
});

emailEmitter.on('notifyManager', async ({ managerEmail, studentName, schoolName }) => {
  try {
    await sendEmail(managerEmail, 'New Student Application', 'managerNotification', {
      studentName,
      schoolName,
      applicationsUrl,
    });
  } catch (err) {
    console.error('Error sending manager email:', err);
  }
});
emailEmitter.on('studentApplicationApproved', async ({ parentEmail, studentName, babyeyiUrl, trackingCode }) => {
  try {
    await sendEmail(
      parentEmail,
      'Your student application has been approved!',
      'studentApproved', // ejs template
      { studentName, babyeyiUrl, trackUrl: trackUrl(trackingCode) }
    );
    console.log(`Approved email sent to ${parentEmail}`);
  } catch (err) {
    console.error('Error sending approved email:', err);
  }
});
emailEmitter.on('studentApplicationRejected', async ({ parentEmail, studentName, reason, trackingCode }) => {
  try {
    await sendEmail(
      parentEmail,
      'Your student application has been rejected',
      'studentRejected',
      { studentName, reason, trackUrl: trackUrl(trackingCode) }
    );
    console.log(`Rejection email sent to ${parentEmail}`);
  } catch (err) {
    console.error('Error sending rejection email:', err);
  }
});