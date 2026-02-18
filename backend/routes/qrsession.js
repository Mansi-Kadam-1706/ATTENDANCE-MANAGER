const express = require("express");
const crypto = require("crypto");
const QRSession = require("../models/qrsession");
const Classroom = require("../models/Classroom");
const Attendance = require("../models/Attendance");

const router = express.Router();

// GENERATE QR
router.post("/generate", async (req, res) => {
  const { teacherId, classId } = req.body;

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await QRSession.create({ token, teacherId, classId, expiresAt });

  res.json({ token, expiresAt });
});

// MARK ATTENDANCE
router.post("/mark", async (req, res) => {
  const { token, studentId, latitude, longitude } = req.body;

  const session = await QRSession.findOne({ token });
  if (!session) return res.status(400).json({ message: "Invalid QR" });
  if (session.expiresAt < new Date()) return res.status(400).json({ message: "QR expired" });

  const classroom = await Classroom.findById(session.classId);

  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(classroom.latitude - latitude);
  const dLon = toRad(classroom.longitude - longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latitude)) *
      Math.cos(toRad(classroom.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

  if (distance > classroom.allowedRadius)
    return res.status(403).json({ message: "Outside allowed radius" });

  const today = new Date().toISOString().split("T")[0];

  const alreadyMarked = await Attendance.findOne({
    studentId,
    classId: classroom._id,
    date: today,
  });

  if (alreadyMarked)
    return res.status(400).json({ message: "Attendance already marked" });

  await Attendance.create({
    studentId,
    classId: classroom._id,
    date: today,
    time: new Date().toLocaleTimeString(),
  });

  res.json({ success: true, message: "Attendance marked" });
});

module.exports = router;
