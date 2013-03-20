
/**
 * Module dependencies.
 */
process.env.TZ = 'Asia/Tokyo';

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , async = require('async');

var app = express();

var mongoUri = 'mongodb://127.0.0.1/wakuwakulb';
var Schema = mongoose.Schema;

function validator(v) {
  return v.length > 0;
}

///
/// Database schema
///
// get sequence numbers
function counter(name) {
    var ret = db.counters.findAndModify({query:{_id:name}, update:{$inc : {next:1}}, "new":true, upsert:true});
    // ret == { "_id" : "users", "next" : 1 }
    return ret.next;
}

// User model
var userSchema = new Schema({
    uid    : { type: Number }
  , uname  : { type: String, validate: [validator, "Empty Error"] }
  , mail   : { type: String }
  , birth  : { type: Date }
  , sex    : { type: Number }
  , uimg   : { type: String }
  , created: { type: Date, default: Date.now }
});
var User = mongoose.model('User', userSchema);

// Team model
var teamSchema = new mongoose.Schema({
    team   : { type: String, validate: [validator, "Empty Error"] }
  , timg   : { type: String }
});
var Team = mongoose.model('Team', teamSchema);

// Round model
var roundSchema = new mongoose.Schema({
    roundname: { type: String, validate: [validator, "Empty Error"] }
  , date     : { type: Date }
});
var Round = mongoose.model('Round', roundSchema);

// Score model
var scoreSchema = new mongoose.Schema({
    rid   : { type: Number }
  , uid   : { type: Number, index: true }
  , holeno: { type: Number }
  , score : { type: Number }
});
var Score = mongoose.model('Score', scoreSchema);

// Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
//  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  mongoose.connect(mongoUri);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

//app.configure('production', function(){
//  app.use(express.errorHandler()); 
//});

// Routes

app.get('/', routes.index);
app.get('/users', user.list);

// Server

//var io = require('socket.io').listen(app);
var server = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port" + app.get('port'));
});
var io = require('socket.io').listen(server);
io.configure('prouction', function() {
  io.enable('browser client minification');
  io.enable('browser clinet etag');
  io.set('log level', 1);
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});
io.configure('development', function() {
//  io.set('log level', 2);
//  io.set('transports', ['websocket']);
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});

///
/// account service
///
var act = io
  .of('/account')
  .on('connection', function(socket) {
    // add
    socket.on('add', function(socket) {
      // ユーザー登録

    });
  });

///
/// live service
///
var cmt = io
  .of('/live')
  .on('connection', function (socket) {
    // comment
    socket.on('comment', function (data) {
      // コメント受信
      // 参加プレーヤーにブロードキャスト
      socket.emit('comment', data);       // 送信者へ送信
      socket.broadcast.emit('comment', data);  // 送信者他全員へ送信
    });
  });

///
/// round service
///
var round = io
  .of('/round')
  .on('connection', function (socket) {
    console.log("connected /round");
    // add
    socket.on('add', function(data) {
      
    });

    // invite
    socket.on('invite', function(data) {
      // ユーザーへ招待メールを送信する
      // TODO:メール送信
      // socket.emit();
    });

    // participation
    socket.on('participation', function(data) {
      // ラウンド参加受付
      // TODO:参加受付
      // socket.emit();
    });
  });

///
/// leaders board service
///
var lb = io
  .of('/leadersboard')
  .on('connection', function (socket) {
    console.log("connected /leadersboard");
    // score
    socket.on('score', function (data) {
      // スコア入力データ受信
      // DBへ保存
      inputScore(socket, data);

      // スコア入力データを全プレーヤーに通知
      socket.emit('score', data);
      socket.broadcast.emit('score', data);

      // 個人順位を参加プレーヤー全員に通知
      notifyPersonalRank(socket, data.rid);

      // チーム順位を参加プレーヤー全員に通知
      notifyTeamRank(socket, data.rid);
    });

    // personalscore
    socket.on('personalscore', function (data) {
      // 個人順位を参加プレーヤー全員に通知
      notifyPersonalRank(socket, data.rid);
    });

    // teamscore
    socket.on('teamscore', function (data) {
      // チーム順位を参加プレーヤー全員に通知
      notifyTeamRank(socket, data.rid);
    });
  });

// スコア入力 : inputScore
function inputScore(socket, data) {
  Score.findOne({ 'uid': data.uid, 'holeno': data.holeno },
    function (err, score) {
      if (!err) {
        if (score != null) {
          // found, then update
          score.score = data.score;
          score.save(function(err) {
            if (err) console.log(err);
          });
        } else {
          // NOT found, then add
          updScore = new Score(data);
          updScore.save(function(err) {
            // notify personal rank
            if (!err) {
              //notifyPersonalRank();
            } else {
              console.log(err);
            }
          });
        }
      } else {
        // findOne error
        console.log(err);
      }
    });
}


