
/**
 * Module dependencies.
 */
process.env.TZ = 'Asia/Tokyo';

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , performance = require('./routes/performance')
  , performance_personal = require('./routes/performance_personal')
  , scoreboard = require('./routes/scoreboard')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , async = require('async');

var app = express();

var mongoUri = 'mongodb://127.0.0.1/wakuwakulb2';
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

// Round model
var roundModel = new Schema({
    //rid    : { type: Number }
    rid    : { type: String }
  , rname  : { type: String, validate: [validator, "Empty Error"] }
  , date: { type: Date }
  //, time: { type: Time }
  //, cid: { type: Number }
  , handicapinf: { type: Object }
  , cid: { type: String }
  , csubids: { type: Array }
  , prtyifs: { type: Array }
});
var Round = mongoose.model('Round', roundModel);

// Party model
var partyModel = new Schema({
  //  pid: { type: Number }
  //, rid: { type: Number }
    pid: { type: String }
  , rid: { type: String }
  , pname: { type: String }
  , number: { type: Number }
  , plyifs: { type: Array }
});
var Party = mongoose.model('Party', partyModel);

// Course model
var courseModel = new Schema({
    //cid: { type: Number }
    cid: { type: String }
  , cname: { type: String }
  , holeinfs: { type: Array }
});
var Course = mongoose.model('Course', courseModel);

// Hole model
var holeModel = new Schema({
    csubid: { type: String }
  , csubname: { type: String }
  , names: { type: Array }
  , pars: { type: Array }
});
var Hole = mongoose.model('Hole', holeModel);

// Player model
var playerModel = new Schema({
  //  plid: { type: Number }
  //, rid: { type: Number }
  //, uid: { type: Number }
  //, tid: { type: Number }
    plid: { type: String }
  , rid: { type: String }
  , uid: { type: String }
  , tid: { type: String }
});
var Player = mongoose.model('Player', playerModel);

// User model
var userSchema = new Schema({
    //uid: { type: Number }
    uid    : { type: String }
  , uname: { type: String, validate: [validator, "Empty Error"] }
  , mail   : { type: String }
//  , brthdy : { type: Date }
  , brthdy : { type: String }
  , sex    : { type: Number }
  , uimg   : { type: String }
  , created: { type: Date, default: Date.now }
});
var User = mongoose.model('User', userSchema);

// Team model
var teamSchema = new mongoose.Schema({
    //tid: { type: Number }
    tid: { type: String }
  , tname: { type: String, validate: [validator, "Empty Error"] }
  , timg   : { type: String }
});
var Team = mongoose.model('Team', teamSchema);

// Round model
//var roundSchema = new mongoose.Schema({
//    roundname: { type: String, validate: [validator, "Empty Error"] }
//  , date     : { type: Date }
//});
//var Round = mongoose.model('Round', roundSchema);

// Score model
var scoreSchema = new mongoose.Schema({
  //  rid: { type: Number }
  //, uid: { type: Number, index: true }
  //, cid: { type: Number }
  //, csubid: { type: Number }
    rid   : { type: String }
  , uid: { type: String, index: true }
  , plid: { type: String, index: true }
  , cid: { type: String }
  , csubid: { type: String }
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
app.get('/performance', performance.performance);
app.get('/performance_personal', performance_personal.performance_personal);
app.get('/scoreboard', scoreboard.scoreboard);

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
    socket.on('add', function(data) {
      // ユーザー情報登録
      addUser(socket, data);
    });

    // update
    socket.on('update', function(data) {
      // ユーザー情報更新
      updateUser(socket, data);
    });

    // delete
    socket.on('delete', function(data) {
      // ユーザー情報削除
      deleteUser(socket, data);
    });
  });

// ユーザー登録
function addUser(socket, data) {
  console.log('addUser');
  var calls = [];
  calls.push(function (callback) {
    User.findOne({ 'uid': data.uid },
      function (err, user) {
        if (!err) {
          if (user) {
            // found, then error(already exist)
            console.log("addUser err: alreay exists:" + data.uid);
            socket.emit('add', { result: false, err: "already exists." });
          } else {
            // Not found, then add user
            var addUser = new User(data);
            addUser.save(function(err) {
              if (!err) {
                console.log('User.save err' + err);
                socket.emit('add', { result: false, err: "save failed:" + err });
              }
            });
          }
        } else {
          // findOne error
          console.log('User.findOne err:' + err);
          socket.emi('add', { result: false, err: "findOne err:" + err });
        }
        callback();
      });
  });

  async.series(calls, function (err, result) {
    console.log('add user[END]');
    if (err) {
      console.log('addUser error:' + err);
    }
  });
}

