
require('dotenv').config();
const formidable = require('formidable');
const util=require('util');
const aws=require("aws-sdk");
const express=require('express');
const {route}=require('express/lib/application');
const mongoose=require('mongoose');
const Detail=require("../models/Detail");
const Slider = require("../models/slider");
const Course=require("../models/course");
const student = require('../models/student');
const admin = require('../models/admin');
const Videos=require("../models/videos");
var PaytmChecksum = require('paytmchecksum');
const { response } = require('express');
const routes=express.Router();
const fs=require('fs');
const path=require('path');
const bodyParser=require("body-parser");
const multer=require('multer');
const { url } = require("inspector");
const { S3Client,GetObjectCommand ,DeleteObjectCommand} = require('@aws-sdk/client-s3')
const jwt=require('jsonwebtoken');
const multerS3 = require('multer-s3')
const http = require('http');
const querystring = require('querystring');
const DeviceDetector=require("device-detector-js");
const device = require('express-device');
const { DirectoryService, ElastiCache, Request, Route53Resolver, CostExplorer } = require("aws-sdk");
const { parse } = require("path");
const { json } = require("body-parser");
const cookieParser = require('cookie-parser');
const { send } = require('process');
const { Parser } = require('express-device');
const course = require('../models/course');
const { Console } = require('console');



//authenticathion for admin..................................................................................................................................................................................................
const autha=async(req,res,next)=>{
    try{
        const cookies=req.headers.cookie;
        var token=0;
        if(cookies==null){
            

            res.render("admin-login",{loginLogoName:"Login",emailExists:"login again you have spend long time for security reason"});
            

        }
        else{
            
            const cookiesArray=cookies.split('; ');
            console.log(cookiesArray.length);
        
            for(i=0;i<cookiesArray.length;i++){
                var keyes=cookiesArray[i].split('=')[0];
                console.log(keyes);
                if(keyes=='jwta'){
                    token=cookiesArray[i].split('=')[1];
                }
            }
            if(token==0){
                res.render("admin-login",{loginLogoName:"Login",emailExists:"login again you have spend long time for security reason"});
            }
            else{
                try{
                    const verifyUser=jwt.verify(token,process.env.JWT_SECRET_KEY);
                    console.log(verifyUser.id)
                    req.data=await admin.findOne({"_id":verifyUser.id});
                    next()
                   }catch(e){
                        console.log(e);
                        res.status(404),send(e);
                   } 
            }
        
           
        }      
    }
    catch(e){
res.status(401),send(e);
    }
}
//authentication for student............................................................................................................................................
async function auths(req,res,next){
    try{
        const cookies=req.headers.cookie;
        
        var token=0;
        if(cookies==null){
            token=0;
            res.status(404);
            res.end()
            
        }
        else{
            const cookiesArray=cookies.split('; ');
            console.log(cookiesArray.length);
        
            for(i=0;i<cookiesArray.length;i++){
                var keyes=cookiesArray[i].split('=')[0];
                console.log(keyes);
                if(keyes=='jwts'){
                    token=cookiesArray[i].split('=')[1];
                }
            }
        


        if(token==0){
            res.status(404);
            res.end()
            

        }
        else{
            
           console.log(token);
           try{
            const verifyUser=jwt.verify(token,process.env.JWT_SECRET_KEY);
            console.log(verifyUser.id)
            req.data=await student.findOne({"_id":verifyUser.id});
            
            next()
           }catch(e){
                console.log(e);
                res.status(401),send(e);
           } 
        } 
        }     
    }
    catch(e){
res.status(401),send(e);
    }
}
//login present for student............................................................................................................................................
async function loginPresent(req,res,next){
    try{
        const cookies=req.headers.cookie;
        
        var token=0;
        if(cookies==null){
            token=0;
            req.login="Login"
            next();
            
        }
        else{
            const cookiesArray=cookies.split('; ');
            console.log(cookiesArray.length);
            for(i=0;i<cookiesArray.length;i++){
                var keyes=cookiesArray[i].split('=')[0];
                console.log(keyes);
                if(keyes=='jwts'){
                    token=cookiesArray[i].split('=')[1];
                }
            }
        


        if(token==0){
            req.login="Login"
            next();
            

        }
        else{
            console.log(token);
           try{
            const verifyUser=jwt.verify(token,process.env.JWT_SECRET_KEY);
            console.log(verifyUser.id)
            const data=await student.findOne({"_id":verifyUser.id});
            req.login=data.name.split(' ')[0];
            next()
           }catch(e){
                console.log(e);
                res.status(401),send(e);
           } 
        } 
        }     
    }
    catch(e){
res.status(401),send(e);
    }
}
//home routes.....................................................................................................................................
routes.get("/",loginPresent,async(req,res)=>{
    
    const videos=await Videos.find();
    console.log(videos)
    const course=await Course.find();
    const slider=await Slider.findOne({"_id":"630d924e7c4d3393d869ef71"});
    res.render("index",{loginLogoName:req.login,slider:slider,course:course,videos:videos});
});

