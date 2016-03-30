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
	this.getphotos = function(scope){
		$http.get('/api/photos').then(function(response){
			var photos = response.data.photos;
			scope.photos = photos;
		});
	}

	this.getvideos = function(scope){
		$http.get('/api/videos').then(function(response){
			var videos = response.data.videos;
			scope.videos = videos;
		});
	}

	this.savephotos = function(photo){
		var queue = [];

	    // Save the photos 
	    var request = $http.post('/api/photos', photo); 

	    queue.push(request); 

	    // A new promise instance is created when a deferred instance is created; assurance that we will get a result from an action at some point in the future 
	    // Need promises to make deciisons based on the possible results of our call

	    // all: combines multiple promises into a single promise that's resolved when all of the input promises are resolved 
	    $q.all(queue); 
	}

	this.savevideos = function(video){
		var queue = [];
	    var request = $http.post('/api/videos', video); 

	    queue.push(request); 
	    $q.all(queue); 
	}

	this.processmedia = function(scope, data, more){
		var i = 0; 
    	var time; 
    	var url; 
    	var numMedia = data.data.length; 

		var video = false; 

		// Pagination - next url 
		scope.nexturl = data.pagination.next_url;  

    	for (; i < numMedia; i++){
    		if (data.data[i].type == "video"){
    			video = true; 
    		}

    		time = new Date(data.data[i].caption.created_time * 1000); 

    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
    		if(data.data[i].comments.count != 0){ // Check if there are comments 
    			var j = 0; 
    			for (; j < data.data[i].comments.data.length; j++){
    				// Check if comments contain the tag, and the comment is from the submitter, and caption does not contain the tag 
					if ((data.data[i].comments.data[j].text.indexOf('#' + scope.tagname) > -1) && 
						(data.data[i].comments.data[j].from.username == data.data[i].user.username) &&
						(data.data[i].caption.text.indexOf('#' + scope.tagname) == -1)){

						time = new Date(data.data[i].comments.data[j].created_time * 1000); 
					}
				}	    		
			}

			var hour = time.getHours(); 
			var minute = time.getMinutes(); 
			var hourminute; 

			if (String(minute.length) == 1){
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

    		// Only show posts that are within the searched parameters 
    		//if(time.getTime() >= start.getTime() && time.getTime() <= end.getTime()){
    		if (video == true){
    			var video = JSON.parse('{"url":"' + data.data[i].videos.standard_resolution.url + '", "username":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '", "poster":"' + data.data[i].images.standard_resolution.url + '", "tag":"' + scope.tagname + '"}'); 
    			if(more == true){
    				scope.videos.push(video); 
    			}
    			else{
    				scope.videos.unshift(video); 
    			}
    			this.savevideos(video); 
    		}
    		else{
    			var photo = JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "username":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '", "tag":"' + scope.tagname + '"}'); 
				
				if(more == true){
    				scope.photos.push(photo);
    			}
    			else{
    				scope.photos.unshift(photo);
    			}

				this.savephotos(photo); 
			}
		}
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
				var body = document.body, html = document.documentElement;
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
angularapp.controller('mainCtrl', function($scope, $location, $window, $http, debounce, dataservice){
	$scope.nexturl; // Pagination: next results 

	$scope.photos = [];
	$scope.videos = []; 

	$scope.loading = false; 
	$scope.loadingmore = false; 

	// Display the photos when the page loads 
	angular.element(document).ready(function(){
		dataservice.getphotos($scope); 
		dataservice.getvideos($scope); 
	});

	// Scroll to add more
	$scope.more = debounce(function(){
		$scope.loadingmore = true; 
		$http.jsonp($scope.nexturl + '&callback=JSON_CALLBACK')
		.success(function(data){
	    	dataservice.processmedia($scope, data, true); 
	    	$scope.loadingmore = false; 
		});
	}, 500); // Parameters are optional in JS - will be undefined if not passed in 

	$scope.tagChange = function(){
		$scope.loading = true; 

		/*
		var start = new Date($scope.start); 
		var end = new Date($scope.end); 

		start = String(start.getTime()/1000) + "000000"; 
		end = String(end.getTime()/1000) + "000000"; 

		console.log("start" + start + " " + "end" + end); 
		console.log('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&max_tag_id=' + start + '&min_tag_id=' + end + '&callback=JSON_CALLBACK');
		*/
		
		$http.jsonp('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&callback=JSON_CALLBACK')
		.success(function(data){
			console.log(data); 
			var prevpageposition = $window.innerHeight; 
	    	dataservice.processmedia($scope, data); 
	    	$scope.loading = false; 
	    	//$("body").animate({scrollTop: prevpageposition, "slow");
		});
	};
});
