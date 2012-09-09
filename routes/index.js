


/*
 * GET home page.
 */


exports.index = function(req, res){
  res.render('index', { title: 'Hey DJ!' });
  };
  




 /*-----------------------------------------
  *
  * Admin Deskrop for DJ and manager
  *
  *-----------------------------------------
 */


exports.admin = function(req, res){

  console.log('ici ' + req.params.partytag);

  res.render('admin.jade', { 
                                title: req.params.partytag,
                                partytag : req.params.partytag 
                           });

};


 

 /*-----------------------------------------
  *
  * Star a new Party, make a new partyTag
  *
  *-----------------------------------------
 */
  
exports.make = function(req, res){


    //
    // we need redis
    //
      
    var redis  = require("redis");
    var config = require("config");
    var uuid = require('node-uuid');
   

    redis = redis.createClient(config.Redis.port, config.Redis.host);
    redis.on("error", function (err) {
      console.log(" Can't connect to redis " + err);
    });
  

   //
   // CGI detected
   //
   
   if (req.body.partytag)
   {
   
     //  we build a list of user key for this party
     console.log(req.body.partytag);
     console.log(req.body.djpass);
     console.log(req.body.usermaxr);
     console.log(req.body.choicemax); 

     //
     // Step 1) save the party config info on redis
     //         the partyTag is the key
               
     redis.set( 'config/'+req.body.partytag, JSON.stringify( { 'partytag' :    req.body.partytag, 
                                                               'djpass':      req.body.djpass,
                                                               'usermax':     req.body.usermax,
                                                               'choicemaxx':  req.body.choicemax } ) , function(err){
       if (err) {   console.log('Cant save on redis'); }
     });
     
     
     //
     // step 2) Generate x uniq user ID
     //
     
     
     for (var i = 0 ; i < req.body.usermax ; i++)
     {
     

       (function(i){
       
              var userID =  uuid.v4();
              console.log(userID);
       
              redis.rpush( 'user/'+req.body.partytag, userID  , function(err){
              if (err) {   console.log('Cant save on redis'); }
              });
                   
       })(i);
     }
     
     
     // 80s Basic style : we jump to admin interface
     res.redirect('/admin/'+ req.body.partytag );   
   
   }
   else
  { 
 	 res.render('make.jade', { title: 'Start a new QR Party!' });
  }

};



 /*-----------------------------------------
  *
  * Terminal QR Reader with webcam and html5
  *
  *-----------------------------------------
 */
          


exports.scan = function(req, res){
  res.render('scan', { title: 'Scan' });
};


exports.steam = function(req, res){
  res.render('steam.jade', { title: 'Scan' });
};





 /*-----------------------------------------
  *
  * QR encoder to print
  *
  *-----------------------------------------
 */

exports.encoder = function(req, res){


    var redis   = require("redis");
    var config  = require("config");


    // QR managent

    var Encoder = require('qr').Encoder;
    var encoder = new Encoder;

    /*
    encoder.on('end', function(png_data){
                //res.header("Content-Type", "image/png")
                // png_data is an instance of Buffer
                //res.send(png_data);
    });
    */

    encoder.on('error', function(err){
                // err is an instance of Error
                // do something
                console.log('encoder error: '+ err);
    });



    //
    // We need redis
    //

	redis = redis.createClient(config.Redis.port, config.Redis.host);
	
	redis.on("error", function (err) {
	    console.log(" Can't connect to redis " + err);
        });


        //
        // Step 1) get list of user 
        //
        
        
        redis.lrange( 'user/'+req.params.partytag ,0 , -1 , function(err,data){
		if (err) {   console.log('user/'+req.params.partytag + ' | Cant read on redis.'); }
		else 
		{
			//console.log(data);
			res.header("Content-Type", "text/html");
			
			var table4print = "<table border=1 cellspacing=4 cellpadding=20>";
			for (var k in data)
			{
			
			  (function(k){
	                    encoder.encode('/vote/'+data[k] +'/'+1 , '/home/fantomas/qrparty/public/images/qr'+data[k]+'1.png'  );
	                    encoder.encode('/vote/'+data[k] +'/'+1 , '/home/fantomas/qrparty/public/images/qr'+data[k]+'2.png'  );
	                    encoder.encode('/vote/'+data[k] +'/'+1 , '/home/fantomas/qrparty/public/images/qr'+data[k]+'3.png'  );
	                    //encoder.encode('/vote/'+data[k] +'/'+1 , '/tmp/qr'+data[k]+'.png'  );
	                    console.log('encoder '+ data[k] );
                          })(k);
                          
			  table4print += "<tr bgcolror=#eeeeee >";
			  table4print += "<td>Vote A<br><img src=/images/qr" + data[k] + '1.png ></td>';
			  table4print += "<td>Vote B<br><img src=/images/qr" + data[k] + '2.png ></td>';
			  table4print += "<td>Vote C<br><img src=/images/qr" + data[k] + '3.png ></td>';
			  table4print += "</tr>";
			  
			}
			table4print += "</table>";
                        res.send(table4print);
		}
			
     });
     


};



 /*-----------------------------------------
  *
  * QR links
  *
  *-----------------------------------------
 */


exports.qr = function(req, res){


 process.nextTick(function () {
      
    var Encoder = require('qr').Encoder;
    var encoder = new Encoder;


	encoder.on('end', function(png_data){
		res.header("Content-Type", "image/png")
		// png_data is an instance of Buffer
		res.send(png_data);
	});

	encoder.on('error', function(err){
		// err is an instance of Error
		// do something
		console.log('error'+ err);
	});

	//encoder.encode('hello world');

	var xoptions = {
	              'dot_size': 3, 
	              'margin': 4, 
	              'level': 'L', 
	              'case_sensitive': true, 
	              'version': 1
              };
	                    
	encoder.encode('/vote/'+req.params.userid +'/'+req.params.vote  );

});


  //res.render('encoder.jade', { title: 'QR Encoder' });
};




exports.steam = function(req, res){

  console.log('' + req.params.userID + ' - ' +req.params.voteNumber);
  //res.render('steam.jade', { title: 'Scan' });
};
