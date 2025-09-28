const connectDB = require("../lib/mongodb");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    // Safely parse body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { className, subject } = body;

    if (!className || !subject) {
      return res.status(400).json({ error: "Class name and subject are required." });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save with timestamp
    const newCode = new Code({
      code: code.trim(),
      className: className.trim(),
      subject: subject.trim(),
      createdAt: new Date() // optional, in case model doesn't auto-create
    });
    await newCode.save();

    console.log("✅ Generated code:", code, "for", className, subject);
    res.status(200).json({ code });
  } catch (err) {
    console.error("❌ generateCode error:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
};
