import Payment from "../models/Payment.js";
import { processPayment, checkPaymentStatus, processRefund } from "../services/paymentService.js";
import Booking from "../models/Booking.js";
// Optionally import Gym if used in getEarnings:
// import Gym from "../models/Gym.js";

// Start Payment (Customer)
export const initiatePayment = async (req, res) => {
  // Expecting bookingId, paymentMethod, and gateway (e.g. "stripe" or "razorpay") in the request body
  const { bookingId, paymentMethod, gateway } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Pass the gateway to your payment service so that the correct provider is used
    const paymentResponse = await processPayment(booking, paymentMethod, gateway);

    if (!paymentResponse.success) {
      return res.status(400).json({ message: "Payment initiation failed", error: paymentResponse.error });
    }

    // Save payment details, including the gateway used
    const payment = new Payment({
      bookingId,
      userId: req.user.userId,
      amount: booking.price,
      paymentId: paymentResponse.paymentId || paymentResponse.orderId, // for Stripe it's paymentId, for Razorpay it might be orderId
      paymentMethod,
      gateway, // store the chosen gateway for future reference
      status: "PENDING",
    });

    await payment.save();
    res.status(201).json({ message: "Payment initiated", paymentDetails: paymentResponse });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Check Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    // Find payment using the provided paymentId from params
    const payment = await Payment.findOne({ paymentId: req.params.id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Use the stored gateway to check status accordingly
    const statusResponse = await checkPaymentStatus(payment.paymentId, payment.gateway);

    res.json({ success: true, status: statusResponse.status });

  } catch (error) {
    res.status(500).json({ message: "Error checking payment status", error: error.message });
  }
};

// Get User Payment History
export const getUserPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment history", error: error.message });
  }
};

// Get Gym Earnings (Vendor)
export const getEarnings = async (req, res) => {
  try {
    // Assuming you have a Gym model to find gyms by vendor
    const gyms = await Booking.find({
      gymId: { $in: await Gym.find({ vendorId: req.user.userId }).distinct("_id") },
    });

    const earnings = await Payment.aggregate([
      { $match: { bookingId: { $in: gyms.map(g => g._id) }, status: "SUCCESS" } },
      { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
    ]);

    res.json({ success: true, totalEarnings: earnings[0]?.totalEarnings || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching earnings", error: error.message });
  }
};
