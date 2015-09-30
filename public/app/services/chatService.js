angular.module('chatService',[])

.factory('Chat',function ($http,$window) {
	
	var chatFactory = {};
	
	chatFactory.create = function (chatMessageObj) {
		console.log("create = "+chatMessageObj);
		//console.log("userl = "+selectedChatUserList[0]);
		return $http.post('/api',chatMessageObj);
	}
	
	chatFactory.getChat = function(){
		return $http.get('/api');	
	}

	chatFactory.AddChatUser = function (userObj) {
		return $http.post('/api/AddChatUser',userObj);
	} 
	
	chatFactory.GetChatUser = function () {
		return $http.get('/api/GetChatUser');
	} 	
	
	chatFactory.DelChatUser = function (userObj) {
		return $http.post('/api/DelChatUser',userObj);
	} 		
	
	chatFactory.getLoginStatus = function () {
		return $window.localStorage.getItem('loggedin');
	} 
	
	return chatFactory;

})

.factory('socketio',function ($rootScope) {
	
	var socket = io.connect();
	
	return{
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket,args);				
				});			
			});
		},
		
		emit: function (eventName, data,callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.apply(function () {
					if(callback)
						callback.apply(socket,args);				
				});		
			});
		}
	}
	
})