routes.get("/gallery",async(req,res)=>{
    const detail=await Detail.findOne({"_id":"630c989d9218abe435b91a30"})
    res.render("gallery",{detail:detail});
});
//student-login..........................................................................................................................................................................................


routes.get("/student-login",async(req,res)=>{
    res.render("student-login",{loginLogoName:"Login"});
    
});
routes.post("/student-login",async(req,res)=>{

    console.log("form is submitted");
    console.log(req.body.email);
    const data=await student.findOne({"email":req.body.email});
    if(data==null){
        res.render("student-login",{loginLogoName:"Login",emailExists:"invalid email"})
            console.log("email already exist");
    }
    else{
            if(data.password1==req.body.password){
            
                

                 const user={id:data._id};
                 const token=await jwt.sign(user,process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
                 console.log('........ttttttttt.......')
                 console.log(token);
                 console.log('........ttttttttt.......')
                 console.log(user);
                
                res.cookie('jwts',token,{expires:new Date(Date.now()+60*60*1000),httpOnly:true});
                    
                res.render("course-videos",{loginLogoName:data.name.split(' ')[0]});
                console.log("email exists");
            }
            else{
                res.render("student-login",{loginLogoName:"Login",emailExists:"invalid email"});
            }
            
    }
});

//course information..............................................................................................................................................................
routes.get("/courseInformation",(req,res)=>{
    res.render("course-information");
})
//student register...................................................................................................................................................................

routes.get("/student-register",async(req,res)=>{
    res.render("student-register");
    
});
routes.post("/course",async(req,res)=>{
    console.log("form is submitted");
    console.log(req.body.email);
    const data=await student.findOne({"email":req.body.email});
    console.log(data);
    if(data==null){
        if(req.body.password1==req.body.password2){
            try{
                const data=await student.create(req.body);
                console.log(data);
                res.render("student-login",{success:"you are register now login to join courses"});
            }catch(e){
                console.log(e);
                res.render("admin-videoUpdate",{success:false,dbError:"database error try after some time or connection lose"})
        
            }
        }
        else{
            res.render("student-register",{passwordMatch:"password does't match"});
        }
        
    }
    else{
        if(data.email==req.body.email){
            res.render("student-register",{emailExists:"email alredy exists"})
            console.log("email already exist");
        }
    }
});

//admin login .......................................................................................................................................
routes.get("/adminLogin",(req,res)=>{
    console.log(req.headers.authorization)
    res.render("admin-login",{loginLogoName:"login"});
})
routes.post("/adminUpdate",async(req,res)=>{
    var pass=false;
    console.log("form is submitted");
    console.log(req.body);
    const data=await admin.findOne({"email":req.body.email});
    console.log(data);
    console.log(data._id);
    if(data==null){
        res.render("admin-login",{emailExists:"invalid email"})
            console.log("email already exist");
    }
    else{
            if(data.password1==req.body.password){
            
                console.log("email exists");
                
                const user={id:data._id};
                const token=await jwt.sign(user,process.env.JWT_SECRET_KEY,{expiresIn:'1h'});

                
                res.cookie('jwta',token,{expires:new Date(Date.now()+60*60*1000),httpOnly:true});
                    
                res.render("admin-update",{loginLogoName:data.name});
            
        
            }
            else{
                res.render("admin-login",{wrongPassword:"invalid email"});
            }
            
    }
    

});

//Video player..............................................................................................................................................................

routes.post("/result",async(req,res)=>{
    const service=await Service.find();
    res.render("videos",{service:service});
});

routes.get("/playVideo",async(req,res)=>{
    res.render("playVideo");
    
});

//video update.........................................................................................................................................................................................................

  routes.get("/videoUpdate",autha,async(req,res)=>{
    //console.log("this is from autha")
    //console.log(req.data);
    const videos=await Videos.find();
    //console.log(videos.length);
    var videosInformation=[];
    for(i=0;i<videos.length;i++){
         //console.log(videos.length);
         try{
            const video=await Videos.findOne({"video":(i+1)});
            var videoInformation={"title":video.title,"description":video.description,videoNo:video.video}
            videosInformation[i]=videoInformation;
            
         }
         catch(e){
            console.log("video with videoNo not fount");
            var videoInformation={"title":"not found","description":"video is not present"}
            videosInformation[i]=videoInformation;

         }
         
         
        
    }
    
    res.render("admin-videoUpdate",{loginLogoName:req.data.name,videosInformation:JSON.stringify(videosInformation),videosLength:videos.length});
})

// const s3 = new aws.S3({
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.ACCESS_SECRET
// });
routes.get("/adminBack",autha,(req,res)=>{
    res.render("admin-update");
})
//course update.........................................................................................................................................................................................................

// routes.get("/courseUpdate",autha,async(req,res)=>{
    
//     res.render("admin-courseUpdate",{loginLogoName:req.data.name});
// })

// // const s3 = new aws.S3({
// //     accessKeyId: process.env.ACCESS_KEY,
// //     secretAccessKey: process.env.ACCESS_SECRET
// // });
// routes.get("/adminBack",(req,res)=>{
//     res.render("admin-update");
// })

//video thumbnail....................................................................................................................................................................
routes.get("/thumbnail/*",autha,async(req,res)=>{
    const urlKey=req.url;
    console.log(urlKey);
    const videoNo=Number(urlKey.slice(11));
    console.log(videoNo);
    try{
        console.log("someone is sending thumbnail request");
        const videos=await Videos.findOne({"video":videoNo});
        console.log(videos.imageFile[0])
        const finalKey=videos.imageFile[0].key;
    const params={
        Bucket:'englishbrain1',
        Key:finalKey,
    };

        res.attachment(req.params.name) ;
        const s3g=new S3Client();
        const cmd=new GetObjectCommand(params);
        const resp=await s3g.send(cmd);
        resp.Body.pipe(res)
        res.writeHead(200);  

    }catch(e){
        console.log("thumbnail upload error",e);
    }
      
});
//play video...........................................................................................................................................................................

routes.get('/video', function(req, res) {
    
    console.log(req.header);
    console.log(req.body);
    const path = 'example.mkv'
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    console.log(range);
  
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1
  
      if(start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
        return
      }
      
      const chunksize = (end-start)+1
      const file = fs.createReadStream(path, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mkv',
      }
  
      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mkv',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  })
//admin video upload s3.........................................................................................................................................
const s3 = new S3Client();

    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'englishbrain1',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: async function (req, file, cb) {
                console.log(file.originalname);
    
                if(file.fieldname=="videoFile"){
        
                        cb(null, {fieldName:file.fieldname});
            
                }
                if(file.fieldname=="imageFile"){
            
                        cb(null, {fieldName:file.fieldname});
                    
                }
                if(file.fieldname=="txtFile"){
        
                        cb(null, {fieldName:file.fieldname});
    
                }
            
            },
            key: function (req, file, cb) {
                var videosFolder='';
                if(file.fieldname=="videoFile"){
                    videosFolder="videos/video/"
                }
                if(file.fieldname=="imageFile"){
                    videosFolder="videos/image/"
                }
                if(file.fieldname=="txtFile"){
                    videosFolder="videos/text/"
                }
                var fullPath=videosFolder+file.originalname;
            cb(null, fullPath);
            }
        })
        
    })  

