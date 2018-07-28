


var shortid = require('shortid');
var pug     = require("pug");
var redis   = require("redis");
var config  = require("config");
var uuid    = require('node-uuid');
var Encoder = require('qr').Encoder;
var merge   = require('merge');



// Starting Redis

redis = redis.createClient(config.redis.port, config.redis.host);
redis.on("error", function (err) {
  console.log(" Can't connect to redis " + err);
});





exports.init = function(req, res, next ) {
    res.locals.html     = null;
    res.locals.redirect = null;
    next()
};


exports.done = function(req, res) {

    if (res.locals.html) {
        res.send(res.locals.html);
    }

    if (res.locals.redirect) {
        res.redirect(res.locals.redirect);
    }

};


exports.getPartyInfo = function (req,res, next) {

    redis.get( req.params.pid, function(err,string){
        if (err) {
            res.status(500).send("500 - Service unavailable (redis)");
            console.error('partyStore() ERROR with redis.get()', err);
        } else {
            res.locals.partyInfo = null;
            try {
                res.locals.partyInfo = JSON.parse(string);
            } catch(e) {
                res.status(500).send("500 - Service unavailable (JSON.parse)");
                console.error('partyStore() ERROR with JSON.Parse', e);
            }
            console.log(res.locals.partyInfo);
            next();
        }
    });

}

exports.index = function(req, res, next){

    // Generate a new uniq ID
    var options = {
        'pid' : 'pid'+shortid.generate()
    }
    res.locals.html = pug.renderFile('./views/index.pug', options);
    next();
};


// Start a new party ID
exports.partyForm = function(req, res, next){

    var options = {
        pid : req.params.pid // (secret) party ID
    };
    res.locals.html = pug.renderFile('./views/partyForm.pug', options);
    next();

};


// Saving Party Info
exports.partyStore = function(req, res, next){


        //
        // Step 1) save the party config
        //

        var partyInfo      = merge(req.params, req.body);
            partyInfo['vid'] =  'vid'+shortid.generate(); // public voting id

        console.log("partyStore()",partyInfo);
        redis.set( req.params.pid, JSON.stringify(partyInfo), function(err){
            if (err) {
                console.error('partyStore() ERROR with redis.set()', err);
            }
        });

        res.locals.html     = null,
        res.locals.redirect = '/admin/'+ req.params.pid
        next();

};





exports.vjay = function(req, res){
  res.render('vjay', { 
  title: 'Hey DJ!',
  partytag: req.params.partytag
  
  });
};



    
    
    

 /*-----------------------------------------
  *
  * vote 
  *
  *-----------------------------------------
 */
  
exports.vote = function(req, res){


   //
   // CGI detected
   //
   
       res.header("Content-Type", "application/json");


	//  we build a list of user key for this party

	/*
    	console.log(req.params.partytag);
    	console.log(req.params.userID);
    	console.log(req.params.voteNumber);
    	*/

	//
     	// Step 1) save the party config info on redis
        //         the partyTag is the key
        
        //redis.incrby( 'set'+djsetid, 1 , function(err){




        redis.get( 'user/'+req.params.userID , function(err,udata){
                     	if (err) 
			{
				//res.send({ error: true });
				console.log('non'); 
			}
			else 
			{
				//res.send({ user: true });
				if (udata)
				{
				  // yes, it's a good cool user )
				  // now, we can search for the set ID
				  redis.get( 'now/'+req.params.partytag , function(err,ndata){
                                      if (!err)
                                      {
                                        //
                                        // Get the SET ID
                                        //

                                        var j= JSON.parse( ndata );
                                        var setid   = j["set"+req.params.voteNumber+"id"];
                                        var setname = j["set"+req.params.voteNumber+"name"]; 
                                      
                                        //
                                        // We need to check if the user allready voted
                                        //
					console.log('vote/'+ setid +  req.params.userID);
					
                                        redis.get( 'vote/'+ setid + req.params.userID , function(err,vdata){
						// if we are here
						// user ID is ok
						if (vdata == "voted")
						{
							//
							// allready voted
							//
							//console.log(" allready");
							res.send( {vote: 'allready', 'setname': setname } );
						}                    
						else
						{
							//
							// new vote
							//
							redis.incrby( 'set/'+setid, 1 );
							redis.set( 'vote/'+setid+req.params.userID, "voted" );
							console.log("*** New vote ****");
							res.send( {vote: 'voted', 'setname': setname} ); 
						}
						//console.log(' vdata' + vdata);

                                        }); // get vote

                                      }				  
				  });				  
				  				  
				}
				else
				{
				  // not a registred user id
				  res.send( {vote: false, err: 'unknow user' } );
				}
			}
                     //JSON.parse(data).set2id );
                     //console.log(udata);
                     //res.send();
         });
  
 
        // 1) get the current LIST
        /*         
     	redis.get( 'now/'+req.params.partytag, function(err,data){
		if (err) {  console.log('Cant save on redis'); }
     		else 
     		{  
     		   res.send(data);
     		   console.log(data);
     		  // JSON.parse(data).set2id );
     		  // is the user ID ok ?
     		  redis.get( 'user/'+req.params.userID , function(err,udata){
     		     if (err) { console.log('non'); };
     		     //JSON.parse(data).set2id );
     		     console.log(udata);
     		     //res.send();
     		  });
     		}
	}); // end 1)
	*/
	     
     

	/*      
              redis.rpush( 'user/'+req.body.partytag, userID  , function(err){
              if (err) {   console.log('Cant save on redis'); }
              });
     	*/
     
     	// 80s Basic style : we jump to admin interface
     	//res.redirect('/admin/'+ req.body.partytag );   
   	//  res.rend(" ok ");


};









 /*-----------------------------------------
  *
  * Admin Deskrop for DJ and manager
  *
  *-----------------------------------------
 */

