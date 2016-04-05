var angularapp = angular.module('pixleemini', []);

// A filter formats the value of an expression for display to the user 
angularapp.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

// Service: functions reponsible to do specific tasks only - properties on this available in controller (service instantiated w/ new)
// Factory: return an object literal instead of working w/ this 
angularapp.service('debounce', ['$timeout', function ($timeout) {
    return function (func, wait, immediate, invokeApply) {
		// timeout: private variable for instance - returned function will be able to reference this due to closure 
		// Each call to the returned fnuction will share this common timer 
		var timeout, args, context, result;
		function debounce() {
			// Reference the context and args for the setTimeout function 
			context = this;
			args = arguments;

			var later = function () {
			  timeout = null;
			  if (!immediate) {
			    result = func.apply(context, args);
			  }
			};
			// Should the function be called now - if immediate is true, and not already called in timeout, yes
			var callNow = immediate && !timeout;

			// Each time the returned function is called, the timer starts over 
			// Will not do anything if invalid timeout id passed in 
			if (timeout) {
			  $timeout.cancel(timeout);
			}

			timeout = $timeout(later, wait, invokeApply);
			
			// Immediate mode and no wait timer - execute the function 
			if (callNow) {
			  result = func.apply(context, args);
			}
			return result;
			}
			debounce.cancel = function () {
				$timeout.cancel(timeout);
				timeout = null;
			};
			return debounce;
		};
 	}
]);

angularapp.service('checkinput', function(){
	this.handleError = function(scope, reason){
		switch(reason){
			case 'undefined': 
				scope.errortype = 'undefined'; 
				break; 
			case 'invalid': 
				scope.errortype = 'invalid'; 
				break; 
			case 'future': 
				scope.errortype = 'future'; 
				break; 
			case 'noresults': 
				scope.errortype = 'noresults'; 
				break; 
		}

		scope.error = true; 
		scope.loading = false; 
	}
}); 

angularapp.service('dataservice', function($http, $q, checkinput){
	this.getmedia = function(scope){
		$http.get('/api/medium').then(function(response){
			var medium = response.data.medium;
			scope.medium = medium;
		});
	}

	this.savemedium = function(media){
		var queue = [];

		// Save the media
	    var request = $http.post('/api/medium', media); 

	    queue.push(request); 

	    // A new promise instance is created when a deferred instance is created; assurance that we will get a result from an action at some point in the future 
	    // Need promises to make decisions based on the possible results of our call

	    // all: combines multiple promises into a single promise that's resolved when all of the input promises are resolved 
	    $q.all(queue); 
	}

	// Fliter out the results by time, and format the data to store in the database 
	this.processmedia = function(scope, data, numResults){
		var i = 0; 
    	var numMedia = data.data.length; 

    	// Check if the media type is a video or a photo
		var video = false; 

		// Normalize the date to compare with inputs 
		var dateTime; 

		var time, hour, minute, hourminute; 

		// Stores the media object that we are saving
		var media; 

		// Swap the start and end values if start > end 
		var tempstart; 

		var currentTime; 
		var dateCurrentTime; 

		var duplicate = false; 

		// No results exist for that tag 
		if (numMedia == 0){
			checkinput.handleError(scope, 'noresults'); 
			return; 
		}

		// Input: search times
		var start = new Date(scope.start); 
		var end = new Date(scope.end); 
		// Epoch time 
		start = start.getTime()/1000; 
		end = end.getTime()/1000; 

		currentTime = new Date(); 

		dateCurrentTime = currentTime.getTime() - currentTime.getHours() * 3600000 - currentTime.getMinutes() * 60000 - currentTime.getSeconds() * 1000; 
		dateCurrentTime = Number(String(dateCurrentTime).substring(0,10));

		if (start > dateCurrentTime || end > dateCurrentTime){ 
			checkinput.handleError(scope,'future'); 
			return; 
		}	 

		// Pagination - next url 
		scope.nexturl = data.pagination.next_url;   

		// Warning
		if (end != 0 && start > end){
			tempstart = start; 
			start = end; 
			end = tempstart; 

    		scope.error = true; 
    		scope.errortype = "startend"; 
		}


    	for (; i < numMedia; i++){ 
    		// Check if there is a caption
    		if (data.data[i].caption != null){
				time = new Date(data.data[i].caption.created_time * 1000); 
			}

    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
    		if(data.data[i].comments.count != 0){ // Check if there are comments 
    			var j = 0; 
    			for (; j < data.data[i].comments.data.length; j++){
    				// Check if comments contain the tag, and the comment is from the submitter, and if a caption exists, the caption does not contain the tag 
					if ((data.data[i].comments.data[j].text.indexOf('#' + scope.tagname) > -1) && 
						(data.data[i].comments.data[j].from.username == data.data[i].user.username) &&
						(data.data[i].caption == null || data.data[i].caption.text.indexOf('#' + scope.tagname) == -1)){
							time = new Date(data.data[i].comments.data[j].created_time * 1000); 
					}
				}	    		
			} 

			if (typeof time == 'undefined'){
				console.log(data.data[i]); 
			}

			dateTime = time.getTime() - time.getHours() * 3600000 - time.getMinutes() * 60000 - time.getSeconds() * 1000; 
			dateTime = Number(String(dateTime).substring(0,10));

			// Only show posts that are within the searched parameters 
			if ((end != 0 && dateTime > end) || (start != 0 && dateTime < start)){
				continue;
			}

			if (data.data[i].type == "video"){
    			video = true; 
    		}

			hour = time.getHours(); 
			minute = time.getMinutes(); 

			// Append a '0' to the beginning 
			if (String(minute).length == 1){
				minute = '0' + String(minute); 
			}

			// Use American time standards (not 24-hour, AM and PM)
			if (hour > 12){
				hour = hour % 12; 
				hourminute = String(hour) + ':' + minute + ' PM'; 
			} else{
				hourminute = String(hour) + ':' + minute + ' AM'; 
			}

			year = String(time.getYear()).substring(1); 

			time = (time.getMonth() + 1) + '/' + time.getDate() + '/' + year + ' at ' + hourminute; 

			media = {
				username: data.data[i].user.username, 
				userphoto: data.data[i].user.profile_picture, 
				link: data.data[i].link, 
				time: time, 
				tag: scope.tagname, 
				id: data.data[i].id, 
			};

    		if (video == true){ 
    			media.url = data.data[i].videos.standard_resolution.url; 
    			media.poster = data.data[i].images.standard_resolution.url; 
    			media.type = "video"; 
    		} else{
    			media.url = data.data[i].images.standard_resolution.url; 
    			media.type = "photo"; 
			}

			// Reset variable
			video = false; 

			var k = scope.medium.length - 1; 
			for (; k >= 0; k--){
				if (media.id == scope.medium[k].id){
					duplicate = true; 
					break; 
				}
			}

			if (duplicate){
				duplicate = false; // Reset variable
				continue; 
			}

			scope.medium.push(media); 
			this.savemedium(media); 

			// Increment the number of results found 
			numResults++; 
		}
		return numResults; 
	}
}); 

