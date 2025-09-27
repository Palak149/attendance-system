const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema({
  code: String,
  className: String,
  subject: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Code || mongoose.model("Code", CodeSchema);
