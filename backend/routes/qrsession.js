const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const QRSession = require("../models/qrsession");
const Classroom = require("../models/Classroom");
const Attendance = require("../models/Attendance");

console.log("✅ QRSession routes loaded");

// =======================
// GENERATE QR TOKEN
// =======================
router.post("/generate", async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    if (!teacherId || !classId) {
      return res.status(400).json({
        success: false,
        message: "teacherId and classId are required",
      });
    }

    // Check classroom exists
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    // Generate token
    const token = crypto.randomBytes(16).toString("hex");

    // QR valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await QRSession.create({
      token,
      teacherId,
      classId,
      expiresAt,
    });

    console.log("✅ QR generated:", token);

    res.status(201).json({
      success: true,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("❌ QR Generate Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR",
    });
  }
});

// =======================
// MARK ATTENDANCE
// =======================
router.post("/mark", async (req, res) => {
  try {
    const { token, studentId, latitude, longitude } = req.body;

    if (!token || !studentId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate QR
    const session = await QRSession.findOne({ token });
    if (!session) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    if (session.expiresAt < new Date()) {
      return res.status(400).json({ message: "QR expired" });
    }

    // Fetch classroom
    const classroom = await Classroom.findById(session.classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Distance calculation
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

    if (distance > classroom.allowedRadius) {
      return res.status(403).json({
        message: "Outside allowed radius",
        distance: Math.round(distance),
        allowedRadius: classroom.allowedRadius,
      });
    }

    // Prevent duplicate attendance
    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({
      studentId,
      classId: classroom._id,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked",
      });
    }

    await Attendance.create({
      studentId,
      classId: classroom._id,
      date: today,
      time: new Date().toLocaleTimeString(),
    });

    res.json({
      success: true,
      message: "Attendance marked successfully",
      distance: Math.round(distance),
    });
  } catch (error) {
    console.error("❌ Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
