const mongoose=require('mongoose');

const student=mongoose.Schema(
    {
        email:String,
        name:String,
        class:Number,
        phone:String,
        password1:String,
        address:String,
        course:Array,
    }
)
module.exports=mongoose.model('students',student);