var angularapp = angular.module('pixleemini', []);

angularapp.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});

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
angularapp.controller('mainCtrl', function($scope, $location, $window, $http){
	var nexturl; // Pagination: next results 

	$scope.photos = [
	];

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

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
					$scope.photos.push(JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "user":"' + data.data[i].user.username + '", "user_photo": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '"}'));
				//}
			}
		});
	}, 500); 

	$scope.tagChange = function(){
		$http.jsonp('https://api.instagram.com/v1/tags/' + $scope.tagname + '/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b&callback=JSON_CALLBACK')
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
					
}	    		}

	    		// Only show posts that are within the searched parameters 
	    		//if(time.getTime() >= start.getTime() && time.getTime() <= end.getTime()){
					$scope.photos.push(JSON.parse('{"url":"' + data.data[i].images.standard_resolution.url + '", "user":"' + data.data[i].user.username + '", "user_photo": "' + data.data[i].user.profile_picture + '", "link":"' + data.data[i].link + '", "time":"' + time + '"}'));
				//}
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
