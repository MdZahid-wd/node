
const express=require('express');
const cors=require('cors');
const app=express();
const https=require("https");
const qs=require("querystring");
const checksum_lib=require("./paytm/checksum");
const config=require("./paytm/config");
const parseUrl=express.urlencoded({extended:false});
const parseJson=express.json({extended:false});
const hbs=require('hbs');
const mongoose=require('mongoose');
const routes=require('./routers/main.js');
const { find } = require('./models/Detail');
const bodyParser=require("body-parser");
const socket=require('socket.io');
const videos=require("./models/videos");
const student=require("./models/student");
const { env } = require('process');
const cookieParser=require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const api = require('api');

//static/css/style.css
app.use('/static',express.static("public"));
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.json());
app.use('/api', api);
app.use('',routes);
app.use(express.json());
app.use(cors());
app.use(cookieParser());
//template engine
app.set('view engine','hbs');
app.set("views","view-folder");
hbs.registerPartials("view-folder/partials");

//db connection

const url = `mongodb+srv://node:mongodbnode@englishbrain-mongodb-cl.yzz6zwh.mongodb.net/englishbrain1?retryWrites=true&w=majority`;

const connectionParams={
   useNewUrlParser: true, useUnifiedTopology: true
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database englishbrain1')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    });
    // Detail.create({
    //     brandName:"zeza",
    //     brandIconUrl:"#####",
    //     links:[
    //         {
    //             label:"home",
    //             url:"/"
    //         },
    //         {
    //             label:"service",
    //             url:"/services"
    //         },
    //         {
    //             lebel:"Gallery",
    //             url:"/gallery"
    //         },
    //         {
    //             lebel:"Contact Us",
    //             url:"/contact-us"
    //         }

    //     ]
    // })

    // Slider.create({
    //     sliders:[

    
    //     {
    //         title:"lern java in va",
    //         subtitle:"kfdjskjskjfdjsjfs",
    //         sliderUrl:"/static/images/s2.jpg"
    //     },
    //     {
    //         title:"lern java in va",
    //         subtitle:"kfdjskjskjfdjsjfs",
    //         sliderUrl:"/static/images/s2.jpg"
    //     },
    //     {
    //         title:"lern java in va",
    //         subtitle:"kfdjskjskjfdjsjfs",
    //         sliderUrl:"/static/images/s2.jpg"
    //     },
    //     {
    //         title:"lern java in va",
    //         subtitle:"kfdjskjskjfdjsjfs",
    //         sliderUrl:"/static/images/s2.jpg"
    //     }
    //     ]
    // })
        // course.create({
    
        
            
        //   courseNo:2,
        //   title:"learn history easily(2022-2023)",
        //   description:"preapare for matric",
        //   courseThumbnail:"course1/thumbnails/maoj.png",
        //   demoVideos:[3,5,],
        //   courseFees:3000,
        // });
        //  student.create({
        //     email:"zahidmd9830@gmail.com",
        //     name:"Md Zahid",
        //     class:18,
        //     phone:4893948394,
        //     password1:"zahid1999",
        //     address:"gulshan colony",
        //     course:[1,2],
        // });
    
  
   routes.post("/paynow",(req,res)=>{
    res.render("payInfo");
   })
  
  routes.post("/payInfo", [parseUrl, parseJson], (req, res) => {
    // Route for making payment
  
    var paymentDetails = {
      amount: req.body.amount,
      customerId: req.body.name.replace(/\s/g,''),
      customerEmail: req.body.email,
      customerPhone: req.body.phone
  }
  if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
  } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
      params['CUST_ID'] = paymentDetails.customerId;
      params['TXN_AMOUNT'] = paymentDetails.amount;
      params['CALLBACK_URL'] = 'http://localhost:3000/result';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone;
  
  
      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
  
          var form_fields = "";
          for (var x in params) {
              form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
  
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
      });
  }
  });
  routes.post("/callback", (req, res) => {
    // Route for verifiying payment
  
    var body = '';
  
    req.on('data', function (data) {
       body += data;
    });
  
     req.on('end', function () {
       var html = "";
       var post_data = qs.parse(body);
  
       // received params in callback
       console.log('Callback Response: ', post_data, "\n");
  
  
       // verify the checksum
       var checksumhash = post_data.CHECKSUMHASH;
       // delete post_data.CHECKSUMHASH;
       var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
       console.log("Checksum Result => ", result, "\n");
  
  
       // Send Server-to-Server request to verify Order Status
       var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};
  
       checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
  
         params.CHECKSUMHASH = checksum;
         post_data = 'JsonData='+JSON.stringify(params);
  
         var options = {
           hostname: 'securegw-stage.paytm.in', // for staging
           // hostname: 'securegw.paytm.in', // for production
           port: 443,
           path: '/merchant-status/getTxnStatus',
           method: 'POST',
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': post_data.length
           }
         };
  
  
         // Set up the request
         var response = "";
         var post_req = https.request(options, function(post_res) {
           post_res.on('data', function (chunk) {
             response += chunk;
           });
  
           post_res.on('end', function(){
             console.log('S2S Response: ', response, "\n");
  
             var _result = JSON.parse(response);
               if(_result.STATUS == 'TXN_SUCCESS') {
                   res.send('payment sucess')
               }else {
                   res.send('payment failed')
               }
             });
         });
  
         // post the data
         post_req.write(post_data);
         post_req.end();
        });
       });
  });
  
  


app.listen(process.env.API_ENDPOINT || 3000,()=>{
    console.log("server started");
});