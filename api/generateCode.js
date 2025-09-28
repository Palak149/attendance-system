const connectDB = require("../lib/mongodb");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ensure body parsing works
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { className, subject } = body;

    if (!className || !subject) {
      return res.status(400).json({ error: "Class and subject are required" });
    }

    await connectDB(); // connect to MongoDB

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database
    const newCode = new Code({ code, className, subject });
    await newCode.save();

    // Return generated code as JSON
    res.status(200).json({ code });
  } catch (err) {
    console.error("❌ generateCode error:", err);
    res.status(500).json({ error: "Failed to generate code", details: err.message });
  }
};
