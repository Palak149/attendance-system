const connectDB = require("../lib/mongodb");
const Attendance = require("../models/Attendance");
const XLSX = require("xlsx");

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

    if (!records.length)
      return res.status(404).json({ error: "No attendance records found" });

    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download attendance" });
  }
};
