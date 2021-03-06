$(function() {
    // check desktop notifications
    checkNotifications();

    var live = new io.connect("/live");        // live サービス用
    var lb = new io.connect("/leadersboard");  // leadersboard サービス用

    var account = new io.connect("/account");  // account サービス用（管理向け）
    var round = new io.connect("/round");      // round サービス（管理向け）

    ///
    /// 各サービス接続
    ///
    // live サービス接続
    live.on("connect", function(){
      $("#title").text(live.socket.transport.name + " chat");// 接続時に接続方式表示
    });
    // leadersboard サービス接続
    lb.on("connect", function() {
      // 
    });
    // account サービス接続
    account.on("connect", function() {
      // 
    });
    // round サービス接続
    round.on("connect", function() {
      //
    });

    ///
    /// live イベント処理
    ///
    // comment イベント受付
    live.on("comment", function(data) {
            $("<li>").text(data.comment).prependTo($("#messageArea ul"));// 受信メッセージをレンダリング
            // Desktop Notification
            checkNotifications();
            notification('websockets chat', data);
        });

    ///
    /// leadersboard イベント処理
    ///
    // personalscore イベント受付
//    lb.on('score', function(data) {
//      // ホールスコアを反映する
//    });

    lb.on('personalscore', function(data) {
      // 個人順位を反映する
//      alert("gross :" + data.pscores[0].score.gross);
      var msg = "";
      for (i = 0; i < data.pscores.length; i++)
      {
//          msg += "user : " + data.pscores[i].user.uname + "," + data.pscores[i].user.uid + "\n";
          msg += "gross : " + data.pscores[i].score.gross + "\n";
          for (j = 0; j < data.pscores[i].score.holes.length; j++)
          {
              msg += "no." + (j + 1) + ":" + data.pscores[i].score.holes[j] + "\n";
          }
          alert(msg);
      }
//      alert(data);
    });
    // teamscore イベント受付
    lb.on('teamscore', function(data) {
      // チーム順位を反映する
    });


// 以下、テストコード
    $("#submitButton").click(function(event){
      // TODO: rid, uid
      live.emit("comment", { rid: "dummy-rid", uid: "dummy-uid", comment: $("#name").val() + " : " + $("#msg").val()});// 入力メッセージをサーバへ
      inputScore(lb, 1, 1, parseInt($("#name").val()), parseInt($("#msg").val()));
//      lb.emit('score', { rid: 1, uid: 1, holeno: $("#name").val(), score: $("#msg").val() });
    });

    var $msg = $('#msg')
    , $ok = $('#ok')
    , $display = $('#display')
    ;
    live.on('msg push', function(data) {
        var $li = $('<li>').text(data);
        $display.append($li);
    });
    $ok.click(function() {
        live.emit('msg send', $msg.val());
    });
});

///
/// スコア入力
///
function inputScore(lb, rid, uid, holeno, score) {
  lb.emit('score', { rid: rid, uid: uid, holeno: holeno, score: score });
}

// check Desktop Notification
function checkNotifications() {
  if (!window.webkitNotifications) return;
  if (window.webkitNotifications.checkPermission() != 0) {
    window.webkitNotifications.requestPermission();
  }
};
// Notification
function notification(title, message) {
  if (window.webkitNotifications.checkPermission() == 0) {
    var nt = window.webkitNotifications.createNotification(null, title, data.comment);
    nt.ondisplay = function() {
      setTimeout(function() { nt.cancel(); }, 5000);
    };
    nt.show();
  } else {
    window.webkitNotifications.requestPermission();
  }
};