routes.post("/adminVideoUpload",upload.fields([{name:"videoFile",maxCount:1},{name:"imageFile",maxCount:1},{name:"txtFile",maxCount:40}]),async(req,res,next)=>{
    
    console.log(".........xxxxxx.....")
    
    
    try{
        
        const videos=await Videos.find()
        const videoLength=videos.length;
        const afterVideoNumber=req.body.afterVideoNo;
        console.log(afterVideoNumber)
        var newVideoNo;


        
        if(afterVideoNumber<videoLength && afterVideoNumber>=1){
            
            for(var i=videoLength;i>afterVideoNumber;i--){
                
                var ab=await Videos.findOne({video:i})
                console.log('.........uuuuuuuuuuuuuuu..........')
                console.log(i)
                var cd=await Videos.updateOne({_id:ab._id},{$set:{video:i+1}})
                console.log('............fffffffffffffffff...........')
                console.log(i+1);
           }
          newVideoNo=afterVideoNumber;
          newVideoNo++;
        }
        else{
          newVideoNo=videoLength+1;
            
        }
        console.log(newVideoNo)
        Videos.create({   
            
            title: req.body.title,
            description: req.body.description,
            video:newVideoNo,
            videoFile:req.files.videoFile,
            imageFile:req.files.imageFile,
            txtFile:req.files.txtFile,
        });


    
               
          
        
        
            res.status(200);
            
            res.render("success",{success:"successfully uploaded"});


        }catch(e){
          console.log(e);
          console.log("......mongo db error.....")
          res.render("success",{success:"not uploaded something error"})
        

        }
    
    
    
}); 
//contact page.....................................................................................................................................
routes.get('/contactUs',loginPresent,(req,res)=>{
    res.render("contact-us",{loginLogoName:req.login});
})
//delete object......................................................................................................................................................
   const s3ClientDelete=new S3Client();
