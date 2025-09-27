const connectDB = require("../lib/mongodb");
const Code = require("../models/Code");

module.exports = async function (req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();

    const { className, subject } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newCode = new Code({ code, className, subject });
    await newCode.save();

    res.status(200).json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate code" });
  }
};
