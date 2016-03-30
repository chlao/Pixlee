'use strict'; 

var mongoose = require('mongoose'); 

// Parameter: url to mongo database, callback for connection 
mongoose.connect('mongodb://clao:dbpassword@ds025439.mlab.com:25439/pixlee', function(err){
	if (err){
		console.log('Error: ' + err); 
	}
	else{
		console.log('Successfully connected to database'); 
	}
}); 