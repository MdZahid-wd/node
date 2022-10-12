const mongoose=require("mongoose");

const video=mongoose.Schema(
    {   
        
        title: String,
        description: String,
        video:Number,
        
        videoFile: [
          {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            size: Number,
            bucket: String,
            key: String,
            acl: String,
            contentType: String,
            storageClass: String,
            metadata: [Object],
            location: String,
            etag: String,
          }
        ],
        imageFile: [
          {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            size: Number,
            bucket: String,
            key: String,
            acl: String,
            contentType: String,
            storageClass: String,
            metadata: [Object],
            location: String,
            etag: String,
          }
        ],
        txtFile: [
          {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            size: Number,
            bucket: String,
            key: String,
            acl: String,
            contentType: String,
            storageClass: String,
            metadata: [Object],
            location: String,
            etag: String,
          }
        ]
      
    }
)

module.exports=mongoose.model("videos",video);