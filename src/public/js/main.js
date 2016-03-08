// angular.module('name of the appliacation', [//defines applications dependencies])
// Empty array: angular knows to create the app, rather than look for it 
// Directives: tags, or attributes of tags 

var angularapp = angular.module('pixleemini', [])
// use the HTML5 History API
.config(function($locationProvider){
	$locationProvider.html5Mode(true);
}); 

// Controller: contain logic for manipulating UI, determine the state of the application; can handle data  
// $scope = area of operation for controller; will only work part of application you've allowed them to 
angularapp.controller('mainCtrl', function($scope, $location, $window){
	$scope.photos = [
		{url: "http://placehold.it/350x150"}, 
		{url: "http://placehold.it/350x150"},
		{url: "http://placehold.it/350x150"}
	];

	$scope.tagChange = function(){
		$location.path('/'+ $scope.tagname); 
		$window.location.reload();
	};
});

// Data-binding: app's and logic come together
// When Angular data is bound to the scope, Angulalr keeps the data in the scope continually up to dat w/ the applications underlying data store
// Two-way data binding: anytime user interacts w/ app, it updates the data in scope of aplication; any time scope is updated, angular has a process to update the underlying data that's affected



/* .directive('name of directive, callback function that returns an object')
angularapp.directive('main', function(){
	return {

		// Restrict how the directive is used - only as an element or element attribute 
		// 'E' - only used an element 
		restrict: ''
	};
}); */
