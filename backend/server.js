const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const classroomRoutes = require("./routes/classroom");
app.use("/api/classroom",classroomRoutes);

const qrSessionRoutes = require("./routes/qrsession");
app.use("/api/qr", qrSessionRoutes);




app.get("/",(req,res)=>{
    res.send("running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))  // success case
  .catch(err => console.log(err));               // error case


const PORT  = process.env.PORT || 5000;
app.listen(PORT ,()=>{
    console.log(`server runing on port ${PORT}`);
});

