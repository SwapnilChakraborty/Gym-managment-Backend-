import { sendEmail, sendSMS, sendPushNotification } from "../services/notificationService.js";

// Booking Confirmation Notification
export const sendBookingConfirmation = async (user, booking) => {
  const message = `Your booking for ${booking.gymName} on ${booking.timeslot} is confirmed!`;

  await sendEmail(user.email, "Booking Confirmed", message);
  await sendSMS(user.phone, message);
  await sendPushNotification(user.deviceToken, "Booking Confirmed", message);
};

// Payment Reminder Notification
export const sendPaymentReminder = async (user, dueDate) => {
  const message = `Reminder: Your gym payment is due on ${dueDate}. Please make the payment.`;

  await sendEmail(user.email, "Payment Reminder", message);
  await sendSMS(user.phone, message);
  await sendPushNotification(user.deviceToken, "Payment Reminder", message);
};

// Booking Reminder Notification
export const sendBookingReminder = async (user, booking) => {
  const message = `Reminder: Your session at ${booking.gymName} starts at ${booking.timeslot}. Don't be late!`;

  await sendEmail(user.email, "Booking Reminder", message);
  await sendSMS(user.phone, message);
  await sendPushNotification(user.deviceToken, "Booking Reminder", message);
};
