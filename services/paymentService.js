import Stripe from "stripe";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

// Check that the Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is missing in environment variables");
}

// Initialize Stripe with API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Initiate Payment
 * @param {Object} booking - Booking details (must have `price`)
 * @param {string} paymentMethodId - Stripe Payment Method ID (used only if gateway === 'stripe')
 * @param {string} [gateway='stripe'] - 'stripe' or 'razorpay'
 */
export const initiatePayment = async (booking, paymentMethodId, gateway = "stripe") => {
  try {
    // Price in smallest currency unit: Stripe (cents), Razorpay (paise)
    const amountInSmallestUnit = booking.price * 100;

    if (gateway === "stripe") {
      // ============== STRIPE FLOW ==============
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: "usd", // or 'inr', etc.
        payment_method: paymentMethodId,
        confirm: true, // automatically confirm
      });

      return {
        success: true,
        gateway: "stripe",
        paymentId: paymentIntent.id,
        status: paymentIntent.status,
        message: "Payment initiated successfully (Stripe)",
      };
    } else if (gateway === "razorpay") {
      // ============== RAZORPAY FLOW ==============
      // Create an order in Razorpay
      const order = await razorpay.orders.create({
        amount: amountInSmallestUnit,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        payment_capture: 1, // auto-capture after successful payment
      });

      return {
        success: true,
        gateway: "razorpay",
        orderId: order.id, // pass this order.id to the frontend
        status: "created",
        message: "Payment initiated successfully (Razorpay)",
      };
    } else {
      // Unsupported gateway
      return {
        success: false,
        message: `Unsupported gateway: ${gateway}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Payment initiation failed",
      error: error.message,
    };
  }
};

/**
 * Process Payment
 * (For Stripe, this might just call `initiatePayment` again,
 * but for Razorpay you usually confirm on the frontend and verify on the backend.)
 * @param {Object} booking
 * @param {string} paymentMethodId - For Stripe
 * @param {string} [gateway='stripe']
 */
export const processPayment = async (booking, paymentMethodId, gateway = "stripe") => {
  // For simplicity, we’ll just reuse initiatePayment
  return await initiatePayment(booking, paymentMethodId, gateway);
};

/**
 * Check Payment Status
 * @param {string} paymentId - For Stripe: Payment Intent ID; For Razorpay: Payment ID or Order ID
 * @param {string} [gateway='stripe']
 */
export const checkPaymentStatus = async (paymentId, gateway = "stripe") => {
  try {
    if (gateway === "stripe") {
      // ============== STRIPE FLOW ==============
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      return {
        success: true,
        gateway: "stripe",
        status: paymentIntent.status,
      };
    } else if (gateway === "razorpay") {
      // ============== RAZORPAY FLOW ==============
      // For Razorpay, fetch payment details using razorpay.payments.fetch.
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        gateway: "razorpay",
        status: payment.status,
      };
    } else {
      return { success: false, message: `Unsupported gateway: ${gateway}` };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    };
  }
};

/**
 * Process Refund
 * @param {string} paymentId - Stripe Payment Intent ID or Razorpay Payment ID
 * @param {number} [refundAmount] - optional partial refund amount
 * @param {string} [gateway='stripe']
 */
export const processRefund = async (paymentId, refundAmount, gateway = "stripe") => {
  try {
    if (gateway === "stripe") {
      // ============== STRIPE REFUND ==============
      const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        amount: refundAmount ? refundAmount * 100 : undefined, // in cents
      });
      return {
        success: true,
        gateway: "stripe",
        refundId: refund.id,
        message: "Refund processed successfully (Stripe)",
      };
    } else if (gateway === "razorpay") {
      // ============== RAZORPAY REFUND ==============
      // In Razorpay, you typically refund a "paymentId" (e.g., pay_xxx).
      const refund = await razorpay.payments.refund(paymentId, {
        amount: refundAmount ? refundAmount * 100 : undefined, // in paise
      });
      return {
        success: true,
        gateway: "razorpay",
        refundId: refund.id,
        message: "Refund processed successfully (Razorpay)",
      };
    } else {
      return { success: false, message: `Unsupported gateway: ${gateway}` };
    }
  } catch (error) {
    return {
      success: false,
      message: "Refund failed",
      error: error.message,
    };
  }
};
