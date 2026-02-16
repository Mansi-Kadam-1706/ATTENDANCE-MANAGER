const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =====================
   MIDDLEWARES
===================== */
app.use(cors({
   origin: "*", // or your netlify URL
  credentials: true
}));
app.use(express.json());

/* =====================
   ROUTES
===================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/class", require("./routes/classroom"));
app.use("/api/attendance", require("./routes/qrsession"));
app.use("/api/qrsession", require("./routes/qrsession"));


/* =====================
   HEALTH CHECK
===================== */
app.get("/", (req, res) => {
  res.send("Smart Attendance Backend Running");
});

/* =====================
   DATABASE
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

/* =====================
   SERVER START
===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
