const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },

        email:{
            type:String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password:{
            type: String,
            required: true,
        },

        role:{
            type:String,
            enum:["student","teacher"],
            required:true,
        },
    },
    {timestamps:true} //Track when user was created
//Track when user was last modified
);
module.exports = mongoose.model("User", userSchema);