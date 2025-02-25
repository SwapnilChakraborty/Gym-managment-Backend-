import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import Payment from "../models/Payment.js";
import { initiatePayment, processRefund } from "../services/paymentService.js"; // Fixed import

// Create a Booking (Customer)
export const createBooking = async (req, res) => {
  const { gymId, timeslot, paymentMethod } = req.body;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    // Set booking price (Assuming gym model has a price field)
    const price = gym.price || 500; // Default price if not set

    // Create a booking entry with 'pending' status
    const booking = new Booking({
      userId: req.user.userId,
      gymId,
      timeslot,
      price,
      status: "pending",
    });

    await booking.save();

    // Initiate payment
    const paymentResponse = await initiatePayment(booking, paymentMethod);

    if (!paymentResponse.success) {
      return res.status(400).json({ message: "Payment initiation failed" });
    }

    // Save payment details
    const payment = new Payment({
      bookingId: booking._id,
      userId: req.user.userId,
      amount: price,
      paymentId: paymentResponse.paymentId,
      paymentMethod,
      status: "PENDING",
    });

    await payment.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      paymentDetails: paymentResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Bookings (Vendor/Admin)
export const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "vendor") {
      query = { gymId: { $in: await Gym.find({ vendorId: req.user.userId }).distinct("_id") } };
    }

    const bookings = await Booking.find(query)
      .populate("userId", "name email")
      .populate("gymId", "name location price");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Approve a Booking (Vendor)
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if the vendor owns the gym
    const gym = await Gym.findById(booking.gymId);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (gym.vendorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to approve this booking" });
    }

    booking.status = "approved";
    await booking.save();

    res.json({ message: "Booking approved", booking });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Reject a Booking (Vendor)
export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if the vendor owns the gym
    const gym = await Gym.findById(booking.gymId);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (gym.vendorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to reject this booking" });
    }

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected", booking });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Cancel Booking (Customer)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only allow the customer to cancel their own booking
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    // Find the payment details
    const payment = await Payment.findOne({ bookingId: booking._id, status: "SUCCESS" });

    if (payment) {
      const refundResponse = await processRefund(payment.paymentId, payment.paymentMethod);
      if (!refundResponse.success) {
        return res.status(500).json({ message: "Refund failed", error: refundResponse.message });
      }

      payment.status = "REFUNDED";
      await payment.save();
    }

    booking.status = "CANCELED";
    await booking.save();

    res.json({ message: "Booking canceled & payment refunded", booking });
  } catch (error) {
    res.status(500).json({ message: "Error canceling booking", error });
  }
};
