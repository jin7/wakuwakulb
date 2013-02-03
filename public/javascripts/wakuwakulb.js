$(function() {
    // check desktop notifications
    checkNotifications();

    var live = new io.connect("/live");

    live.on("connect", function(){
      $("#title").text(live.socket.transport.name + " chat");// 接続時に接続方式表示
    });

    live.on("comment", function(data) {
            $("<li>").text(data.comment).prependTo($("#messageArea ul"));// 受信メッセージをレンダリング
            // Desktop Notification
            checkNotifications();
            notification('websockets chat', data);
        });

    $("#submitButton").click(function(event){
      // TODO: rid, uid
      live.emit("comment", { rid: "dummy-rid", uid: "dummy-uid", comment: $("#name").val() + " : " + $("#msg").val()});// 入力メッセージをサーバへ
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
