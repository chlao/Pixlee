'use strict';

/* Routes = endpoint, what users use to access data (URL)
   Server set up to espond to a request from client 
   Tell server what to do when user visits URL (what content to display, where to direct them)
*/

var photos = require('./photo.js');
var express = require('express'); // Can use express to access all of the variable's methods, etc. 

var app = express(); 

// Add static server; middleware: logic that tells express how to handle a request in b/t the time request is made by client and b/f it arrives at a route 
// express.static('path_to_the_public_folder')
app.use(express.static(__dirname + '/public')); 

app.set('view engine', 'jade'); // Looks for files w/ jade extension 
// Define where express will look for templates - node process starts in root, not in src directory
// __dirname = name of the directory that the currently executing script resides in 
app.set('views', __dirname + '/views'); 

// Create a route for a client that makes a GET request at certain URL 
app.get('/', function(request, response){
	// Can be used to send HTML 
	//response.send("<h1>Hi!</h1>"); 
	response.render('index'); 
}); 

// Add a new route - ? (parameter is optional)
app.get('/pixlee/:tagname?', function(request, response){
	var tagname = request.params.tagname; 
	if (tagname === undefined){
		// 503 - Service Unavailable 
		//response.statusCode(503); 
		//response.send("That tag did not turn up any photos"); 
		//response.render(''); 
	}
	else{
		var post = photos.get(tagname); 
		//response.send(post);

		// Will still try to render template even if not found 
		//var varname = || {}; 

		// Can access variable in template by passing in as second parameter 
		//response.locals - stores variables that will be accessible in the template
		//response.render('templatefilename', {varname: varname});  
	}
}); 

// Set up development server 
var server = app.listen(3000, function(){
	var host = server.address().address;
  	var port = server.address().port;

  	console.log('Application listening at http://%s:%s', host, port);
}); 

// Direct your user to authorization URL 
//window.location = "https://api.instagram.com/oauth/authorize/?client_id=746c59e19d514763a9a7d5fb1547b7da&redirect_uri=REDIRECT-URI&response_type=code"

// Recieve the redirect from Instagram

