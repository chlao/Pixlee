'use strict'; 

var mongoose = require('mongoose'); 

// Parameter: url to mongo database, callback for connection 
mongoose.connect('mongodburl', function(err){
	if (err){
		console.log('Error: ' + err); 
	}
	else{
		console.log('Successfully connected'); 
	}
}); 