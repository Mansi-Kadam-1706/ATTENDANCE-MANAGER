const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema ({
    token :{type :String , required:true, unique:true},
    teacherId :{type : mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    createdAt :{type:Date , default :Date.now},
    expiresAt :{type:Date , required :true},
    attendance:[
        {
            studentId :{ type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
            markedAt :{type:Date , default:Date.now}
        }
    ]
});

qrSessionSchema.index({expireAt :3},{expireAfterSeconds :0});

module.exports = mongoose.model("QRSession",qrSessionSchema);