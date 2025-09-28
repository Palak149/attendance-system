const connectDB = require("../lib/mongodb");
const Attendance = require("../models/Attendance");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    // Log raw body for Render debugging
    console.log("💡 Raw req.body:", req.body);

    // Safely parse body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("💡 Parsed body:", body);

    const { name, rollNo, className, subject, code } = body;

    // Validate input
    if (!name || !rollNo || !className || !subject || !code) {
      console.log("⚠️ Missing field(s)");
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if code exists
    const codeRecord = await Code.findOne({ code, className, subject });
    if (!codeRecord) {
      console.log("⚠️ Invalid attendance code:", code);
      return res.status(400).json({ error: "Invalid attendance code." });
    }

    // Check if code expired (1 minute)
    const now = new Date();
    const createdAt = new Date(codeRecord.createdAt);
    if ((now - createdAt) / 1000 > 60) {
      console.log("⚠️ Attendance code expired");
      return res.status(400).json({ error: "Attendance code expired." });
    }

    // Check if already marked
    const alreadyMarked = await Attendance.findOne({
      rollNo,
      className,
      subject,
      code,
    });
    if (alreadyMarked) {
      console.log("⚠️ Attendance already submitted for:", rollNo);
      return res.status(400).json({ error: "Attendance already submitted." });
    }

    // Save attendance
    const newAttendance = new Attendance({
      name,
      rollNo,
      className,
      subject,
      code,
      timestamp: now,
    });
    await newAttendance.save();

    console.log("✅ Attendance marked:", { name, rollNo, className, subject });
    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (err) {
    console.error("❌ markAttendance error:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
};
