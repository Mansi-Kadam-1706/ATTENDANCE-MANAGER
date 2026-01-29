const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
    name: {type :String , required:true},
    latitude : {type : Number , required:true},
    longitude: {type:Number , required :true},
    allowedRadius :{ type:Number , required:true},
    teacherId :{ type: mongoose.Schema.Types.ObjectId, ref:"User",required:true},
}, {timestamps:true});

module.exports = mongoose.model("Classroom", ClassroomSchema);
