import Payment from "../models/Payment.js";
import { processPayment, checkPaymentStatus, processRefund } from "../services/paymentService.js";
import Booking from "../models/Booking.js";

// Start Payment (Customer)
export const initiatePayment = async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const paymentResponse = await processPayment(booking, paymentMethod);

    if (!paymentResponse.success) {
      return res.status(400).json({ message: "Payment initiation failed" });
    }

    // Save payment details
    const payment = new Payment({
      bookingId,
      userId: req.user.userId,
      amount: booking.price,
      paymentId: paymentResponse.paymentId,
      paymentMethod,
      status: "PENDING",
    });

    await payment.save();
    res.status(201).json({ message: "Payment initiated", paymentDetails: paymentResponse });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Check Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const statusResponse = await checkPaymentStatus(payment.paymentId);

    res.json({ success: true, status: statusResponse.status });

  } catch (error) {
    res.status(500).json({ message: "Error checking payment status", error });
  }
};

// Get User Payment History
export const getUserPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    res.json({ success: true, payments });

  } catch (error) {
    res.status(500).json({ message: "Error fetching payment history", error });
  }
};

// Get Gym Earnings (Vendor)
export const getEarnings = async (req, res) => {
  try {
    const gyms = await Booking.find({ gymId: { $in: await Gym.find({ vendorId: req.user.userId }).distinct("_id") } });

    const earnings = await Payment.aggregate([
      { $match: { bookingId: { $in: gyms.map(g => g._id) }, status: "SUCCESS" } },
      { $group: { _id: null, totalEarnings: { $sum: "$amount" } } }
    ]);

    res.json({ success: true, totalEarnings: earnings[0]?.totalEarnings || 0 });

  } catch (error) {
    res.status(500).json({ message: "Error fetching earnings", error });
  }
};
