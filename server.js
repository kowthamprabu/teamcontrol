var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require("./config");
var mongoose = require('mongoose');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var db = mongoose.connection;

mongoose.connect('mongodb://localhost/teamapp',function (err) {
	if(err){
		console.log("Database connect error "+ err);	
	}
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
//app.use(morgan('dev')); //to log all the request to the console

// All the static html, css, js file needs to be rendered and thus we put those into public directory
// The below statment should come before any routing happens
app.use(express.static(__dirname + '/public')); 

var api = require('./app/routes/api')(app,express,io);
app.use('/api',api);

app.get('*',function (req, res) {
	res.sendFile(__dirname + '/public/app/views/index.html');
});

http.listen(config.port,function(err){
	if(err){
		console.log("Error occured " + err);	
	}else {
		console.log("listening on port 3000");
	}
});