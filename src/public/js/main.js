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

angularapp.service('dataservice', function($http, $q){
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

	this.processmedia = function(scope, data, start, end, numResults){
		var i = 0; 
    	var time; 
    	var url; 
    	var numMedia = data.data.length; 

		var video = false; 

		// Normalize the date to compare with inputs 
		var dateTime; 

		var hour, minute, hourminute; 

		// Pagination - next url 
		scope.nexturl = data.pagination.next_url;   

    	for (; i < numMedia; i++){ 
    		// Check if there is a caption
    		if (data.data[i].caption != null){
				time = new Date(data.data[i].caption.created_time * 1000); 
			}

    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
    		if(data.data[i].comments.count != 0){ // Check if there are comments 
    			var j = 0; 
    			for (; j < data.data[i].comments.data.length; j++){
    				// Check if comments contain the tag, and the comment is from the submitter, and caption does not contain the tag 
					if ((data.data[i].comments.data[j].text.indexOf('#' + scope.tagname) > -1) && 
						(data.data[i].comments.data[j].from.username == data.data[i].user.username) && 
						(data.data[i].caption != null && data.data[i].caption.text.indexOf('#' + scope.tagname) == -1)){
							time = new Date(data.data[i].comments.data[j].created_time * 1000); 
					}
				}	    		
			} 

			if (typeof time === undefined){
				console.log(data.data[i]); 
			}

			dateTime = time.getTime() - time.getHours() * 3600000 - time.getMinutes() * 60000 - time.getSeconds() * 1000; 
			dateTime = Number(String(dateTime).substring(0,10));

			// Only show posts that are within the searched parameters 
			if (end != 0 && dateTime > end || start != 0 && dateTime < start){
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

			if (hour > 12){
				hour = hour % 12; 
				hourminute = String(hour) + ':' + minute + ' PM'; 
			}
			else{
				hourminute = String(hour) + ':' + minute + ' AM'; 
			}

			year = String(time.getYear()).substring(1); 

			var time = (time.getMonth() + 1) + '/' + time.getDate() + '/' + year + ' at ' + hourminute; 

			var media; 

    		if (video == true){ 
    			media = JSON.parse('{"url":"' + data.data[i].videos.standard_resolution.url + '", "username":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '", "poster":"' + data.data[i].images.standard_resolution.url + '", "tag":"' + scope.tagname + '", "type": "video"}'); 
    		}
    		else{
    			media = JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "username":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '", "tag":"' + scope.tagname + '", "type": "photo"}'); 
			}

			scope.medium.push(media); 
			this.savemedium(media); 

			// Reset variable
			video = false; 

			numResults++; 
		}

		return numResults; 
	}
}); 

// Directive - Something introduces new syntax i.e. in a HTML element, attribute, etc. 
// Upon scrolling near the body, load more results 
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
					scope.$apply(); 
				}
			});
		}
	}
}); 
// Controller: contain logic for manipulating UI, determine the state of the application; can handle data  
// $scope = area of operation for controller; will only work part of application you've allowed them to 
angularapp.controller('mainCtrl', function($scope, $window, $http, debounce, dataservice){
	$scope.nexturl; // Pagination: next results 

	$scope.medium = []; 

	$scope.loading = false; 
	$scope.loadingmore = false;  

	var start = new Date($scope.start); 
	var end = new Date($scope.end); 

	// Epoch time 
	start = String(start.getTime()/1000); 
	end = String(end.getTime()/1000); 

	$scope.changeDate = function(){
		start = new Date($scope.start); 
		end = new Date($scope.end); 

		// Epoch time 
		start = String(start.getTime()/1000); 
		end = String(end.getTime()/1000); 
	}

	// Display the photos and videos when the page loads 
	angular.element(document).ready(function(){
		dataservice.getmedia($scope); 
	});

	// Scroll to add more
	$scope.more = debounce(function(){ 
		// If there currently pictures loading, do not look for more pictures 
		if (!$scope.loading && !$scope.loadingmore){
			$scope.loadingmore = true; 
			$http.jsonp($scope.nexturl + '&callback=JSON_CALLBACK')
			.success(function(data){
		    	var numResults = dataservice.processmedia($scope, data, start, end, 0); 

		    	if (numResults < 20){
		    		console.log('more'); 
		    		$scope.recurse(numResults); 
		    	}
				else{
					$scope.loadingmore = false; 
				}
			});
		}
	}, 500); // Parameters are optional in JS - will be undefined if not passed in

	$scope.tagChange = function(){
		$scope.loading = true; 

		var numResults;

		$http.jsonp('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&callback=JSON_CALLBACK')
		.success(function(data){ 
			// Previous document height 
			var prevpageposition = $(document).height();

			numResults = dataservice.processmedia($scope, data, start, end, 0); 

			console.log(numResults); 

	    	if (numResults < 20){
	    		$scope.recurse(numResults); 
	    	}

	    	$('body').animate({scrollTop: prevpageposition}, 'slow');
		});
	};

	$scope.recurse = function(prevNumResults){
		var numResults;
		$http.jsonp($scope.nexturl + '&callback=JSON_CALLBACK')
		.success(function(data){
			numResults = dataservice.processmedia($scope, data, start, end, prevNumResults); 

			console.log(numResults); 
			console.log($scope.medium); 

	    	if (numResults < 20){
	    		$scope.recurse(numResults); 
	    	}
	    	else{
	    		$scope.loading = false; 
	    	}
		});
	};
});
