angular.module('chatCtrl',[])


.directive('schrollBottom', function () {
  return {
    scope: {
      schrollBottom: "="
    },
    restrict: 'A',
    link: function (scope, element,attr) {
      scope.$watchCollection('schrollBottom', function (newValue) {
        if (newValue)
        {
          $(element).scrollTop($(element)[0].scrollHeight);
          //element[0].scrollTop = element[0].scrollHeight;
        }
      });
    }
  }
})

.controller('ChatController',function ($window,$http,$interval,Chat,User,socketio,Auth) {

	var vm = this;	
	
	vm.chat = [];
	vm.chatUserList = [];
	vm.selection = [];
	vm.selectedAll = false;
	vm.checkSelect = [];
	vm.checkSelect.push("CheckAllBox");
	vm.showCheckAll =  vm.chatUserList.length > 0 ? true : false; 
	var timer_bool = true;	
	vm.date_value = new Date();
	
   var timer = $interval(function () {
   	
      if (Chat.getLoginStatus() && timer_bool) {
      	timer_bool = false;
      	Chat.GetChatUser()
      	    .success(function (userList) {

      	    	if(userList.ChatUsers.length)
      	    	{
      	    		console.log(userList.ChatUsers.length);
	      	    	for(var i=0; i< userList.ChatUsers.length;i++){	
	      	    		var t_user = userList.ChatUsers[i];	
							vm.chatUserList.push({user: t_user});	  
							vm.showCheckAll =  vm.chatUserList.length > 1 ? true : false;    	    	
						}
					}
      	    	else
      	    		vm.chatUserList = [];
						
					console.log(vm.chatUserList);	      	    
      	    });
      	    
 			Chat.getChat()
	 	     	 .success(function (data) {
		   	 vm.chat = data;
	   	});	      	    
     
			       
	    }else if(!timer_bool){
				$interval.cancel(timer);
				timer = undefined;   
   	}	    
   },500);


	vm.createChat = function () {
		vm.msg = '';	
		console.log("control = "+ vm.selection);
		vm.chatData.selectedUserList = vm.selection;
		Chat.create(vm.chatData)
		    .success(function (data) {
				vm.chatData = {};
				vm.msg = data.message;
   	    });
	}; 
	
	vm.checkAll = function(chk_all_status){
	
		vm.selection = [];
		if(!chk_all_status){
			angular.forEach(vm.chatUserList, function (item) {	
				var idx = vm.selection.indexOf(item.user);
				vm.selection.splice(idx, 1);
			});
		} else {
			vm.checkSelect.push("CheckAllBox"); 
			angular.forEach(vm.chatUserList, function (item) {
		    	vm.selection.push(item.user);
		 	});
		 }
	}
	
	vm.addUsers = function (user) {
		console.log("Testing the add user function"+ user);
     	 var U_List = [];
     	 var userExists = 0;

		 // if the provided username is already added
		 if (vm.chatUserList.length){
			for(var i=0; i< vm.chatUserList.length;i++){	
				if(vm.chatUserList[i].user == user){
					$window.alert("User "+user+" has been added already!");
					userExists = 1;
					break;				
				}			
			}
		 }
		 if(!userExists){ // If the user is not already added, then verify whether username is valid, if so, add it.
     	 User.all()
     	     .then(function (data) {
					U_List = data.data;
				  userExists = 0;	
		     	  if(U_List.length){
		     	  		for(var i=0; i< U_List.length;i++){
		     	  			if (U_List[i].username == user) {
		     	  				userExists = 1;
								Chat.AddChatUser({userName: user})
								    .success(function () {
								    	vm.chatUserList.push({user: user});
										vm.showCheckAll =  vm.chatUserList.length > 1 ? true : false;
								    })
								break;				     	  			
		     	  			}
		     	  		}
		     	  		// if user provided some wrong user id
		     	  		if(!userExists)
		     	  		   $window.alert("Please enter the correct user");
		     	  	}
		     	  	else { // it's the very first user who is being added
						vm.chatUserList.push({user: user});
						vm.showCheckAll =  vm.chatUserList.length > 1 ? true : false;     	  	
		     	  	}
					 	     
     	     })
     	  }
		vm.chat_user = '';
	}
	
vm.chatUserDelete = function (userName) {
	
	//var idx = vm.chatUserList.indexOf(userName);
	var idx = 0;
	angular.forEach(vm.chatUserList,function (item) {
		if (item.user == userName) {
			Chat.DelChatUser({uName: userName})
			    .success(function () {
			    });
	    	vm.chatUserList.splice(idx, 1);
   	 	vm.showCheckAll =  vm.chatUserList.length > 1 ? true : false;				
		}
		idx += 1;
	})

	idx = 0;
	angular.forEach(vm.selection,function (user) {
		if (user == userName) {
			vm.selection.splice(idx, 1);
		}
		idx += 1;
	})
}
  // toggle selection for a given employee by name
  vm.toggleSelection = function toggleSelection(userName) {
     var idx = vm.selection.indexOf(userName);

     // is currently selected
     if (idx > -1) {
       vm.selection.splice(idx, 1);
     }

     // is newly selected
     else {
     	  //console.log("u_List = "+ data[0].username);
 	    vm.selection.push(userName);     	  						
     }
   }	
	
	socketio.on('chat',function (ChatData) {
		var usr;
		Auth.getUser()
		    .then(function (data) {
  				usr = data.data;
				for(var i=0;i< ChatData.Target_Users.length;i++){
					//console.log(ChatData.Target_Users[i]);
					if(usr.username == ChatData.Target_Users[i])
						vm.chat.push(ChatData);
				}  								    
		    });


	});
	
	/*socketio.on('connect_error',function (err) {
		console.log("Client Disconnected");
		console.log(err);
		socketio.disconnect();	
	});*/
	

})
