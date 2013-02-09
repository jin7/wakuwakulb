var rid=1;
var uid;
var uname;
var curHole;
var curParNum;
var curScore;

var lb;

// ページ初期化処理（個人順位）
$(document).delegate("#rank_personal", "pageinit", function() {
	$(".ui-slider").width(100);
});

// ページ初期化処理（チーム順位）
$(document).delegate("#rank_team", "pageinit", function() {
	$(".ui-slider").width(100);
});

// ページ初期化処理（スコア）
$(document).delegate("#score", "pageinit", function() {
	
});

// ページ初期化処理（スコア入力ダイアログ）
$(document).delegate("#inputscore", "pageinit", function() {
	var desc;
	desc = "(Hole:" + curHole + " par:" + curParNum + ")";
	$("span#inputscore-desc").text(desc)

	if (curScore > 0) {
		$("#selectscore").val(curScore);
		$("#selectscore").selectmenu("refresh",true);
	}
/*
	var i, target, str;
	for (i = 1; i < 16; i++) {
		target = "select#selectscore option[value='" + i + "']";
		if (i == 1) {
			str = "Hole In One";
		} else if (i == (curParNum - 3)) {
			str = "Albatros";
		} else if (i == (curParNum - 2)) {
			str = "Eagle";
		} else if (i == (curParNum - 1)) {
			str = "Birdie";
		} else if (i = curParNum) {
			str = "Par";
		} else if (i == (curParNum + 1)) {
			str = "Boggy";
		} else if (i == (curParNum + 2)) {
			str = "Double Boggy";
		} else if (i == (curParNum + 3)) {
			str = "Triple Boggy";
		} else {
			str = curParNum;
		}
		if (i <= curParNum * 3) { 
			$(target).text(str);
//			$(target).show();
		} else {
//			$(target).hide();
		}
	}	
*/	
});


$(function() {


/*
	// leadersboard接続
	var uri="localhost";
	io.transports = ['xhr-polling']; 
//	io.transports = ['websocket']; 
	var socket = io.connect(uri, { 
	  'try multiple transports': false, 
	  'force new connection': true 
	}); 
	
	lb = socket.of('/leadersboard');
	lb.on("connect", function() {
		console.log("The connection to the server succeed!");
		lb.on("personalscore", function(data) {
			console.log(data);
			alert(data);
		});
	});
    lb.on('connect_failed', function(data){
		console.log('The connection to the server failed. : ' + data);
    });
*/

	// leadersboard接続
	io.transports = ['xhr-polling']; 
	lb = io.connect("/leadersboard", { 
	  'try multiple transports': false, 
	  'force new connection': true 
	}); 
	console.log("attempt connect...");
	lb.on("connect", function() {
		console.log("The connection to the server succeed!");
		lb.on("personalscore", function(data) {
			console.log(data);
		});
	});
    lb.on('connect_failed', function(data){
		console.log('The connection to the server failed. : ' + data);
    });

	// cookieから情報取得
	uid = $.cookie("uid")
	uname = $.cookie("uname")

	// ログインデフォルト設定
	if (uid != null) {
		$("#player-name").val(uid);
		$("#player-name").selectmenu("refresh",true);
	}

	//【イベント】ログイン - OK
    $("#login-ok").click(function(event) {
    	uid = $("#player-name option:selected").attr("value");
    	uname = $("#player-name option:selected").text();

		// uidをcookieへ -> 次回デフォルト
    	$.cookie("uid", uid, { expires: 1 });
    	$.cookie("uname", uname, { expires: 30 });

		// 通知データ要求
		requestPersonalScore(lb, rid, uid, 2);

		// 次の画面へ
    	location.href = "#rank_personal";
    });

	//【イベント】 スコア入力ダイアログ表示
    $(".holescore").click(function(event) {
		curHole = $("h1.hole", this).text().replace("H", "");
		curParNum = $("p.par", this).text().replace("par ", "");
		curScore = $("span.score", this).text();
    	$("#showinputdialog").click();
    });

	//【イベント】 スコア入力ダイアログ - OK
    $("#dlg-ok").click(function(event) {
    	curScore = $("#selectscore").val();
    	inputScore(lb, "1", uid, curHole, curScore);
    	$(".ui-dialog").dialog("close");
    });
});

// スコア入力
function inputScore(lb, rid, uid, holeno, score) {
	lb.emit('score', { "rid": rid, "uid": uid, "holeno": holeno, "score": score });
}

// 個人スコア要求
function requestPersonalScore(lb, rid, uid, type) {
	lb.emit('personalscore', { "rid": rid, "uid": uid, "type": type });
}

