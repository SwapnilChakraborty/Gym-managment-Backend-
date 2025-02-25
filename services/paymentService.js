import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import doteenv from "dotenv";
doteenv.config();

/**
 * Initiate Payment (Creates a PaymentIntent)
 * @param {Object} booking - Booking details
 * @param {string} paymentMethodId - Stripe Payment Method ID
 */
export const initiatePayment = async (booking, paymentMethodId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.price * 100, // Convert to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirm payment
    });

    return {
      success: true,
      paymentId: paymentIntent.id,
      status: paymentIntent.status,
      message: "Payment initiated successfully",
    };
  } catch (error) {
    return { success: false, message: "Payment initiation failed", error: error.message };
  }
};

/**
 * Process Payment (Alias for initiatePayment)
 * @param {Object} booking - Booking details
 * @param {string} paymentMethodId - Stripe Payment Method ID
 */
export const processPayment = async (booking, paymentMethodId) => {
  return await initiatePayment(booking, paymentMethodId);
};

/**
 * Check Payment Status
 * @param {string} paymentId - Stripe Payment Intent ID
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    return { success: true, status: paymentIntent.status };
  } catch (error) {
    return { success: false, message: "Error fetching payment status", error: error.message };
  }
};

/**
 * Process Refund (Auto Refund on Cancellation)
 * @param {string} paymentId - Stripe Payment Intent ID
 */
export const processRefund = async (paymentId) => {
  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentId });

    return { success: true, refundId: refund.id, message: "Refund processed successfully" };
  } catch (error) {
    return { success: false, message: "Refund failed", error: error.message };
  }
};

