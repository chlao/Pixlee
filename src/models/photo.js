'use strict'

var mongoose = require('mongoose'); 

// Define a schema 
var photoSchema = new mongoose.Schema({
	url: String, 
	userphoto: String, 
	link: String, 
	time: String
}); 

var model = mongoose.model('Photo', photoSchema); 

module.exports = model; 