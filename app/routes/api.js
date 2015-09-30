var User = require('../models/user');
var ChatUList = require('../models/chatUsers');
var Chat = require('../models/chat');
var config = require('../../config');
var jsonwebtoken = require('jsonwebtoken');

var secretKey = config.secretKey;

function createToken(user){

	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username,
		password: user.password
	}, secretKey,{
		expiresInMinute: 1440
	});
	
	return token;

}

module.exports = function (app,express,io) {
		
		var api = express.Router();
		
		api.post('/signup',function (req,res) {
			var user = new User({
				name: req.body.name,
				username: req.body.username,
				password: req.body.password	
			});
			var token = createToken(user);
			user.save(function (err,user) {
				if(err){
					res.send(err);
					console.error(err);
					return;				
				} 
				/*console.log(req.body.name);
				console.log(req.body.username);
				console.log(req.body.password);
				console.dir(user); */
				
				res.json({success: true, message: 'User has been created',token: token,user: req.body.username});
			});
		});

	
		api.get('/users',function (req,res) {
			User.find({},function (err,users) {
				if(err){
					res.send(err);
					return;				
				}
				console.log("res = "+ res);
				console.log("Name = "+users[0].username);
				res.json(users);

			});
		});		
		
		api.post('/login',function (req,res) {
			User.findOne({username: req.body.username}).select('name username password').exec(function(err,user){
				if(err) throw err;
				
				if(!user){
					res.send({message: "User does not exist!"});
				}else if(user){
					var validPassword = user.comparePassword(req.body.password);
					if(!validPassword){
						res.send({message: "Invalid password entered"});					
					}else {
							var token = createToken(user);
							res.json({
								success: true,
								message: "Successfully logged in",
								token: token,		
								UN: req.body.username 					
							});
					}
				}
		
			});
		});	

		api.post('/logout',function (req,res) {

			User.findOne({username: req.body.username}).select('_id').exec(function(err,user){
				Chat.remove({Creator: user._id,Status: false},function (err) {

					if(err){
						 res.send(err);
						 console.log(err);
						 return;
					}
					res.json({
						success: true,
						message: "Successfully logged out"
					})
			});
			});

		});
		
		
		api.use(function (req,res,next) {
			var token = req.body.token || req.param('token') || req.headers['x-access-token'];
			if(token){
				jsonwebtoken.verify(token,secretKey,function(err,decoded) {
					if(err){
						res.status(403).send({success: false, message: "Failed to authenticate the user"});
					}else {	
						req.decoded = decoded;
						next();					
					}
				});
			}else{
				res.status(403).send({success: false, message: "No token has been provided"});	
				console.log("No Token Provided");		
			}
		});

		/*********To get the users list************/
		
		api.get('/me',function(req,res){
			res.send(req.decoded);			
		});
		
		/******************************************/				
		/*api.get('/',function (req,res) {
			res.json("Hello World Response!")		
		});*/
		
		/* Below are the routes called once after the user logged in */		
		api.route('/')
		   .post(function (req,res) {
		   	//var user_arr = req.body.userGroup;
		   	var user_arr =  req.body.selectedUserList;  //['kchinnap1','kchinnap2'];
		   	
		   	console.log("Selection = "+req.body.selectedUserList);
		   	console.log("body = "+req.body);
		   	
		   	// To send the chat message to each selected users
				if(user_arr.length){
					var len = user_arr.length;
					var id_arr = [];
					for(var i=0;i<len;i++){
						User.findOne({username: user_arr[i]}).select('_id').exec(function(err,user_id){
							if(!err){
								var chat_for_all = new Chat({
									Creator: user_id,
									Message: req.body.Message,
									Target_Users: [],
									fromUser: 	req.decoded.username							
								})
								
								chat_for_all.save(function (err,newMsg) {
									if(err) {
										res.send(err);
										return;					
									}			
								})
							}
							else {
								console.log("Error occured while reading the users collection");							
							}
						})
					}
				}
				
				user_arr.push(req.decoded.username);
				
				var chat = new Chat({
					Creator: req.decoded.id,
					Message: req.body.Message,
					Target_Users: user_arr,
					fromUser: req.decoded.username				
				});
				
				chat.save(function(err,newMsg){
					if(err) {
						res.send(err);
						return;					
					}			
					io.emit('chat',newMsg);
					res.json({message: "New chat message created"});	
				});
		   })
		   
		   .get(function(req,res){
		   	Chat.find({Creator: req.decoded.id},function (err,chat_msg) {
					if(err){
						res.send(err);
						return;					
					}else {
						Chat.update({Creator: req.decoded.id},{$set:{Status:false}},{multi: true},function (err) {
							if(err) console.log("Message status could not be set");						
						})
					}
					res.send(chat_msg);		   	
		   	
		   	});
		   });
		
		api.route('/AddChatUser')
		   .post(function (req,res) {
		   	var uName = req.body.userName;
		   	console.log("uname = "+uName);
		   	
		   	//chatUsers.find({Creator: req.decoded.id},function (err,Chat_User_List) {
		   	ChatUList.findOne({Creator: req.decoded.id}).select('ChatUsers').exec(function(err,user_list){
		   		   var uList = [];
			   		if(user_list != null)
			   		{
			   			console.log("Userlst = "+ user_list.ChatUsers);
			   			uList = user_list.ChatUsers;
			   			uList.push(uName);
			   			console.log("UserlstUPD = "+ uList);
			   			ChatUList.update({Creator: req.decoded.id},{$set:{ChatUsers:uList}},function (err) {			   			
			   				if(err){
									res.send(err);
									console.error(err);
									return;
								}
								res.json({message: "New chat user created"});	
			   			});
			   		}
			   		else 
			   		{
			   			console.log("Null userlist");
				   		console.log("chatuser list = "+user_list);
							uList.push(uName);
				   		console.log(uList);
							/*user_list.push(uName);
							console.log(user_list);*/
							var chat_Users = new ChatUList({
								Creator: req.decoded.id,
								ChatUsers: uList
							})
						
							chat_Users.save(function (err,user) {
								if(err){
									res.send(err);
									console.error(err);
									return;				
								} 
								res.json({message: "New chat user created"});	
					   	});
						}
		   	 	});
		   	});
		   	
		api.route('/GetChatUser')
		   .get(function(req,res){
		   	//chatUsers.find({Creator: req.decoded.id},function (err,Chat_User_List) {
		   	ChatUList.findOne({Creator: req.decoded.id}).select('ChatUsers').exec(function(err,user_list){
		   		if(user_list != null){
		   			console.log("ser = "+user_list.ChatUsers);
		   			res.json(user_list);
		   		}   
		   		else {	
						res.json({ChatUsers:''});		   		
		   		}
		   	});
			});
				
		api.route('/DelChatUser')
		   .post(function(req,res){
		   	//chatUsers.find({Creator: req.decoded.id},function (err,Chat_User_List) {
		   	ChatUList.findOne({Creator: req.decoded.id}).select('ChatUsers').exec(function(err,user_list){
		   		if(user_list != null){
		   			var uList = [];
		   			for(var i =0;i<user_list.ChatUsers.length;i++){
							if(user_list.ChatUsers[i] != req.body.uName)
								uList.push(user_list.ChatUsers[i]);
		   			}
			   		ChatUList.update({Creator: req.decoded.id},{$set:{ChatUsers:uList}},function (err) {			   			
			   			if(err){
								res.send(err);
								console.error(err);
								return;
							}
						});		   			
		   			console.log("ser = "+uList);
		   			res.json({message: "Chat user has been deleted"});	
		   		}   
		   		else {	
						res.json({message: "No chat user to be deleted"});	
		   		}
		   	});
			});				
		return api;
}