// ユーザー更新
function updateUser(socket, data) {
  console.log('updateUser');
  var calls = [];
  calls.push(function (callback) {
    User.findOne({ 'uid': data.uid },
      function (err, user) {
        if (!err) {
          if (user) {
            // found, then update
            if (data.uname) {
              user.uname = data.uname;
            }
            if (data.brthdy) {
              user.brthdy = data.brthdy;
            }
            if (data.sex) {
              user.sex = data.sex;
            }
            if (data.mail) {
              user.mail = data.mail;
            }
            if (data.uimg) {
              user.uimg = data.uimg;
            }
            user.save(function(err) {
              if (err) {
                console.log('updata user err' + err);
                socket.emit('update', { result: false, err: "" + err });
              } else {
                socket.emit('update', { result: true });
              }
            });
          } else {
            // Not found, then error(not found user)
            socket.emit('updataUser', { result: false, err: "not found user" });
          }
        } else {
          console.log('User.findOne error:' + err);
          socket.emit('update', { result: true, err: "findOne err:" + err });
        }
        callback();
      });
  });
  async.series(calls, function(err, result) {
    console.log('update user[END]');
    if (err) {
      console.log('updateUser error:' + err);
    }
  });
}

// ユーザー削除
function deleteUser(socket, data) {
  if (data.uid) {
    User.remove({ 'uid': data.uid }, function(err) {
      if (!err) {
        socket.emit('delete', { 'result': true });
      } else {
        console.log('deleteUser error:' + err);
        socket.emit('delete', { 'result': false, err: "" + err });
      }
    });
  } else {
    // uid is not specified.
    socket.emit('delete', { 'result': false, err: "not specified UID." });
  }
}

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
//    socket.emit('score', data);
//    socket.broadcast.emit('score', data);

      // 個人順位を参加プレーヤー全員に通知
//      notifyPersonalRank(socket, data.rid);

      // チーム順位を参加プレーヤー全員に通知
//      notifyTeamRank(socket, data.rid);
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

    // ラウンド情報取得要求受信
    socket.on('getroundinf', function (data) {
        // ラウンド情報を通知
        notifyRoundData(socket);
    });
  });

