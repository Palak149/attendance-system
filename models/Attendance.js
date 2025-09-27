const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  className: String,
  subject: String,
  code: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
