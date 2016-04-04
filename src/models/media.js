'use strict'

var mongoose = require('mongoose'); 

var mediaSchema = new mongoose.Schema({
	url: String, 
	username: String, 
	userphoto: String, 
	link: String, 
	time: String, 
	poster: String, 
	tag: String, 
	type: String
}); 

var model = mongoose.model('Media', mediaSchema); 

module.exports = model; 