// ラウンド情報通知
function notifyRoundData(socket) {
    console.log('notifyRoundData');
    var calls = [];
    var roundList = [];
    var csubidList = [];
    calls.push(function (callback) {
        // ラウンド情報サーチ
        Round.find(function (err, rounds) {
            //console.log('rounds:' + rounds.length);
            if (!err && rounds != null) {
                if (rounds.length == 1) {
                    console.log('csubids:' + rounds[0].csubids);
                    var round = { "rid": rounds[0].rid, "rname": rounds[0].rname, "date": rounds[0].date, "time": rounds[0].time, "handicapinf": rounds[0].handicapinf, "cinf": [], "prtyinfs": rounds[0].prtyifs };
                    var courseinf = { "cid": rounds[0].cid };
                    // コース情報サーチ
                    Course.findOne({ "cid": rounds[0].cid }, function (err, crs) {
                        if (!err) {
                            courseinf["cname"] = crs.cname;
                            var csubList = [];
                            // サブコースIDごとホール情報取得
                            async.forEach(rounds[0].csubids, function (csubid, csubidCb) {
                                // ホール情報サーチ
                                Hole.findOne({ 'csubid': csubid }, function (err, csub) {
                                    if (!err) {
                                        //                                console.log("csub:" + csub);
                                        csubList.push(csub);
                                    } else {
                                        console.log("Hole.findOne err : " + err);
                                    }
                                    csubidCb();
                                });
                            }, function (err) {
                                // サブコースIDごとのホール情報取得が完了後、
                                // パーティ情報を取得
                                //                        console.log("async.forEach(csubids) err:" + err + ",csublist:" + csubList);
                                courseinf.holeinfs = csubList;
                                round.cinf = courseinf;
                                var prtyinfs = [];  // パーティ情報配列
                                // パーティ情報ごとプレーヤー情報取得
                                async.forEachSeries(rounds[0].prtyifs, function (prtyinf, prtyinfCb) {
                                    var plyrinfsForTeam = [];
                                    var plyrinfs = [];  // プレーヤー情報配列
                                    async.forEachSeries(prtyinf.plyrifs, function (plyrid, plyrinfCb) {
                                        // プレーヤー情報サーチ
                                        Player.findOne({ 'plid': plyrid }, function (err, plyr) {
                                            if (!err && plyr) {
                                                plyrinfs.push({ "plid": plyr.plid, "rid": plyr.rid, "uid": plyr.uid, "tid": plyr.tid });
                                            } else {
                                                console.log("Player.findOne err : " + err);
                                            }
                                            plyrinfCb();
                                        });
                                    }, function (err) {
                                        // パーティごとのプレーヤー情報取得が完了後、
                                        // パーティ情報オブジェクトへ設定
                                        if (!err) {
                                            async.forEachSeries(plyrinfs, function (plyr, plyrCb) {
                                                // チーム情報取得
                                                Team.findOne({ 'tid': plyr.tid }, function (err, team) {
                                                    if (!err) {
                                                        console.log("team:" + team);
                                                        plyr["team"] = { "tid": team.tid, "tname": team.tname, "timg": team.timg };
                                                        plyrinfsForTeam.push(plyr);
                                                    } else {
                                                        console.log("Team.findOne err : " + err);
                                                    }
                                                    plyrCb();
                                                });
                                            }, function (err) {
                                                // チーム情報取得完了
                                                if (!err) {
                                                    var plyrinfsForUser = [];
                                                    async.forEachSeries(plyrinfsForTeam, function (plyr, plyrCb2) {
                                                        // ユーザー情報取得
                                                        User.findOne({ 'uid': plyr.uid }, function (err, user) {
                                                            if (!err) {
                                                                console.log("user:" + user);
                                                                plyr["user"] = { "uid": user.uid, "uname": user.uname, "mail": user.mail, "brthdy": user.brthdy, "sex": user.sex, "uimg": user.uimg, "created": user.created};
                                                                plyrinfsForUser.push(plyr);
                                                            } else {
                                                                console.log("User.findOne err : " + err);
                                                            }
                                                            plyrCb2();
                                                        });
                                                    }, function (err) {
                                                        prtyinf.plyrifs = plyrinfsForUser;
                                                        //prtyinf.plyrifs = plyrinfs;
                                                        prtyinf.holeinfs = [];
                                                        if (prtyinf.csubids[0] == csubList[0].csubid) {
                                                            prtyinf.holeinfs.push(csubList[0]);
                                                            prtyinf.holeinfs.push(csubList[1]);
                                                        } else {
                                                            prtyinf.holeinfs.push(csubList[1]);
                                                            prtyinf.holeinfs.push(csubList[0]);
                                                        }
                                                        prtyinfs.push(prtyinf);
                                                        prtyinfCb();
                                                    });
                                                } else {
                                                    console.log("async.forEach(plyrinfs : " + err);
                                                }
                                            });
                                            //prtyinfCb();
                                        } else {
                                            console.log("async.forEach(prtyinf.plyrifs : " + err);
                                        }
                                        //prtyinfCb();
                                    });
                                }, function (err) {
                                    // パーティ情報取得完了後、ラウンド情報オブジェクトへ設定
                                    if (!err) {
                                        round.prtyinfs = prtyinfs;
                                        roundList.push(round);
                                        callback(null, roundList);
                                    }
                                });
                            });
                        } else {
                            console.log("Cource.findOne err : " + err);
                        }
                    });
                } else {
                    async.forEach(rounds, function (round, cb) {
                        roundList.push({ "rid": round.rid, "rname": round.rname, "date": round.date, "time": round.time, "cinf": round.cinf, "prtyinfs": round.prtyifs });
                        cb();
                    }, function (err) {
                        console.log("notifyRoundData forEach error:" + err);
                        callback(null, roundList);
                    });
                }
            } else {
                console.log("notifyRoundData Round.find() error:" + err);
                callback(null, roundList);
            }
        });
    });

    async.series(calls, function (err, result) {
        if (!err) {
            console.log('emit getroundinf : ' + roundList);
            socket.emit('getroundinf', roundList);
        } else {
            console.log("async.series error:" + err);
        }
    });
}

