var mongoose = require('mongoose');

var Schema = 	mongoose.Schema;

var ChatUserList = new Schema({
	Creator: {type: Schema.Types.ObjectId, ref: 'User'},
	ChatUsers: Array
});

module.exports = mongoose.model('chatUsers',ChatUserList);