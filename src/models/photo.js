'use strict'

var mongoose = require('mongoose'); 

// Define a schema 
var photoSchema = new mongoose.Schema({
	url: String, 
	username: String, 
	userphoto: String, 
	link: String, 
	time: String, 
	tag: String
}); 

var model = mongoose.model('Photo', photoSchema); 

module.exports = model; 