// スコア入力 : inputScore
function inputScore(socket, data) {
  var calls = [];

  calls.push(function(callback) {
    Score.findOne({ 'rid':data.rid, 'uid': data.uid, 'cid': data.cid, 'csubid': data.csubid, 'holeno': data.holeno },
      function (err, score) {
        if (!err) {
          if (score) {
            // found, then update
            score.score = data.score;
            score.save(function(err) {
              if (err) console.log("score update error:" + err);
            });
          } else {
            // NOT found, then add
            updScore = new Score(data);
            updScore.save(function(err) {
              // notify personal rank
              if (!err) {
                console.log("score saved:" + data);
                //notifyPersonalRank();
              } else {
                console.log("score save error:" + err);
              }
            });
          }
        } else {
          // findOne error
          console.log("Score.findOne error:" + err);
        }
        callback(null, null);
      });
  });

  calls.push(function(callback) {
    // 個人順位を参加プレーヤー全員に通知
    notifyPersonalRank(socket, data.rid);
    callback(null, null);
  });

  async.series(calls, function(err, result) {
    console.log('end main');
  });
}

function notifyPersonalRank(socket, rid) {
    console.log('notifyPersonalRank');
    var calls = [];
    var pscores = [];

    calls.push(function (callback) {
        Player.find({'rid': rid}, function (err, players) {
            if (!err && players != null) {
                async.forEachSeries(players, function (player, cb) {
                    Score.find({'uid': player.uid}).sort({'csubid':'asc', 'holeno':'asc'}).exec(
                        function(err, scores) {
                            if (!err && scores != null && scores.length > 0) {
                                var gross = 0;
                                var holes = [];
                                var holesOut;
                                var holesIn;
                                var scoresOut = [];
                                var scoresIn = [];
                                async.forEachSeries(scores, function(score, scoreCb) {
                                    // まわった順のコースサブID、ホール毎スコアをプッシュ
                                    if (scoresOut.length < 9) {
                                      if (!holesOut) {
                                        holesOut = { "csubid": score.csubid, "scores": null };
                                      }
                                      scoresOut.push(score.score);
                                    } else {
                                      if (!holesIn) {
                                        holesIn = { "csubid": score.csubid, "scores": null };
                                      }
                                      scoresIn.push(score.score);
                                    }
                                    // グロス変数に足しこみ
                                    gross += score.score;
                                    scoreCb();
                                }, function (err) {
                                    console.log("score created");
                                    Team.findOne({ 'tid': player.tid }, function (err, team) {
                                        if (!err) {
                                            holesOut.scores = scoresOut;
                                            holesIn.scores = scoresIn;
                                            User.findOne({ 'uid': player.uid }, function (err, user) {
                                                pscores.push({
                                                    "user": { "uid": user.uid, "uname": user.uname, "mail": user.mail, "brthdy": user.brthdy, "sex": user.sex, "uimg": user.uimg, "created": user.created },
                                                    "team": { "tid": team.tid, "tname": team.tname, "timg": team.timg },
                                                    "score": { "gross": gross, "holes": [ holesOut, holesIn] },
                                                    "plid": player.plid
                                                });
                                                cb();
                                            });
                                        }
                                    });
                                });
                            } else {
                                console.log("Score.find err : " + err);
                                cb();
                                //pscores.push({ "user": user, "score": { "gross": 0, "holes": [] } });
                            }
                            //cb();
                        });
                }, function(err) {
                    callback(null, pscores);
                });
            } else {
                callback();
            }
        });
    });

    async.series(calls, function (err, result) {
        if (err) {
            return console.log(err);
        }
//      console.log('pscores ' + pscores);
        socket.emit('personalscore', { "pscores": pscores });
        socket.broadcast.emit('personalscore', { "pscores": pscores });
    });
}

function findScore(user, pscores) {
  console.log("find " + user.uid);
  Score.find({'uid' : user.uid}).sort({'holeno':'asc'}).exec(
    function (err, scores) {
//      console.log('find score' + scores);
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


///
/// maintenance service
///
var mnt = io
  .of('/maintenance')
  .on('connection', function(socket) {
    // clrsc : スコア削除
    socket.on('delsc', function(data) {
      // スコア削除要求
      if (data.key) {
        if (data.key == '999') {
            var uid = data.uid;
            Score.remove({ 'uid': uid }, function(err) {
              if (err) {
                console.log('clear score errored : ' + err);
                socket.emit('delsc', { 'result': false });
              } else {
                console.log('cleared score for ' + uid );
                socket.emit('delsc', { 'result': true });
              }
            });
        }
      }
    });
  });

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
