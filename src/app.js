'use strict';

/* Routes = endpoint, what users use to access data (URL)
   Server set up to espond to a request from client 
   Tell server what to do when user visits URL (what content to display, where to direct them)
*/
var express = require('express'); // Can use express to access all of the variable's methods, etc. 

var Media = require('./models/media'); // Database schema

//
var parser = require('body-parser'); 

// Create an instrance of express - allows us to set up any middleware, configure routes, start the server 
var app = express(); 

require('./database'); 

// Add static server; middleware: logic that tells express how to handle a request in b/t the time request is made by client and b/f it arrives at a route 
// express.static('path_to_the_public_folder')
app.use(express.static(__dirname + '/public'));
//app.use(cors());
app.use(parser.json()); 

// Create modular, mountable route handlers, mini app is returned (v. app object w/ express() - Express application)
var router = express.Router(); 

// Prefix 'api' to prevent conflict w/ static files routes 
app.use('/api', router); 

router.get('/medium', function(request, response){
	Media.find(function(err, media){
		if (err){
			// 500: Internal Server Error 
			return response.status(500).json({message: err.message}); 
		}
		else {
			response.json({'medium': media}); 
		}
	})
}); 

router.post('/medium', function(request, response){
	var media = request.body; 
	Media.create(media, function(err, media){
		if (err){
			// Callback function will ext 
			return response.status(500).json({err: err.message}); 
		}
		// If no body parser installed, will probably get back empty response body 
		response.json({'medium': media}); 
	})
}); 

// Set up development server 
var server = app.listen(process.env.PORT || 5000, function(){
	var host = server.address().address;
  	var port = server.address().port;

  	console.log('Application listening at http://%s:%s', host, port);
}); 
