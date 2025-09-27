const connectDB = require("../lib/mongodb");
const Attendance = require("../models/Attendance");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();

    const { name, rollNo, className, subject, code } = req.body;

    if (!name || !rollNo || !className || !subject || !code) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const codeRecord = await Code.findOne({ code, className, subject });
    if (!codeRecord)
      return res.status(400).json({ error: "Invalid attendance code." });

    const now = new Date();
    const createdAt = new Date(codeRecord.createdAt);
    if ((now - createdAt) / 1000 > 60)
      return res.status(400).json({ error: "Attendance code expired." });

    const alreadyMarked = await Attendance.findOne({
      rollNo,
      className,
      subject,
      code,
    });
    if (alreadyMarked)
      return res.status(400).json({ error: "Attendance already submitted." });

    const newAttendance = new Attendance({
      name,
      rollNo,
      className,
      subject,
      code,
    });
    await newAttendance.save();

    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};
