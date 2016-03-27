var angularapp = angular.module('pixleemini', []);


angularapp.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});

// Service: functions reponsible to do specific tasks only - properties on this available in controller (service instantiated w/ new)
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
				if (windowBottom >= docHeight) {
					scope.more(); 
					scope.$apply(); 
				}
			});
		}
	}
}); 
// Controller: contain logic for manipulating UI, determine the state of the application; can handle data  
// $scope = area of operation for controller; will only work part of application you've allowed them to 
angularapp.controller('mainCtrl', function($scope, $location, $window, $http, debounce, $q){
	var nexturl; // Pagination: next results 
	var queue = []; 

	$scope.photos = [];

	angular.element(document).ready(function(){
		$http.get('/api/photos').then(function(response){
			var photos = response.data.photos;
 
			$scope.photos = photos;
		});
	});

	// Scroll to add more
	$scope.more = debounce(function(){
		$http.jsonp(nexturl + '&callback=JSON_CALLBACK')
		.success(function(data){
			// Pagination - next url 
			nexturl = data.pagination.next_url;  

			var start = new Date($scope.start); 
			var end = new Date($scope.end); 

			console.log(data); 

	    	var i = 0; 
	    	var time; 
	    	for (; i < data.data.length; i++){
	    		time = new Date(data.data[i].caption.created_time * 1000); 

	    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
	    		if(data.data[i].comments.count != 0){ // Check if there are comments 
	    			var j = 0; 
	    			for (; j < data.data[i].comments.data.length; j++){
	    				// Check if comments contain the tag, and the comment is from the submitter, and caption does not contain the tag 
						if ((data.data[i].comments.data[j].text.indexOf('#' + $scope.tagname) > -1) && 
							(data.data[i].comments.data[j].from.username == data.data[i].user.username) &&
							(data.data[i].caption.text.indexOf('#' + $scope.tagname) == -1)){

							time = new Date(data.data[i].comments.data[j].created_time * 1000); 
						}
					}
	    		}

	    		// Only show posts that are within the searched parameters 
	    		//if(time.getTime() >= start.getTime() && time.getTime() <= end.getTime()){
				var photo = JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "user":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '"}'); 
				
				$scope.photos.push(photo);
				
				// Save the photos 
				request = $http.post('/api/photos', photo); 

				queue.push(request); 

				// Combines multiple promises into a single promise that's resolved when all of the input promises are resolved 
				// A new promise instance is created when a deferred instance is created; assurance that we will get a result from an action at some point in the future 
				// Need promises to make deciisons based on the possible results of our call
				$q.all(queue); 
				//}
			}
		});
	}, 500); // Parameters are optional in JS - will be undefined if not passed in 

	$scope.tagChange = function(){
		$http.jsonp('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&callback=JSON_CALLBACK')
		.success(function(data){
			// Pagination - next url 
			nexturl = data.pagination.next_url;  

			var start = new Date($scope.start); 
			var end = new Date($scope.end); 

			var request; 

			//console.log(data); 

	    	var i = 0; 
	    	var time; 
	    	for (; i < data.data.length; i++){
	    		time = new Date(data.data[i].caption.created_time * 1000); 

	    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
	    		if(data.data[i].comments.count != 0){ // Check if there are comments 
	    			var j = 0; 
	    			for (; j < data.data[i].comments.data.length; j++){
	    				// Check if comments contain the tag, and the comment is from the submitter, and caption does not contain the tag 
						if ((data.data[i].comments.data[j].text.indexOf('#' + $scope.tagname) > -1) && 
							(data.data[i].comments.data[j].from.username == data.data[i].user.username) &&
							(data.data[i].caption.text.indexOf('#' + $scope.tagname) == -1)){

							time = new Date(data.data[i].comments.data[j].created_time * 1000); 
						}
					}	    		
				}

	    		// Only show posts that are within the searched parameters 
	    		//if(time.getTime() >= start.getTime() && time.getTime() <= end.getTime()){
	    		var photo = JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "user":"' + data.data[i].user.username + '", "userphoto": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '"}'); 
				
				$scope.photos.push(photo);
				
				// Save the photos 
				request = $http.post('/api/photos', photo); 

				queue.push(request); 

				// Combines multiple promises into a single promise that's resolved when all of the input promises are resolved 
				// A new promise instance is created when a deferred instance is created; assurance that we will get a result from an action at some point in the future 
				// Need promises to make deciisons based on the possible results of our call
				$q.all(queue); 
			}
		});
		/*
		$.ajax({
		    url: "https://api.instagram.com/v1/tags/" + $scope.tagname + "/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b",
		    type: "GET",
		    crossDomain: true,
		    dataType: "jsonp",
		    success: function(data){ 
		    	// Pagination - next url 
				nexturl = data.pagination.next_url;  

				var start = new Date($scope.start); 
				var end = new Date($scope.end); 

				console.log(data); 

		    	var i = 0; 
		    	var time; 
		    	for (; i < data.data.length; i++){
		    		time = new Date(data.data[i].caption.created_time * 1000); 

		    		// If the comment contains the hashtag that the user searched for, use the time that the comment was created
		    		if(data.data[i].comments.count != 0){ // Check if there are comments 
		    			var j = 0; 
		    			for (; j < data.data[i].comments.data.length; j++){
		    				// Check if comments contain the tag, and the comment is from the submitter, and caption does not contain the tag 
							if ((data.data[i].comments.data[j].text.indexOf('#' + $scope.tagname) > -1) && 
								(data.data[i].comments.data[j].from.username == data.data[i].user.username) &&
								(data.data[i].caption.text.indexOf('#' + $scope.tagname) == -1)){

								time = new Date(data.data[i].comments.data[j].created_time * 1000); 
							}
						}
		    		}

		    		// Only show posts that are within the searched parameters 
		    		//if(time.getTime() >= start.getTime() && time.getTime() <= end.getTime()){
						$scope.photos.push(JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "user":"' + data.data[i].user.username + '", "user_photo": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '"}'));
					//}
				}
		    },
		    error: function (xhr, status, error){
		    	console.log("There was an error" + error); 
		    }
		});*/
	};
});
