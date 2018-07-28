



//
// Loading public modules
//
var config = require("config");
var express         = require('express');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');


//
// Loading internal kitchen
//
var routes  = require('./routes/index');
var user    = require('./routes/user');


// Express Config
var app     = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(function(req, res, next) {
    // Basic Log
    console.log(req.method, req.originalUrl);
    next();
});



//
// we need redis
//

/*

    var redis  = require("redis");
    var config = require("config");
    var uuid = require('node-uuid');

    redis = redis.createClient(config.redis.port, config.redis.host);

    redis.on("error", function (err) {
      console.log(" Can't connect to redis " + err);
    });
*/





// First Page for visitors
app.get('/',
    routes.init,
    routes.index,
    routes.done);


// Starting a new party (form)
app.get('/start/:pid',
    routes.init,
    routes.partyForm,
    routes.done);

// Starting a new party (saving data)
app.post('/start/:pid',
    routes.init,
    routes.partyStore,
    routes.done);

// Event manager Board
app.get('/admin/:pid',
    routes.init,
    routes.getPartyInfo,
    routes.admin,
    routes.done);

app.post('/queue/:pid',
    routes.init,
    routes.getPartyInfo,
    routes.addQueue,
    routes.done);

app.get('/queue/:pid',
    routes.init,
    routes.getPartyInfo,
    routes.showQueue,
    routes.done);

// Dashboard for DJ
app.get('/dj/:pid',
    routes.init,
    routes.getPartyInfo,
    routes.forDJ,
    routes.done);

// Dashboard for VJAY Screen
app.get('/vjay/:pid',
    routes.init,
    routes.forVjay,
    routes.done);


// REST API User's Documentation
app.get('/api/:pid',
    routes.init,
    routes.getPartyInfo,
    routes.showAPI,
    routes.done);




//-----------------------------------------
// REST API Calls - Get The Queue List
// ----------------------------------------
app.get('/v1/queue/:pid',
    routes.init,
    routes.getQueue,
    routes.done);

app.get('/v1/now/:pid',
    routes.init,
    routes.now,
    routes.done);

app.get('/v1/set/:setid',
    routes.init,
    routes.getSetStat,
    routes.done);

app.get('/scan/:partytag',
    routes.scan);

app.get('/steam',
    routes.steam);

app.get('/vote/:partytag/:userID/:voteNumber',
    routes.vote);

app.get('/encoder/:partytag',
    routes.encoder);

app.get('/images/:id',
    routes.createQR);

app.get('/qr/:userid/:number',
    routes.qr);



app.get('/publish/:partytag/:setID',
    routes.publish );

app.get('/delete/:partytag/:setID',
    routes.delete );


app.get('/users',
    user.list);

app.get('/vote/:partytag/:userid/:setid',
    routes.vote);


app.listen(config.service.port, function () {
    console.log("starting", config.service.name, "on port", config.service.port);
});


















