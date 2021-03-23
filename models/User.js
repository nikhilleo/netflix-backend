
const mongoose = require('mongoose');

const userSchema =  new mongoose.Schema({
    googleId:{
        type:String,
        required:true,
    }, 
    displayName:{
        type:String,
        required:true,
    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        default:""
        // required:true,
    },
    image:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
});

const User = new mongoose.model("User",userSchema)
module.exports = User;