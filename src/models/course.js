const mongoose=require("mongoose");

const course=mongoose.Schema({
    courseNo:Number,
    title:String,
    description:String,
    courseThumbnail:String,
    demoVideos:Array,
    courseFees:Number,


})

module.exports=mongoose.model("courses",course);