



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

app.get('/scan/:partytag',
    routes.scan);

app.get('/vjay/:partytag/:style',
    routes.vjay);

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


app.get('/admin/:partytag',
    routes.admin);

app.get('/json/setlist/:partytag',
    routes.setlist);

app.get('/json/now/:partytag',
    routes.now);

app.get('/json/vstat/:partytag',
    routes.vstat);

app.get('/publish/:partytag/:setID',
    routes.publish );

app.get('/delete/:partytag/:setID',
    routes.delete );

app.post('/addset',
    routes.addset);

app.get('/users',
    user.list);

app.get('/vote/:partytag/:userid/:setid',
    routes.vote);


app.listen(config.service.port, function () {
    console.log("starting", config.service.name, "on port", config.service.port);
});


















