import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ["Sales", "Location-wise", "Vendor-wise", "Time Slot"],
      required: true,
    },
    filters: {
      dateRange: {
        startDate: Date,
        endDate: Date,
      },
      gymCategory: String,
      location: String,
      vendor: String,
      activityType: String,
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin/User generating report
    data: Object, // Store structured report data
    filePath: String, // Path for Excel or PDF report file
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
