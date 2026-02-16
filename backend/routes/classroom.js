


const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");

console.log("Classroom routes loaded");

// Create a class
router.post("/create", async (req, res) => {
  try {
    const { name, latitude, longitude, allowedRadius, teacherId } = req.body;

    // 🔒 Validation
    if (!name || !latitude || !longitude || !allowedRadius || !teacherId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newClass = new Classroom({
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      allowedRadius: Number(allowedRadius),
      teacherId,
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      message: "Class created successfully",
      classroom: savedClass,
    });
  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({
      message: "Error creating class",
      error: err.message,
    });
  }
});


// Fetch all classes for a teacher
router.get("/teacher/:teacherId", async (req, res) => {
    try {
        const classes = await Classroom.find({ teacherId: req.params.teacherId });
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching classes", error: err.message });
    }
});

module.exports = router;
