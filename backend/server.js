const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* CORS */
app.use(cors({
  origin: "https://mansi-kadam-1706.github.io",
  credentials: true
}));

/* FIXED preflight handling */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://mansi-kadam-1706.github.io");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

/* Routes */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/classroom", require("./routes/classroom"));
app.use("/api/qr", require("./routes/qrsession"));

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* DB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* Railway port */
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
