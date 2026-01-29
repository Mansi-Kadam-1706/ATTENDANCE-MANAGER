


const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");

console.log("Classroom routes loaded");

// Create a class
router.post("/create", async (req, res) => {
    const { name, latitude, longitude, allowedRadius, teacherId } = req.body;

    try {
        const newClass = new Classroom({
            name,
            latitude,
            longitude,
            allowedRadius,
            teacherId
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(500).json({ msg: "Error creating class", error: err.message });
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
