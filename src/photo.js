var https = require("https"); 
var http = require("http"); 

function printError(error){
	console.error(error.message);
}

function getPhotos(tagname){
	var request = https.get("https://api.instagram.com/v1/tags/" + tagname + "/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b", function(response){
		var messageBody = ""; 

		// Packet of data received 
		response.on('data', function(chunk){
			messageBody += chunk; 
		});

		// Finish receiving all the packets of data 
		response.on('end', function(){ 
			if (response.statusCode === 200){
				try{
					console.log(messageBody);
					// Convert string to object
					var photos = JSON.parse(messageBody); 
					console.dir(photos);
				} catch (error){
					// Parse Error 
					printError(error); 
				}
			}
			else{
				// Status code error - pass in object w/ message property (same interface as error)
				printError({message: "There was an error getting the photos tagged with " + tagname + ". (" + http.STATUS_CODES[response.statusCode] + ")"}); 
			}
		});
	});
	// Connection Error 
	request.on('error', printError);
}

// Export the function (accessible when you require this module from another file)
module.exports.get = getPhotos; 