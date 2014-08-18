
/**
 * Module dependencies.
 */
process.env.TZ = 'Asia/Tokyo';

var express = require('express')
  , resource = require('express-resource')
  , routes = require('./routes')
  , user = require('./routes/user')
  , performance = require('./routes/performance')
  , performance_personal = require('./routes/performance_personal')
  , scoreboard = require('./routes/scoreboard')
  , setting = require('./routes/setting')
  , http = require('http')
  , fs = require('fs')
  , https = require('https')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , async = require('async');

mongoose = require('mongoose')
app = express();

var mongoUri = 'mongodb://127.0.0.1/wakuwakulb2';
var Schema = mongoose.Schema;

function validator(v) {
  return v.length > 0;
}
isNullOrEmpty = IsNullOrEmpty;
function IsNullOrEmpty(val) {
  return !val || val == null || val.length == 0
}
isValidPars = IsValidPars;
function IsValidPars(vals) {
  var l = vals.length;
  if (l != 9) {
    return false;
  }
  for (i = 0; i < l; i++) {
    if (isNaN(vals[i])) {
      return false
    }
  }
  return true;
}
isValidHandicapMethod = IsValidHandicapMethod;
function IsValidHandicapMethod(val) {
  if (isNaN(val)) {
    return false;
  }
  if (val != 1 && val != 2) {
    return false;
  }
  return true;
}
isValidHandicapUpperLimit = IsValidHandicapUpperLimit;
function IsValidHandicapUpperLimit(val) {
  if (!val || val == null || isNaN(val)) {
    return false;
  }
  return true;
}
isValidHoleinfs = IsValidHoleinfs;
function IsValidHoleinfs(vals, retCallback) {
  if (IsNullOrEmpty(vals)) {
    retCallback(false);
    return;
  }
  if (vals.length < 2) {
    retCallback(false);
    return;
  }
  var isValid = true;
  async.forEach(vals, function(holeinf, holeinfCb) {
    Hole.findOne({ 'csubid': holeinf },
      function(err, hole) {
        if (err) {
          isValid = false;
        }
        if (hole == null) {
          isValid = false;
        }
        holeinfCb();
      });
    },
    function(err) {
      if (err) {
        throw err;
      }
      retCallback(isValid);
    }
  );
}
isValidUid = IsValidUid;
function IsValidUid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  User.findOne({ 'uid': val },
    function(err, user) {
      if (err) {
        throw err;
      }
      if (user == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
isValidTid = IsValidTid;
function IsValidTid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  Team.findOne({ 'tid': val },
    function(err, team) {
      if (err) {
        throw err;
      }
      if (team == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
isValidPlids = IsValidPlids;
function IsValidPlids(vals, retCallback) {
  if (IsNullOrEmpty(vals)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  async.forEach(vals, function(val, cb) {
//console.log("plid=" + val)
    IsValidPlid(val, function(isValidPlid) {
      if (!isValidPlid) {
        cb(400);
      } else {
        cb(null);
      }
    });
  }, function(err) {
    if (err) {
      isValid = false;
    }
    retCallback(isValid);
  });
}
isValidPlid = IsValidPlid;
function IsValidPlid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  Player.findOne({ 'plid': val },
    function(err, player) {
      if (err) {
        throw err;
      }
      if (player == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
isValidCid = IsValidCid;
function IsValidCid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  Course.findOne({ 'cid': val },
    function(err, course) {
      if (err) {
        throw err;
      }
      if (course == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
isValidRid = IsValidRid;
function IsValidRid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  Round.findOne({ 'rid': val },
    function(err, round) {
      if (err) {
        throw err;
      }
      if (round == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
isValidPid = IsValidPid;
function IsValidPid(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  var isValid = true;
  Round.findOne({ 'pid': val },
    function(err, party) {
      if (err) {
        throw err;
      }
      if (party == null) {
        isValid = false;
      }
      retCallback(isValid);
    }
  );
}
embedRidInPlayer = EmbedRidInPlayer;
function EmbedRidInPlayer(rid, prtyifs, retCallback) {
  // TODO: embed rid in player
  async.forEach(prtyifs, function(prtyif, cb) {
    if (isNullOrEmpty(prtyif.plyrifs)) {
      cb(400);
    }
    async.forEach(prtyif.plyrifs, function(plid, plCb) {
      Player.findOne({ 'plid' : plid }, function(err, player) {
        if (err) {
          plCb(500);
        } else {
          player.rid = rid;
          player.save(function(err) {
            if (err) {
              plCb(500);
            } else {
              plCb(null);
            }
          });
        }
      });
    }, function(err) {
      if (err) {
        cb(err);
      } else {
        cb(null);
      }
    });
  }, function(err) {
    if (err) {
      retCallback(false);
    } else {
      retCallback(true);
    }
  });
}
isDate = IsDate;
function IsDate(datestr) {
  // 正規表現による書式チェック
  if (!datestr.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
    return false;
  }
  var vYear = datestr.substr(0, 4) - 0;
  var vMonth = datestr.substr(5, 2) - 1; // Javascriptは、0-11で表現
  var vDay = datestr.substr(8, 2) - 0;
  // 月,日の妥当性チェック
  if(vMonth >= 0 && vMonth <= 11 && vDay >= 1 && vDay <= 31){
    var vDt = new Date(vYear, vMonth, vDay);
    if (isNaN(vDt)) {
      return false;
    } else if (vDt.getFullYear() == vYear && vDt.getMonth() == vMonth && vDt.getDate() == vDay) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

responseSuccess = ResponseSuccess;
function ResponseSuccess(res, json) {
console.log("ResponseSuccess");
  if (!json) {
    res.json({ 'result':0 });
  } else {
    res.json(json)
  }
}

responseError = ResponseError;
function ResponseError(status, res, err) {
  res.statusCode = status;
  if (err) {
    res.json({ 'error': err });
  } else {
    res.json({ 'error': http.STATUS_CODES[status] });
  }
}

// get sequence numbers
// Counterスキーマを定義
// Counterは_idで複数個管理できる。
var counterSchema = new Schema({
  _id: String,
  seq: Number
});
// Counterスキーマに新しいIDを発行させるメソッドを追加
// MongoDBのfindAndModifyを用いて参照とともにカウンターの値を＋１する。
// staticsに追加したメソッドは、クラスメソッドのような感覚で使える。
counterSchema.statics.createNewId = function (name, callback) {
  return this.collection.findAndModify(
    { _id: name }, //Query
    [], //sort
    { $inc: { seq: 1 } }, //update document
    { new: true, upsert: true }, //options
    callback
  );
};
// モデルを作成
IDCreater = mongoose.model('counters', counterSchema);
// ID作成共通関数
function CreateID(idname, retCallback) {
  var retid;
  var calls = [];
  calls.push(function (callback) {
    IDCreater.createNewId(idname, function(err, id) {
      if (err) {
        throw err;
      }
      retid = idname + id.seq;
      callback();
    });
  });
  async.series(calls, function (err, result ) {
    if (err) {
      throw err;
    }
    retCallback(retid);
  });
}
createCsubid = CreateCsubid;
function CreateCsubid(retCallback) {
  CreateID("cs", retCallback);
}
createCid = CreateCid;
function CreateCid(retCallback) {
  CreateID("c", retCallback);
}
createUid = CreateUid;
function CreateUid(retCallback) {
  CreateID("u", retCallback);
}
createTid = CreateTid
function CreateTid(retCallback) {
  CreateID("t", retCallback);
}
createPlid = CreatePlid
function CreatePlid(retCallback) {
  CreateID("pl", retCallback);
}
createRid = CreateRid;
function CreateRid(retCallback) {
  CreateID("r", retCallback);
}
createPid = CreatePid;
function CreatePid(num, retCallback) {
  var calls = [];
  var pids = [];
  for (i = 0; i < num; i++) {
    calls.push(function(callback) {
      CreateID("p", function(pid) {
        pids.push(pid);
        callback();
      });
    });
  }
  async.series(calls, function (err, result) {
    if (err) {
      throw err;
    }
    retCallback(pids);
  });
}
isValidKey = IsValidKey;
function IsValidKey(val, retCallback) {
  if (IsNullOrEmpty(val)) {
    retCallback(false);
    return;
  }
  Auth.findOne({ 'account': 'wakuwakuadmin'}, function(err, auth) {
    if (err) {
      retCallback(false);
    } else {
      if (auth == null) {
        retCallback(false);
        return;
      }
      if (val == auth.key) {
        retCallback(true);
      } else {
        retCallback(false);
      }
    }
  });
}
///
/// Database schema
///

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
Round = mongoose.model('Round', roundModel);

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
Party = mongoose.model('Party', partyModel);

// Course model
var courseModel = new Schema({
    //cid: { type: Number }
    cid: { type: String }
  , cname: { type: String }
  , holeinfs: { type: Array }
});
Course = mongoose.model('Course', courseModel);

// Hole model
var holeModel = new Schema({
    csubid: { type: String }
  , csubname: { type: String }
  , names: { type: Array }
  , pars: { type: Array }
});
Hole = mongoose.model('Hole', holeModel);

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
  , csubids: { type: [String] }
});
Player = mongoose.model('Player', playerModel);

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
User = mongoose.model('User', userSchema);

// Team model
var teamSchema = new mongoose.Schema({
    //tid: { type: Number }
    tid: { type: String }
  , tname: { type: String, validate: [validator, "Empty Error"] }
  , timg   : { type: String }
});
Team = mongoose.model('Team', teamSchema);

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
Score = mongoose.model('Score', scoreSchema);

// Auth model
var authSchema = new mongoose.Schema({
    account: { type: String }
  , key: { type: String }
});
Auth = mongoose.model('Auth', authSchema);

// Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 443);
//  app.set('port', process.env.PORT || 3000);
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
  // apply this rule to all requests accessing any URL/URI
  app.all('*', function(req, res, next) {
      // add details of what is allowed in HTTP request headers to the response headers
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Credentials', false);
      res.header('Access-Control-Max-Age', '86400');
      res.header('Access-Control-Allow-Headers', 'X-W2LBKey, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
      // the next() function continues execution and will move onto the requested URL/URI
      next();
  });
  // fulfils pre-flight/promise request
  app.options('*', function(req, res) {
    res.send(200);
  });
  mongoose.connect(mongoUri);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

//app.configure('production', function(){
//  app.use(express.errorHandler()); 
//});

// Routes of setting API
app.resource('holes', require('./routes/holes'), { id: 'csubid' });
app.resource('courses', require('./routes/courses'), { id: 'cid' });
app.resource('users', require('./routes/users'), { id: 'uid' });
app.resource('teams', require('./routes/teams'), { id: 'tid' });
app.resource('players', require('./routes/players'), { id: 'plid' });
app.resource('rounds', require('./routes/rounds'), { id: 'rid' });
app.get('/setting', setting.setting);

// Routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/performance', performance.performance);
app.get('/performance_personal', performance_personal.performance_personal);
app.get('/scoreboard', scoreboard.scoreboard);
// Smart帳票
app.get('/sff', function(req, res) {
  var urlobj = url.parse(req.url);
  var path = urlobj.pathname;
  var body = fs.readFileSync(path);
  res.set('Content-Type', 'application/x-sff');
  res.set('Content-Length', body.length);
  res.end(body);
});



// Server

//var io = require('socket.io').listen(app);
var options = {
  key: fs.readFileSync(__dirname + '/crypto/wakuwakulb-key.pem'),
  cert: fs.readFileSync(__dirname + '/crypto/wakuwakulb-cert.pem')
};
var server = https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
//var server = http.createServer(app).listen(app.get('port'), function() {
//  console.log("Express server listening on port" + app.get('port'));
//});
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
        notifyRoundData(socket, data.rid );
    });
  });

// ラウンド情報通知
function notifyRoundData(socket, rid) {
    console.log('notifyRoundData:' + rid);
    var calls = [];
    var roundobj = {};
    var csubidList = [];
    calls.push(function (callback) {
        // ラウンド情報サーチ
        Round.findOne({ 'rid': rid }, function (err, round) {
            //console.log('rounds:' + rounds.length);
            if (!err && round != null) {
                    console.log('csubids:' + round.csubids);
                    roundobj = { "rid": round.rid, "rname": round.rname, "date": round.date, "time": round.time, "handicapinf": round.handicapinf, "cinf": [], "prtyinfs": round.prtyifs };
                    var courseinf = { "cid": round.cid };
//console.log("cid:" + round.cid);
                    // コース情報サーチ
                    Course.findOne({ "cid": round.cid }, function (err, crs) {
                        if (!err) {
//console.log("crs:" + crs);
                            courseinf["cname"] = crs.cname;
                            var csubList = [];
                            // サブコースIDごとホール情報取得
                            async.forEach(round.csubids, function (csubid, csubidCb) {
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
                                roundobj.cinf = courseinf;
                                var prtyinfs = [];  // パーティ情報配列
                                // パーティ情報ごとプレーヤー情報取得
                                async.forEachSeries(round.prtyifs, function (prtyinf, prtyinfCb) {
                                    var plyrinfsForTeam = [];
                                    var plyrinfs = [];  // プレーヤー情報配列
                                    async.forEachSeries(prtyinf.plyrifs, function (plyrid, plyrinfCb) {
                                        // プレーヤー情報サーチ
                                        Player.findOne({ 'plid': plyrid, 'rid': round.rid }, function (err, plyr) {
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
//console.log("tid:" + plyr.tid);
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
                                        roundobj.prtyinfs = prtyinfs;
                                        callback(null, roundobj)
                                    }
                                });
                            });
                        } else {
                            console.log("Cource.findOne err : " + err);
                        }
                    });
            } else {
                console.log("notifyRoundData Round.find() error:" + err);
                callback(null, roundobj);
            }
        });
    });

    async.series(calls, function (err, result) {
        if (!err) {
            console.log('emit getroundinf : ' + roundobj);
            socket.emit('getroundinf', roundobj);
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

//  calls.push(function(callback) {
//    // 個人順位を参加プレーヤー全員に通知
//    notifyPersonalRank(socket, data.rid);
//    callback(null, null);
//  });

  async.series(calls, function(err, result) {
    console.log('end inputScore');
  });
}

function notifyPersonalRank(socket, rid) {
    console.log('notifyPersonalRank');
    var calls = [];
    var pscores = [];

    calls.push(function (callback) {
        Player.find({'rid': rid}, function (err, players) {
//            console.log("1:Player uid:" + player.uid + ",rid:" + player.rid);
            if (!err && players != null) {
                async.forEachSeries(players, function (player, cb) {
                    var csubids;
//                    csubids = JSON.parse(player.csubids);
                    csubids = player.csubids;
//                    console.log("Player uid:" + player.uid + ",rid:" + player.rid);
                    Score.find({'uid': player.uid, 'rid': player.rid}).sort({'csubid':'asc', 'holeno':'asc'}).exec(
//                    Score.find({'uid': player.uid}).sort({'csubid':'asc', 'holeno':'asc'}).exec(
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
                                    if (score.csubid == csubids[0]) {
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
                                            if (holesOut) {
                                              holesOut.scores = scoresOut;
                                            }
                                            if (holesIn) {
                                              holesIn.scores = scoresIn;
                                            }
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
