import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Report from "../models/reportModel.js"; // Assuming you store reports

// 📌 Generate Sales Report
export const generateSalesReport = async (filters) => {
  try {
    const reports = await Report.find(filters).lean();
    return reports;
  } catch (error) {
    throw new Error("Failed to generate sales report.");
  }
};

// 📌 Generate Location-based Report
export const generateLocationReport = async (filters) => {
  try {
    const reports = await Report.find({ location: filters.location }).lean();
    return reports;
  } catch (error) {
    throw new Error("Failed to generate location-wise report.");
  }
};

// 📌 Generate Vendor-specific Report
export const generateVendorReport = async (filters) => {
  try {
    const reports = await Report.find({ vendor: filters.vendor }).lean();
    return reports;
  } catch (error) {
    throw new Error("Failed to generate vendor-wise report.");
  }
};

// 📌 Generate Booking Trends (Time Slot)
export const generateTimeSlotReport = async (filters) => {
  try {
    const reports = await Report.find({ timeslot: filters.timeslot }).lean();
    return reports;
  } catch (error) {
    throw new Error("Failed to generate time slot report.");
  }
};

// 📌 Export Report to Excel
export const exportReportToExcel = async (data, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  await workbook.xlsx.writeFile(filePath);
};

// 📌 Export Report to PDF
export const exportReportToPDF = async (data, filePath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.text("Report Data:\n\n");

  data.forEach((row, index) => {
    doc.text(`${index + 1}. ${JSON.stringify(row)}`);
  });

  doc.end();
};

// 📌 Schedule Reports via Email (Weekly/Monthly)
export const scheduleReportEmail = async (reportData, email) => {
  // Use Nodemailer/SendGrid to send scheduled reports
};
