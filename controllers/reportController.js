import { generateSalesReport, generateLocationReport, generateVendorReport, generateTimeSlotReport } from "../services/reportService.js";
import Report from "../models/reportModel.js"; // ✅ Import Report model

// 📌 Sales Report
export const getSalesReport = async (req, res) => {
  try {
    const reportData = await generateSalesReport(req.query);

    // ✅ Save report details in DB
    const newReport = new Report({
      reportType: "Sales",
      filters: req.query,
      data: reportData,
      generatedBy: req.user ? req.user._id : null, // If authentication is implemented
    });

    await newReport.save();

    res.status(200).json({ success: true, report: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Location-based Report
export const getLocationReport = async (req, res) => {
  try {
    const reportData = await generateLocationReport(req.query);

    // ✅ Save report in DB
    const newReport = new Report({
      reportType: "Location-wise",
      filters: req.query,
      data: reportData,
      generatedBy: req.user ? req.user._id : null,
    });

    await newReport.save();

    res.status(200).json({ success: true, report: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Vendor-specific Report
export const getVendorReport = async (req, res) => {
  try {
    const reportData = await generateVendorReport(req.query);

    // ✅ Save report in DB
    const newReport = new Report({
      reportType: "Vendor-wise",
      filters: req.query,
      data: reportData,
      generatedBy: req.user ? req.user._id : null,
    });

    await newReport.save();

    res.status(200).json({ success: true, report: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Booking Trends (Timeslot-based)
export const getTimeSlotReport = async (req, res) => {
  try {
    const reportData = await generateTimeSlotReport(req.query);

    // ✅ Save report in DB
    const newReport = new Report({
      reportType: "Time Slot",
      filters: req.query,
      data: reportData,
      generatedBy: req.user ? req.user._id : null,
    });

    await newReport.save();

    res.status(200).json({ success: true, report: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
