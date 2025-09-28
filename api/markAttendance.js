const connectDB = require("../lib/mongodb");
const Attendance = require("../models/Attendance");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, rollNo, className, subject, code } = body || {};

    if (![name, rollNo, className, subject, code].every(v => v && v.toString().trim() !== "")) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const codeRecord = await Code.findOne({ code: code.trim(), className: className.trim(), subject: subject.trim() });
    if (!codeRecord) return res.status(400).json({ error: "Invalid attendance code." });

    // ✅ 5 minutes = 300 seconds
    const now = new Date();
    const createdAt = new Date(codeRecord.createdAt);
    if ((now - createdAt) / 1000 > 300) return res.status(400).json({ error: "Attendance code expired." });

    const alreadyMarked = await Attendance.findOne({
      rollNo: rollNo.trim(),
      className: className.trim(),
      subject: subject.trim(),
      code: code.trim()
    });
    if (alreadyMarked) return res.status(400).json({ error: "Attendance already submitted." });

    const newAttendance = new Attendance({
      name: name.trim(),
      rollNo: rollNo.trim(),
      className: className.trim(),
      subject: subject.trim(),
      code: code.trim(),
      timestamp: now
    });
    await newAttendance.save();

    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (err) {
    console.error("❌ markAttendance error:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
};