routes.get("/delete-video/*",async(req,res)=>{
    const deleteUrl=req.url;
    const videoNo=Number(deleteUrl.slice(14));
    const videoLength=(await Videos.find()).length
    try{
        const videoData=await Videos.findOne({"video":videoNo})
        const deleteitem1=videoData.videoFile[0].key;
        const deleteitem2=videoData.imageFile[0].key;
        //s3 deletion process...........
        
  
                            bucketParams = { Bucket: "englishbrain1", Key: deleteitem1 };

                            try {
                                const data = await s3ClientDelete.send(new DeleteObjectCommand(bucketParams));
                                console.log("Success. Object deleted.", data);
                                // For unit tests.
                            } catch (err) {
                                console.log("s3 Error", err);
                            }    
                                    bucketParams = { Bucket: "englishbrain1", Key: deleteitem2 };

                            try {
                                const data = await s3ClientDelete.send(new DeleteObjectCommand(bucketParams));
                                console.log("Success. Object deleted.", data);
                                // For unit tests.
                            } catch (err) {
                                console.log("s3 Error", err);
                            }





                            if(videoData.imageFile[0].key==null){
                        
                            }else{
                                for(i=0;i<videoData.imageFile.length;i++){
                                    const deleteitem3=videoData.imageFile[i].key;
                                        bucketParams = { Bucket: "englishbrain1", Key: deleteitem3 };

                                    try {
                                    const data = await s3ClientDelete.send(new DeleteObjectCommand(bucketParams));
                                    console.log("Success. Object deleted.", data);
                                    // For unit tests.
                                    } catch (err) {
                                    console.log("s3 Error", err);
                                    }


                                    
                                }
                            
                        
                            }
                            
                        
    
    }catch(e){
        console.log('vdieo information not found',e);
        res.status(404);
    
    }
    //mongodb deletion.........................
    const videoDataAgain=await Videos.findOneAndDelete({video:videoNo})
    
    
    console.log("........................................................xxxxxxxxxxxxx...................")
    console.log(videoNo);
    console.log(videoLength)
    
    for(i=videoNo;i<videoLength;i++){
          var ab=await Videos.findOne({video:(i+1)})
          console.log(ab._id);
          var cd=await Videos.updateOne({_id:ab._id},{$set:{video:i}})
          console.log(cd);
    }
    res.render("success",{success:"successfully deleted refresh the page"});
   
    
})


            




routes.get('/download',(req,res)=>{
    var options = {
        Bucket    : 's3b-nodejs',
        Key    : 'cat.jpg',
        Range: bytes=0-9,
    };
    var fileStream = s3.getObject(options).createReadStream();
    console.log(fileStream);
        fileStream.pipe(res);
        
})


  

module.exports=routes;