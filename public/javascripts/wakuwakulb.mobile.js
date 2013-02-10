var rid=1;
var uid;
var uname;
var curHole;
var curParNum;
var curScore;
var curScoreMode = "gross";

var curAllScores = null;
var ownScore = null;
var lb;

var dummyData = {
	"pscores" : [
		{
			"user" : {
				"uid" : 1,
				"uname" : "江頭22:50",
				"mail" : "",
				"uimg" : "/images/ega.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 1,
				"team" : "めちゃモテ",
				"timg" : "/images/ega.jpg"
			},
			"score" : {
				"gross" : 108,
				"hc" : 36,
				"net" : 72,
				"rank" : 1,
				"holes" : [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
			}
		},
		{
			"user" : {
				"uid" : 2,
				"uname" : "エテ吉",
				"mail" : "",
				"uimg" : "/images/monkey.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 2,
				"team" : "動物",
				"timg" : "/images/monkey.jpg"
			},
			"score" : {
				"gross" : 74,
				"hc" : 1,
				"net" : 73,
				"rank" : 2,
				"holes" : [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5]
			}
		},
		{
			"user" : {
				"uid" : 3,
				"uname" : "バラク・小浜",
				"mail" : "",
				"uimg" : "/images/obama.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 3,
				"team" : "政治家",
				"timg" : "/images/obama.jpg"
			},
			"score" : {
				"gross" : 90,
				"hc" : 15,
				"net" : 75,
				"rank" : 3,
				"holes" : [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
			}
		}]
	};
	

// ページ初期化処理（個人順位）
$(document).delegate("#rank_personal", "pageinit", function() {
	$(".ui-slider").width(100);
});

// ページ初期化処理（チーム順位）
$(document).delegate("#rank_team", "pageinit", function() {
	$(".ui-slider").width(100);
});

// ページ初期化処理（スコア）
$(document).delegate("#score", "pagebeforeshow", function() {
});

// ページ初期化処理（スコア入力ダイアログ）
$(document).delegate("#inputscore", "pagebeforeshow", function() {
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

	// leadersboard接続
//	io.transports = ['xhr-polling']; 
	io.transports.push('xhr-polling'); 
	lb = io.connect("/leadersboard", { 
	  'try multiple transports': false, 
	  'force new connection': true 
	}); 
	console.log("attempt connect...");

	// 接続成功
	lb.on("connect", function() {
		console.log("The connection to the server succeed!");

		// 個人順位データ通知
		lb.on("personalscore", function(data) {
			console.log(data);

			// 自スコアの反映
			ownScore = data.pscores[0].score; // TODO 自分を探す必要あり
			if (ownScore != null) {
				reflectOwnScore(ownScore);
			}
			
			// 個人順位の反映
			curAllScores = dummyData;
			reflectPersonalRank(dummyData);
		});
	});
	
	// 接続失敗
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

	//【イベント】 スコアモード（グロス or ネット）変更
	$(".scoremode").bind("change", function(event, ui) {
		curScoreMode = this.value;
		if (curAllScores != null) {
			reflectPersonalRank(curAllScores);
		}
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

// スコア反映 -> 個人順位
function reflectPersonalRank(scores) {

	// 全データ削除
	$("ul#list_personal > li:not(.divider)").remove();

	// グロス or ネットの値を指定
	if (curScoreMode == "gross") {
		for (var i = 0; i < scores.pscores.length; i++) {
			scores.pscores[i].score.count = scores.pscores[i].score.gross;
		}
	} else {
		for (var i = 0; i < scores.pscores.length; i++) {
			scores.pscores[i].score.count = scores.pscores[i].score.net;
		}
	}

	// データ反映
	$("#listitem_personal").tmpl(scores.pscores).appendTo("ul#list_personal");
	$("ul#list_personal > li:not(.divider):odd").remove(); // TODO ゴミが入るので除去。ゴミが入らないようにすべし

	// リストのリフレッシュ	
	$("ul#list_personal").listview("refresh");
}

// スコア反映 -> チーム順位
function reflectTeamRank(scores) {
}

// スコア反映 -> 個人（ホール毎）
function reflectOwnScore(score) {
	var targets = $("a.holescore");
	var totalScoreOut = 0;
	var totalScoreIn = 0;
	var totalScore = 0;
	for (var i = 0; i < 18; i++) {
		var target = targets[i];
		var holeScore = "";
		var holeRelScore = "";
		console.debug(score.gross);
		if (score.holes[i] != null && score.holes[i] != "") {
			var par = parseInt($("p.par", target).text().replace("par ", ""));
			holeScore = score.holes[i];
			holeRelScore = score.holes[i] - par;
			if (i < 9) {
			    totalScoreOut += holeRelScore;
			} else {
			    totalScoreIn += holeRelScore;
			}
			totalScore += holeRelScore;
			$("p.mark", target).css("color", "blue").text("done");	
		} else {
			$("p.mark", target).css("color", "red").text("yet");	
		}
		$("span.relscore", target).text(convPlusNumStr(holeRelScore));
		$("span.score", target).text(holeScore);
	}
	$("li#totalscore > span.relscore").text(convPlusNumStr(totalScore));
	$("li#outscore > span.relscore").text(convPlusNumStr(totalScoreOut));
	$("li#inscore > span.relscore").text(convPlusNumStr(totalScoreIn));
}

// 1以上の場合、"+" を付与
function convPlusNumStr(src) {
	if (src > 0) {
		return "+" + src;
	} else {
		return src;
	}
}
