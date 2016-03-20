'use strict'

var mongoose = require('mongoose'); 

// Define a schema 
var photoSchema = new mongoose.Schema({
	name: String, 
	img: String
}); 

var model = mongoose.model('Photo', photoSchema); 

module.exports = model; 