var angularapp = angular.module('pixleemini', []);  

// Controller: contain logic for manipulating UI, determine the state of the application; can handle data  
// $scope = area of operation for controller; will only work part of application you've allowed them to 
angularapp.controller('mainCtrl', function($scope, $location, $http){
	$scope.photos = [
		{url: "http://placehold.it/350x150"}, 
		{url: "http://placehold.it/350x150"},
		{url: "http://placehold.it/350x150"}
	];

	$scope.tagChange = function(){
		/*
		var invocation = new XMLHttpRequest(); 
		var url = "https://api.instagram.com/v1/tags/" + $scope.tagname + "/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b"; 

		function callOtherDomain(){
			if(invocation){
				invocation.open('GET', url, true); 
				invocation.onreadystatechange = function(){
					if (invocation.readyState == 4){
						console.log("hi"); 
					}
				}; 
				invocation.send(): 
			}
		}
		*/
		//$location.path('/'+ $scope.tagname); 
		//$window.location.reload();
		
		$http({
		  method: "GET",
		  url: "https://api.instagram.com/v1/tags/" + $scope.tagname + "/media/recent?access_token=257375661.1677ed0.a8e0fbed6c4b409aba36270a19d90a9b"
		}).then(function successCallback(response){
			console.log("hi"); 
		});
	};
});