// Directive - Something introduces new syntax i.e. in a HTML element, attribute, etc. 
// Upon scrolling near the end of the results, load more results 
angularapp.directive("scroll", function($window, $document){
	return {
		restrict: 'A', 
		link: function(scope, element, attrs){
			angular.element($window).bind('scroll', function() {
				var windowHeight = "innerHeight" in window ? window.innerHeight
							: document.documentElement.offsetHeight;
				var body = document.body
				var html = document.documentElement;
				var docHeight = Math.max(body.scrollHeight,
						body.offsetHeight, html.clientHeight,
						html.scrollHeight, html.offsetHeight);
				windowBottom = windowHeight + window.pageYOffset;
				if (windowBottom >= docHeight && scope.tagname) {
					scope.more(); 
					// $apply runs $rootScope.$digest() to update values 
					// $apply tells Angular of the changes made outside the Angular context 
					scope.$apply(); 
				}
			});
		}
	}
}); 
// Controller: contain logic for manipulating UI, determine the state of the application; can handle data  
// $scope = area of operation for controller; will only work part of application you've allowed them to 

// Data binding means that when you change something in the view, the scope model automatically updates 
angularapp.controller('mainCtrl', function($scope, $window, $http, debounce, dataservice, checkinput){
	$scope.nexturl; // Pagination: next results 

	$scope.medium = []; 

	$scope.loading = false;  

	$scope.error = false; 

	// Display the photos and videos when the page loads 
	angular.element(document).ready(function(){
		dataservice.getmedia($scope); 
	});

	// Scroll to add more
	$scope.more = debounce(function(){ 
		// If there currently pictures loading, do not look for more pictures 
		if ($scope.loading){
			return; 
		}

		$scope.loading = true; 

		$scope.recurse(0); 
	}, 500); // Parameters are optional in JS - will be undefined if not passed in

	$scope.tagChange = function(){ 
		$scope.loading = true; 
		$scope.error = false; 

		// Number of results we get from the API call 
		var numResults;

		// Store position of the end of page, or where the new results will show 
		var prepageposition; 

		// If there was no tag defined as input 
		if (typeof $scope.tagname == 'undefined'){
			checkinput.handleError($scope, 'undefined'); 
			return; 
		} else if ($scope.tagname.indexOf(' ') >= 0 || $scope.tagname.length == 0){
			checkinput.handleError($scope, 'invalid'); 
			return; 
		}

		$http.jsonp('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&callback=JSON_CALLBACK')
		.success(function(data){ 
			// Previous document height 
			prevpageposition = $(document).height();

			numResults = dataservice.processmedia($scope, data, 0);  

			$('body').animate({scrollTop: prevpageposition}, 'slow');

	    	if (numResults < 20){
	    		$scope.recurse(numResults); 
	    	} else{ // > 20 Results found
	    		$scope.loading = false; 
	    	}
		});
	};

	$scope.recurse = function(prevNumResults){
		var numResults;
		$http.jsonp($scope.nexturl + '&callback=JSON_CALLBACK')
		.success(function(data){
			numResults = dataservice.processmedia($scope, data, prevNumResults); 

	    	if (numResults < 20){
	    		$scope.recurse(numResults); 
	    	} else{
	    		$scope.loading = false; 
	    	}
		});
	};
});