exports.admin = function(req, res){

    var options = merge(req.params,res.locals.partyInfo);

    var html = pug.renderFile('./views/admin.pug', options);
    res.send(html);

};


 




 /*-----------------------------------------
  *
  * Publish a setlist 
  *
  *-----------------------------------------
 */
  
exports.publish = function(req, res){

 //    console.log('publish');
               
     redis.lindex( 'set/'+ req.params.partytag, req.params.setID , function(err,data){
          if (!err) 
          {
              // 3 lines for publish, remove, redirect...            
              //redis.lrem( 'set/'+ req.params.partytag, -1, data);
              redis.set( 'now/'+ req.params.partytag, data);
              res.redirect('/admin/'+ req.params.partytag );
          }
          else
          {
            console.log("redis eror " + err);
          }            
     });         

};



 /*-----------------------------------------
  *
  * Delete a setlist 
  *
  *-----------------------------------------
 */
  
exports.delete = function(req, res){

               
     redis.lindex( 'set/'+ req.params.partytag, req.params.setID , function(err,data){
          if (!err) 
          {
              res.redirect('/admin/'+ req.params.partytag);
             
             console.log(" set:"+ req.params.setID  +' = '+  data);
          
	     redis.lrem( 'set/'+ req.params.partytag, -1, data);

	
	 }
          else
          {
            console.log("redis eror " + err);
          }            
     });         

};








 /*-----------------------------------------
  *
  * JSON API for SET list 
  *
  *-----------------------------------------
 */
  
exports.setlist = function(req, res){

 
    //
    // Print the redis queue
    //
               
     redis.lrange( 'set/'+ req.params.partytag, 0, -1 , function(err,data){
  
  
        if (!err) 
        {
         res.header("Content-Type", "application/json");
         res.send( data );
         //console.log("iiiii" + data);
       }
       else
       {
         console.log("redis eror " + err);
       }
            
     });         
};




 /*-----------------------------------------
  *
  * JSON API for what under vote NOW 
  *  
  *-----------------------------------------
 */
  

exports.now = function(req, res){
 

    var output = {};
    var total = 0;

    res.header("Content-Type", "application/json");
       
    redis.get( 'now/'+ req.params.partytag, function(err,data){
        if (!err) 
        {
		res.send(data);
       }
       else
       {
         console.log("redis eror " + err);
       }
            
    });         
};



 /*-----------------------------------------
  *
  * JSON API for VOTE result
  *  
  *-----------------------------------------
 */
  

exports.vstat = function(req, res){
 

    var output = {};
    var total = 0;

    res.header("Content-Type", "application/json");


       
    redis.get( 'now/'+ req.params.partytag, function(err,data){
        if (data) 
        {
        if (JSON.parse(data).set1name){


         // var jsondata = JSON.parse(data);
         //  if (JSON.parse(data).set1id == "")

         // Vote 1
         redis.get( 'set/'+JSON.parse(data).set1id , function(err,xdata){
        // if (JSON.parse(data).set1name){

          if (xdata == null) output['vote1'] = 0;
          else output['vote1'] = parseInt(xdata);
                                                                
	   output['name1'] = JSON.parse(data).set1name
	   
	   console.log('x: '+ xdata);
           total++;

	         // Vote 2
        	 redis.get( 'set/'+JSON.parse(data).set2id , function(err,ydata){

                          if (ydata == null) output['vote2'] = 0;
                          else output['vote2'] = parseInt(ydata);
                                                                           		 
           		 output['name2'] = JSON.parse(data).set2name
           		
			//console.log('y: '+ ydata);
			total++;
         

         		// Vote 3
		         redis.get( 'set/'+JSON.parse(data).set3id , function(err,zdata){
           			
                                console.log('z: '+zdata);
           			if (zdata == null) output['vote3'] = 0;
                                else output['vote3'] = parseInt(zdata);
                                
           			output['name3'] = JSON.parse(data).set3name
				
				
				//console.log('z: '+ zdata);
           			total++;

				//console.log('fin'+ output.toString() );
				// finish :)
				res.send(output);

         		}); // end vote 3
		}); // end vote 2
         }); // end vote 1

          } // if value exist
       }
       else
       {
        // console.log("redis eror " + err);
       }
             
    }); // end get         

};





 /*-----------------------------------------
  *
  * Add a DJ set
  *
  *-----------------------------------------
 */
  
