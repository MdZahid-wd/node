const mongoose=require('mongoose');

const admin=mongoose.Schema(
    {
        email:String,
        name:String,
        class:Number,
        phone:String,
        password1:String,
    }
)
module.exports=mongoose.model('admins',admin);