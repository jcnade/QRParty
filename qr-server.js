
/**
 * Module dependencies.
 */

var config = require("config");

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', config.service.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
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


//
// URL
//


app.get('/',
    routes.index);

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

app.get('/make',
    routes.make);

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

app.post('/make',
    routes.make);

app.post('/addset',
    routes.addset);

app.get('/users',
    user.list);

app.get('/vote/:partytag/:userid/:setid',
    routes.vote);


http.createServer(app).listen(app.get('port'), function(){
  console.log("starting", config.service.name, "on port", config.service.port);
});


















