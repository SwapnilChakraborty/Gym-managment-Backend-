import nodemailer from "nodemailer";
import twilio from "twilio";
import admin from "firebase-admin"; 
import dotenv from "dotenv";

dotenv.config();

// Twilio Setup (for SMS & WhatsApp)
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Firebase Setup (for Push Notifications)
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
});

// Send Email Notification
export const sendEmail = async (to, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

// Send SMS/WhatsApp Notification
export const sendSMS = async (to, message, isWhatsApp = false) => {
  try {
    const options = {
      body: message,
      from: isWhatsApp ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}` : process.env.TWILIO_PHONE_NUMBER,
      to: isWhatsApp ? `whatsapp:${to}` : to,
    };

    await twilioClient.messages.create(options);
    console.log(`SMS/WhatsApp sent to ${to}`);
  } catch (error) {
    console.error("SMS/WhatsApp sending failed:", error);
  }
};

// Send Push Notification
export const sendPushNotification = async (token, title, body) => {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
    });

    console.log("Push notification sent");
  } catch (error) {
    console.error("Push notification failed:", error);
  }
};
