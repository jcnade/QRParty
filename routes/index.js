
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Hey DJ!' });
};


exports.scan = function(req, res){
  res.render('scan', { title: 'Scan' });
};


exports.steam = function(req, res){
  res.render('steam.jade', { title: 'Scan' });
};



/*
 * QR code generqtor 
 */

exports.encoder = function(req, res){

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

	encoder.encode('hello world');

  //res.render('encoder.jade', { title: 'QR Encoder' });
};



exports.steam = function(req, res){

  console.log('' + req.params.userID + ' - ' +req.params.voteNumber);
  //res.render('steam.jade', { title: 'Scan' });
};
