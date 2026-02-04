const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ✅ CORS (Railway + GitHub Pages compatible) */
app.use(cors({
  origin: "https://mansi-kadam-1706.github.io",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

/* ✅ Handle preflight properly */
app.options("*", (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());

/* Routes */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/classroom", require("./routes/classroom"));
app.use("/api/qr", require("./routes/qrsession"));

app.get("/", (req, res) => {
  res.send("running");
});

/* DB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* 🚨 CRITICAL FOR RAILWAY */
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
