var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/wakuwakulb');

function validator(v) {
  return v.length > 0;
}

// get sequence numbers
function counter(name) {
    var ret = db.counters.findAndModify({query:{_id:name}, update:{$inc : {next:1}}, "new":true, upsert:true});
    // ret == { "_id" : "users", "next" : 1 }
    return ret.next;
}

// User model
var User = new mongoose.Schema({
    name   : { type: String, validate: [validator, "Empty Error"] }
  , mail   : { type: String }
  , birth  : { type: Date }
  , sex    : { type: Number }
  , uimg   : { type: String }
  , created: { type: Date, default: Date.now }
});
exports.User = db.model('User', User);

// Team model
var Team = new mongoose.Schema({
    team   : { type: String, validate: [validator, "Empty Error"] }
  , timg   : { type: String }
});
exports.Team = db.model('Team', Team);

// Round model
var Round = new mongoose.Schema({
    roundname: { type: String, validate: [validator, "Empty Error"] }
  , date     : { type: Date }
});
exports.Round = db.model('Round', Round);

// Score model
var Score = new mongoose.Schema({
    gross   : { type: Number }
  , hc      : { type: Number }
  , net     : { type: Number }
  , rank    : { type: Number }
  , holes   : { type: [Number] }
  , uid     : { type: String }
});
exports.Score = db.model('Score', Score);



var Post = new mongoose.Schema({
    text   : { type: String, validate: [validator, "Empty Error"] }
  , created: { type: Date, default: Date.now }
});

exports.Post = db.model('Post', Post);