// 個人順位通知 : notifyPersonalRank
function notifyPersonalRankOrg(socket, rid) {
  console.log('notifyPersonalRank');
  // ユーザーごとのスコアを計算する
  User.find(function(err, users) {
    if (!err && users != null) {
      var pscores = [];
      for (i = 0; i < users.length; i++) {
        console.log('uid:' + users[i].uid);
        Score.find({'uid' : users[i].uid}).sort({holeno:'asc'}).exec(
          function (err, scores) {
//            console.log('scores ' + scores);
            if (!err && scores != null) {
              var gross = 0;
              var holes = [];
              for (s = 0; s < scores.length; s++) {
                gross += scores[s].score;
                holes.push(scores[s].score);
              }
              pscores.push({ "user": users[i], "score": { "gross": gross, "holes": holes } });
              console.log('pscores ' + pscores);
              socket.emit('personalscore', { "pscores": pscores });
              socket.broadcast.emit('personalscore', { "pscores": pscores });
            }
//            if (i == (users.length - 1)) {
//              socket.emit('personalscore', { "pscores": pscores });
//              socket.broadcast.emit('personalscore', { "pscores": pscores });
//            }
          });
      }
    }
  });
}

function notifyPersonalRank01(socket, rid) {
  console.log('notifyPersonalRank');
  // ユーザーごとのスコアを計算する
  User.find(function(err, users) {
    console.log('users ' + users);
    if (!err && users != null) {
      var pscores = [];
      var calls = [];
      var user;
      var i;
      calls.push(function(callback) {
        for (i = 0; i < users.length; i++) {
          console.log('uid:' + users[i].uid);
          user = users[i];
          Score.find({'uid' : users[i].uid}).sort({'holeno':'asc'}).exec(
            function (err, scores) {
//              console.log('find score' + scores);
                if (!err && scores != null) {
                  var gross = 0;
                  var holes = [];
                  for (s = 0; s < scores.length; s++) {
                    gross += scores[s].score;
                    holes.push(scores[s].score);
                  }
                  pscores.push({ "user": user, "score": { "gross": gross, "holes": holes } });
                } else {
                  pscores.push({ "user": user, "score": { "gross": 0, "holes": [] } });
                }
                if (pscores.length == users.length) {
                  callback(null, pscores);
                }
          });
        }
      });
      async.series(calls, function (err, result) {
        if (err) {
          return console.log(err);
        }
//        console.log(result);
        console.log('pscores ' + pscores);
        socket.emit('personalscore', { "pscores": pscores });
        socket.broadcast.emit('personalscore', { "pscores": pscores });
      });
    }
  });
}

function notifyPersonalRank(socket, rid) {
  console.log('notifyPersonalRank');
  // ユーザーごとのスコアを計算する
  var calls = [];
  var userlist = [];
  var pscores = [];
  var pscore_counter = 0;
  calls.push(function(callback) {
      User.find(function(err, users) {
        console.log('users ' + users);
        if (!err && users != null) {
          async.forEach(users, function(user, cb) {
            console.log(user);
              Score.find({'uid' : user.uid}).sort({'holeno':'asc'}).exec(
                function (err, scores) {
                  console.log('find score' + scores);
                  if (!err && scores != null && scores.length > 0) {
                    var gross = 0;
                    var holes = [];
                    async.forEach(scores, function(score, scoreCb) {
                      gross += score.score;
                      holes.push(score.score);
                      scoreCb();
                    }, function (err) {
                      console.log("score created");
                      pscores.push({ "user": user, "score": { "gross": gross, "holes": holes } });
                    });
                  } else {
                    pscores.push({ "user": user, "score": { "gross": 0, "holes": [] } });
                  }
                  cb();
              });
          }, function (err) {
            console.log(err);
            console.log("pscore created");
            callback(null, pscores);
          });
        } else {
          cb();
        }
      });
  });

  async.series(calls, function (err, result) {
    if (err) {
      return console.log(err);
    }
    console.log('pscores ' + pscores);
    socket.emit('personalscore', { "pscores": pscores });
    socket.broadcast.emit('personalscore', { "pscores": pscores });
  });
}

function findScore(user, pscores) {
  console.log("find " + user.uid);
  Score.find({'uid' : user.uid}).sort({'holeno':'asc'}).exec(
    function (err, scores) {
      console.log('find score' + scores);
        if (!err && scores != null && scores.length > 0) {
          var gross = 0;
          var holes = [];
          for (s = 0; s < scores.length; s++) {
            gross += scores[s].score;
            holes.push(scores[s].score);
          }
          pscores.push({ "user": userlist[scores[0].uid - 1], "score": { "gross": gross, "holes": holes } });
        } else {
          pscores.push({ "user": user, "score": { "gross": 0, "holes": [] } });
        }
  });
}

// チーム順位通知 : notifyTeamRank
function notifyTeamRank(socket, rid) {
  console.log('notifyTeamRank');
//  var tscores = [];
//  socket.emit('teamscore', tscores);
}



// test
var points = [];
paint = io.of('/paint').on('connection', function (socket) {
  if (points.length > 0) {
    for (var i in points) {
      socket.json.emit('paint points', points[i]);
    }
  }

  socket.on('paint points', function(data) {
    points.push(data);
    paint.emit('paint points', data);
  });
});
