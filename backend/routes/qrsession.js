const express = require("express");
console.log("QR routes loaded");

const router = express.Router();
const QRSession = require("../models/qrsession");
const crypto = require("crypto");
const Attendance = require("../models/Attendance");
const Classroom = require("../models/Classroom");





// Generate QR token for attendance session
router.post("/generate", async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    if (!teacherId || !classId) {
      return res.status(400).json({ message: "teacherId and classId are required" });
    }

    // Generate random token
    const token = crypto.randomBytes(16).toString("hex");

    // Set expiry 60 seconds from now
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // Save session to DB
    const qrSession = new QRSession({
      token,
      teacherId,
      classId,
      expiresAt
    });

    await qrSession.save();
    console.log("Generated QR Token:", token);


    res.status(201).json({
      success: true,
      token,
      expiresAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// distance calculation(haversine formula)
function calculateDistance(lat1, lon1 , lat2 ,lon2){
  const R = 6371000;
  const toRad=(value) =>(value*Math.PI)/180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2-lon1);

   const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
}


router.post("/marks" , async(req,res)=>{
  const {token ,studentId , latitude,longitude} = req.body;

    console.log("Token received from student:", token);




  try{
    //validate QR
    const session = await QRSession.findOne({token});

    if(!session){
      return res.status(400).json({msg:"Invalid QR"});
    }
    if(session.expiresAt <new Date()){
      return res.status(400).json({msg:"QR expired"});
    }

    //get classroom from qr session
    const classroom = await Classroom.findById(session.classId);
    if(!classroom){
      return res.status(400).json({msg:"classroom not found"});
    }

    //calculate distance

    const distance = calculateDistance(
      latitude,
      longitude,
      classroom.latitude,
      classroom.longitude
    );

    //validate allowed radius
    if(distance>classroom.allowedRadius){
      return res.status(403).json({
        msg:"you are outside the allowed radius",
        distance:Math.round(distance),
         allowedRadius: classroom.allowedRadius
      });
    }

    // prevent duplicate attendance
    const today = new Date().toISOString().split("T")[0];

     const alreadyMarked = await Attendance.findOne({
      studentId,
      classId: session.classId,
      date: today
    });

    if (alreadyMarked) {
      return res.status(400).json({ msg: "Attendance already marked today" });
    }

      // 5. Save attendance
    const now = new Date();
    const attendance = new Attendance({
      studentId,
      classId: session.classId,
      date: today,
      time: now.toLocaleTimeString()
    });

    await attendance.save();



    res.json({msg :"Attendance marked successfully",
      distance:Math.round(distance)
    });
  }catch(err){
    res.status(500).json({msg:"server error"});
  }
});

module.exports = router;
