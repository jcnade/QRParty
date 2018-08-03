


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
    res.locals.vid        = null; // Public Voting ID
    res.locals.pid        = null; // Private Party ID
    res.locals.html       = null;
    res.locals.redirect   = null;
    res.locals.json       = null;
    res.locals.partyInfo  = null;
    res.locals.votingInfo = null;
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
            if (res.locals.partyInfo && res.locals.partyInfo.vid) {
                res.locals.vid = res.locals.partyInfo.vid;
            }
            console.log("------------------");
            console.log("partyInfo");
            console.log(res.locals.partyInfo);
            console.log("------------------");

            next();
        }
    });

};


exports.getVotingInfo = function (req,res, next) {

    var vid = res.locals.vid || req.params.vid || res.locals.partyInfo.vid;

    redis.get( 'now-'+vid , function(err,string){
        if (err) {
            res.status(500).send("500 - Service unavailable (redis)");
            console.error('getVotingInfo() ERROR with redis.get()', err);
        } else {
            res.locals.votingInfo = null;
            try {
                res.locals.votingInfo = JSON.parse(string);
            } catch(e) {
                res.status(500).send("500 - Service unavailable (JSON.parse)");
                console.error('partyStore() ERROR with JSON.Parse', e);
            }
            console.log(res.locals.votingInfo);
            next();
        }
    });
};


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

        var partyInfo         = merge(req.params, req.body);
            partyInfo['vid']  = 'vid'+shortid.generate(); // public voting id

        redis.set( req.params.pid, JSON.stringify(partyInfo), function(err){
            if (err) {
                res.status(500).send("500 - Service offline (redis)");
                console.error('partyStore() ERROR with redis.set()', err);
            } else {
                res.locals.vid       = partyInfo['vid'];
                res.locals.partyInfo = partyInfo;
                res.locals.html      = null;
                res.locals.redirect  = '/admin/'+ req.params.pid;
                next();
            }
        });
};


// Saving Public Voting Info
exports.setVotingInfo = function(req, res, next){

    var votingInfo         = res.locals.partyInfo;
        votingInfo['show'] = 'welcome';

    redis.set( 'now-'+req.params.vid, JSON.stringify(votingInfo), function(err){
        if (err) {
            res.status(500).send("500 - Service offline (redis)");
            console.error('displayInit() ERROR with redis.set()', err);
        } else {
            next();
        }
    });
};












/*-----------------------------------------
 *
 * vote
 *
 *-----------------------------------------
*/

  
exports.vote = function(req, res){

    res.header("Content-Type", "application/json");

    redis.get( 'now-'+req.params.vid , function(err,ndata){
        if (!err) {
            // Get the SET ID
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
						if (vdata == "voted") {
							//
							// allready voted
							//
							//console.log(" allready");
							res.send( {vote: 'allready', 'setname': setname } );
						} else {
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
    var options = merge(req.params, res.locals.votingInfo);
    res.locals.html = pug.renderFile("./views/vjay.pug", options );
    next();
};


exports.vote = function(req, res, next) {
    var options = merge(req.params, res.locals.votingInfo);
    res.locals.html = pug.renderFile("./views/vote.pug", options );
    next();
};








exports.publish = function(req, res){

     redis.lindex( 'queue-'+ req.params.pid, req.params.setID , function(err,data){
          if (!err)  {

              // Updating a field in data but its a string so
              // we havce to parse it
              var temp = JSON.parse(data);
                  temp['show'] = 'vote';
                  temp['time'] =  Date.now();
                  data = JSON.stringify(temp);

              redis.set( 'now-'+ res.locals.partyInfo.vid, data, function(err){
                  if (err) {
                      console.error('publish() ERROR with redis.set :',err)
                  }
              });

              // removing the element
              redis.lrem( 'queue-'+ req.params.pid, req.params.setID, data);

              res.redirect('/dj/'+ req.params.pid);
          } else {
              //
              // Didn't work :/
              //
              res.status(500).send("500 - can not publish");
              console.log("publish() ERROR with redis - ", err);
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
    redis.get( 'now-'+ req.params.vid, function(err,data){
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
        'minutes'  :  parseInt(req.body.minutes)
    };

    redis.rpush( id ,  JSON.stringify(payload), function(err){
       if (err) {
           console.error('addQueue() ERROR with redis.rpush', err);
           res.status(500).send("500 - Can not save");
       } else {
           console.log("addset() RPUSH",id, JSON.stringify(payload))
           res.redirect('/dj/'+ req.params.pid);

       }
    });
     

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
    var pagecutat   = 4;
    var cpt         = pagecutat;
    var pageID      = 1;
    var userId      = 0;
    var vid         = res.locals.partyInfo.vid;

    for (i = 0; i < parseInt(res.locals.partyInfo.usermax) ; i++) {

      userId=  'uid'+shortid.generate();

      if (cpt >= pagecutat ) {
        table4print += '<div style="page-break-after:always;"></div>';
        table4print += 'Page '+pageID;
        pageID++;
        cpt=0;
      } else {
         table4print += '<div>';
         cpt++;
      }

      table4print += "<hr>";
      table4print += "<table border=0 cellspacing=0 cellpadding=0 ><tr>";
      table4print += "<td valign=bottom align=center ><font size=+1>A</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>B</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>C</font></td>";
      table4print += "<td valign=bottom align=center ><font size=+1>QR Party</font></td>";
      table4print += "</tr>";

      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'|'+ userId + '|1|.png  ></td>';
      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'|'+ userId + '|2|.png  ></td>';
      table4print += "<td valgn=top width=25% height=100 align=center><img src=/qr/" + vid +'|'+ userId + '|3|.png  ></td>';
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
