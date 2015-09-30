var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	username: {type: String, required: true, index: {unique: true}},
	password: {type: String, required: true},
	chatUserList: {type: Array, index: {unique: true}}
});

UserSchema.methods.comparePassword = function(password) {
	var user = this;
	
	var status = password.localeCompare(this.password);
	return !status;
}
module.exports = mongoose.model('User',UserSchema);