const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const User = require("../models/User");


// TEACHER DASHBOARD
router.get("/teacher/:classId", async (req,res)=>{

 try{

 const {classId} = req.params;

 const totalStudents = await User.countDocuments({role:"student"});

 const today = new Date().toISOString().split("T")[0];

 const present = await Attendance.countDocuments({
   classId,
   date:today
 });

 const absent = totalStudents - present;

 const records = await Attendance.find({classId,date:today})
 .populate("studentId","name email");

 res.json({
   totalStudents,
   present,
   absent,
   records
 });

 }catch(err){
  res.status(500).json({message:"Server error"});
 }

});

// STUDENT DASHBOARD

router.get("/student/:studentId", async(req,res)=>{

 try{

 const {studentId} = req.params;

 const totalClasses = await Attendance.countDocuments({studentId});

 const history = await Attendance.find({studentId})
 .populate("classId","name");

 res.json({
   totalClasses,
   history
 });

 }catch(err){
  res.status(500).json({message:"Server error"});
 }

});

module.exports = router;