exports.addset = function(req, res){


  

   //
   // CGI detected
   //
   
   if (req.body.partytag)
   {
   
     //  we build a list of user key for this party
     console.log(req.body.partytag);
     console.log(req.body.set1);
     console.log(req.body.set2);
     console.log(req.body.set3); 

     //
     // Step 1) save the party config info on redis
     //         the partyTag is the key
               
     redis.rpush( 'set/'+req.body.partytag,  JSON.stringify( { 'partytag' :  req.body.partytag, 
                                                                'set1name':       req.body.set1,
                                                                'set2name':       req.body.set2,
                                                                'set3name':       req.body.set3,
                                                                
								'set1id':     uuid.v4(),
								'set2id':     uuid.v4(),
								'set3id':     uuid.v4()

                                                                } ) , function(err){
       if (err) {   console.log('Cant save on redis'); }
     });
     
     
     
     // 80s Basic style : we jump to admin interface
     res.redirect('/admin/'+ req.body.partytag );   
   
   }
   else
  { 
 	 res.rend("error");
  }

};






 /*-----------------------------------------
  *
  * Terminal QR Reader with webcam and html5
  *
  *-----------------------------------------
 */
          


exports.scan = function(req, res){
  res.render('scan', { 
                      title: 'QR Terninal for '+req.params.partytag, 
                      partytag: req.params.partytag
                      });
};



exports.steam = function(req, res){
  res.render('steam.pug', { title: 'Scan' });
};




/* Generate a QR code image from req.params.string */

var QRCode = require('qrcode');

exports.createQR = function(req, res){
    QRCode.toDataURL(req.params.string || "error", function (err, data) {
        console.log(data)
        var imagestring = data.split(',');
        var img = new Buffer(imagestring[1], 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    })
};





        /*-----------------------------------------
         * QR encoder to print
         *-----------------------------------------
        */

exports.encoder = function(req, res){

    console.log("Generating QR code for party", req.params.partytag);

    // QR managent

    var encoder = new Encoder;

    /*
    encoder.on('end', function(png_data){
                //res.header("Content-Type", "image/png")
                // png_data is an instance of Buffer
                //res.send(png_data);
    });
    */

    encoder.on('error', function(err){
        //
        // Something go wrong with the encoding
        //
        console.log('encoder() ERROR: ', err);
    });


        //
        // Step 1) get list of user 
        //
        
        redis.lrange( 'user/'+req.params.partytag , 0 , -1 , function(err, data){
            if (err) {
                console.log('user/'+req.params.partytag + ' | Cant read on redis.');
            } else  {

                console.log(data);

                //console.log(data);

                var table4print = "";
                var pagecutat   = 5;
                var cpt         = 0;


                for (var k in data) {

                          //
                          // New page after X QR printed
                          //

                          cpt++;

                          if (cpt >pagecutat)
                          {
                            table4print += '<div style="page-break-after:always;">';
                            cpt=0;
                          }
                          else
                          {
                             table4print += '<div>';
                          }

                      table4print += "<table border=0 cellspacing=0 cellpadding=0 ><tr>";
                      table4print += "<td valign=bottom align=center ><font size=+1>A</font></td>";
                      table4print += "<td valign=bottom align=center ><font size=+1>B</font></td>";
                      table4print += "<td valign=bottom align=center ><font size=+1>C</font></td>";
                      table4print += "<td valign=bottom align=center ><font size=+1>QR Party</font></td>";
                      table4print += "</tr>";

                      table4print += "<td valgn=top width=25% height=100 align=center><img src=/images/qr" + data[k] + '1.png ></td>';
                      table4print += "<td valgn=top width=25% height=100 align=center><img src=/images/qr" + data[k] + '2.png ></td>';
                      table4print += "<td valgn=top width=25% height=100 align=center><img src=/images/qr" + data[k] + '3.png ></td>';
                      table4print += "<td valgn=top width=25% height=100 >"+
                                     "<P><font size=-1 > ici"+
                                     "</font></P></td>";

                      table4print += "</tr></table></div>";
			  
			}

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


};




exports.steam = function(req, res){

  console.log('' + req.params.userID + ' - ' +req.params.voteNumber);

};
