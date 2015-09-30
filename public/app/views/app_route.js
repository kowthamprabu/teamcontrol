angular.module('appRoute',['ngRoute'])

.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/',{
			templateUrl: 'app/views/pages/home.html',
			controller: 'MainController',
			controllerAs: 'main'	
		})
		.when('/login',{
			templateUrl: 'app/views/pages/login.html',
			controller: 'MainController',
			controllerAs: 'login'	
		
		})
		.when('/logout',{
			templateUrl: 'app/views/pages/login.html',
			controller: 'MainController',
			controllerAs: 'login'	
	
		})		
		.when('/signup',{
			templateUrl: '/app/views/pages/signup.html',
			controller: 'UserCreateController',
			controllerAs: 'user'						
		})
		
		$locationProvider.html5Mode(true);				
})