const mongoose = require("mongoose");

const attendanceSchema  = new mongoose.Schema({
    studentId:{
         type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },

    classId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true
  
    },

    date:{
    type: String,   // store like: 2026-01-26
    required: true
    },

    time:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model("Attendance", attendanceSchema);