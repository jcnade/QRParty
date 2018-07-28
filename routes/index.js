


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
    res.locals.json     = null;
    next()
};


exports.done = function(req, res) {
    if (res.locals.html) {
        res.send(res.locals.html);
    }

    if (res.locals.json) {
        res.json(res.locals.json);
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



exports.showQueue = function(req, res, next) {
    var options = merge(req.params, res.locals.partyInfo);
    res.locals.html = pug.renderFile("./views/queue.pug", options );
    next();
};



exports.showAPI = function(req, res, next) {
    var options = merge(req.params, res.locals.partyInfo);
    res.locals.html = pug.renderFile("./views/api.pug", options );
    next();
};


exports.forDJ = function(req, res, next) {
    var options = merge(req.params, res.locals.partyInfo);
    res.locals.html = pug.renderFile("./views/forDJ.pug", options );
    next();
};


exports.forVjay = function(req, res, next) {
    var options = merge(req.params, res.locals.partyInfo);
    res.locals.html = pug.renderFile("./views/vjay.pug", options );
    next();
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


exports.getQueue = function(req, res){

    var id = 'queue-'+ req.params.pid;

    redis.lrange( id, 0, 100 , function(err,data){
        if (!err)  {
            console.log(id);
            console.log(data);
            res.header("Content-Type", "application/json");
            res.send( data );
            //console.log("iiiii" + data);
        } else {
            res.status(500).send("500");
            console.error("getQueue() ERROR with redis.lrange", err);
        }
    });
};



// Get the nomber of vote from a DJ-SET
exports.getSetStat = function(req, res, next) {
    redis.get( 'now/'+ req.params.setid, function(err,string) {
        if (!err) {
            res.locals.html(string);
        } else {
            console.error("getSetStat ERROR", err);
            res.status(500).send("500")
        }
    });
};


exports.now = function(req, res, next){
    redis.get( 'now-'+ req.params.pid, function(err,data){
        if (!err) {
    		res.locals.json = data || {};
    		next();
        } else {
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
  

exports.vstat = function(req, res) {

};





 /*-----------------------------------------
  *
  * Add a DJ set
  *
  *-----------------------------------------
 */
  
exports.addQueue = function(req, res){

    var id =  'queue-'+req.params.pid;

    var payload = {
        'pid'      :  req.params.pid,
        'vid'      :  res.locals.partyInfo.vid || '0',
        'set1name' :  req.body.set1,
        'set2name' :  req.body.set2,
        'set3name' :  req.body.set3,
        'set1id'   :  'set1'+shortid.generate(),
        'set2id'   :  'set2'+shortid.generate(),
        'set3id'   :  'set3'+shortid.generate(),
    };

    redis.rpush( id ,  JSON.stringify(payload), function(err){
       if (err) {
           console.error('addQueue() ERROR with redis.rpush', err);
       } else {
           console.log("addset() RPUSH",id, JSON.stringify(payload))
       }
    });
     
   res.redirect('/admin/'+ req.params.pid);

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
        var imagestring = data.split(',');
        var img = new Buffer(imagestring[1], 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    })
};


exports.encoder = function(req, res){

    console.log("Generating QR code for party for", req.params.pid);
    console.log("Generating QR code for party usermax is ", res.locals.partyInfo.usermax);

    var table4print = "";
    var pagecutat   = 5;
    var cpt         = 0;
    var userId      = 0;
    var vid         = res.locals.partyInfo.vid;

    for (i = 0; i < parseInt(res.locals.partyInfo.usermax) ; i++) {

      userId=  'uid'+shortid.generate();

      if (cpt >pagecutat) {
        table4print += '<div style="page-break-after:always;">';
        cpt=0;
      } else {
         table4print += '<div>';
      }

      table4print += "<hr>";
      table4print += "<table border=0 cellspacing=0 cellpadding=0 ><tr>";
      table4print += "<td valign=bottom align=center ><font size=+1>A</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>B</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>C</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>QR Party</font></td>";
      table4print += "</tr>";

      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'-'+ userId + '-1.png  ></td>';
      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'-'+ userId + '-2.png  ></td>';
      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'-'+ userId + '-3.png  ></td>';
      table4print += "<td valgn=top width=25% height=100 >"+"<P><font size=-1 >"+res.locals.partyInfo.description+"</font></P></td>";
      table4print += "</tr></table></div>";
			  
	}

    res.send(table4print);


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
