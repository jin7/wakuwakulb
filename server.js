
/**
 * Module dependencies.
 */
process.env.TZ = 'Asia/Tokyo';

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

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

var points = [];
//var io = require('socket.io').listen(app);
var server = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port" + app.get('port'));
});
var io = require('socket.io').listen(server);

//// account service
var act = io
  .of('/account')
  .on('connection', function(socket) {
    // add
    socket.on('add', function(socket) {
      // ユーザー登録

    });
  });

//// comment service
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

//// round service
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

//// leaders board service
var lb = io
  .of('/leadersboard')
  .on('connection', function (socket) {
    console.log("connected /leadersboard");
    // score
    socket.on('score', function (data) {
      // スコア入力データ受信
      var rid = data.rid;
      var uid = data.uid;
      var holeno = data.holeno;
      var score = data.score;
      // DBへ保存
      // TODO:スコアをDBへ保存

      // 個人順位を参加プレーヤー全員に通知
      var pscores = [];
      // TODO:個人スコア生成
      socket.emit('personalscore', pscores);

      // チーム順位を参加プレーヤー全員に通知
      var tscores = [];
      // TODO:チームスコア生成
      socket.emit('teamscore', tscores);
    });
});

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
