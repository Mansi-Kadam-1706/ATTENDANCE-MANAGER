const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ✅ CORS for GitHub Pages */
app.use(cors({
  origin: "https://mansi-kadam-1706.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

/* Routes */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/classroom", require("./routes/classroom"));
app.use("/api/qr", require("./routes/qrsession"));

app.get("/", (req, res) => {
  res.send("running");
});

/* MongoDB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* 🚀 IMPORTANT FOR RENDER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
