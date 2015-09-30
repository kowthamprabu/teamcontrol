var mongoose = require('mongoose');

var Schema = 	mongoose.Schema;

var ChatSchema = new Schema({
	Creator: {type: Schema.Types.ObjectId, ref: 'User'},
	Message: String,
	Status:{type: Boolean,default: true},
	Created: {type: Date, default: Date.now},
	Target_Users: Array,
	fromUser:String
});

module.exports = mongoose.model('chat',ChatSchema);