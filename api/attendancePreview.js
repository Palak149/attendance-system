const connectDB = require("../lib/mongodb");
const Attendance = require("../models/Attendance");

module.exports = async function (req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();

    const { className, subject, date } = req.query;
    let filter = {};
    if (className) filter.className = className;
    if (subject) filter.subject = subject;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .select("name rollNo className subject timestamp -_id")
      .lean();

    res.status(200).json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance preview" });
  }
};
