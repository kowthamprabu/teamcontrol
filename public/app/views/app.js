angular.module('TeamControl',['appRoute','MainCtrl','authService','userService','userCtrl','chatCtrl','chatService'])

.config(function ($httpProvider) {
	$httpProvider.interceptors.push('VerifyToken');
});