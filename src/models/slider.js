const mongoose=require("mongoose");
const Slider=mongoose.Schema({
    sliders:[{title:String,
    subtitle:String,
    sliderUrl:String,
    class:String},]

});
module.exports=mongoose.model('slider',Slider);