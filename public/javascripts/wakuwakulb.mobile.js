/******************************************************************
 * 変数
 ******************************************************************/
var rid=1;		// ラウンドID
var uid;		// ユーザID
var uname;		// ユーザ名

// スコア入力用
var curHole;	// ホール
var curParNum;	// パー数
var curScore;	// スコア

var curScoreMode = "gross";
var curPersonalScores = null;
var curTeamScores = null;
var ownScore = null;

var lb;
var live;

// コース情報（parデータ）
var parData = [4,5,3,4,4,5,4,3,4,4,4,3,5,4,4,3,5,4];

// スコアデータ（ダミー）
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
				"team" : "ワイルドネイチャーチーム",
				"timg" : "/images/ega.jpg"
			},
			"score" : {
				"gross" : 82,
				"hc" : 10,
				"net" : 72,
				"rank" : 1,
//				"holes" : [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
				"holes" : []
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
				"tid" : 1,
				"team" : "ワイルドネイチャーチーム",
				"timg" : "/images/monkey.jpg"
			},
			"score" : {
				"gross" : 74,
				"hc" : 1,
				"net" : 73,
				"rank" : 2,
//				"holes" : [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5]
//				"holes" : [4,4,4,4,4,4,4]
				"holes" : []
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
				"tid" : 2,
				"team" : "グローバルチーム",
				"timg" : "/images/obama.jpg"
			},
			"score" : {
				"gross" : 90,
				"hc" : 15,
				"net" : 75,
				"rank" : 3,
//				"holes" : [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
//				"holes" : [5,5,5,5,5,5,5,5,6,8,7,5,5,5]
				"holes" : []
			}
		},
		{
			"user" : {
				"uid" : 4,
				"uname" : "モナリーザ",
				"mail" : "",
				"uimg" : "/images/monariza.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 2,
				"team" : "グローバルチーム",
				"timg" : "/images/obama.jpg"
			},
			"score" : {
				"gross" : 98,
				"hc" : 20,
				"net" : 78,
				"rank" : 4,
//				"holes" : [6,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5]
//				"holes" : [6,6,6,6,6,6,6,6,5,5]
				"holes" : []
			}
		},
		{
			"user" : {
				"uid" : 5,
				"uname" : "安倍　心臓",
				"mail" : "",
				"uimg" : "/images/abe.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 3,
				"team" : "超党派日本再建チーム",
				"timg" : "/images/abe.jpg"
			},
			"score" : {
				"gross" : 82,
				"hc" : 5,
				"net" : 77,
				"rank" : 5,
//				"holes" : [4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5]
//				"holes" : [4,4,4,4,4,4,4,4,5,5,5,5]
				"holes" : []
			}
		},
		{
			"user" : {
				"uid" : 6,
				"uname" : "小沢　二郎",
				"mail" : "",
				"uimg" : "/images/ozawa.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 3,
				"team" : "超党派日本再建チーム",
				"timg" : "/images/abe.jpg"
			},
			"score" : {
				"gross" :120,
				"hc" : 36,
				"net" : 75,
				"rank" : 3,
//				"holes" : [6,6,6,6,6,6,7,7,6,6,6,6,6,6,6,6,6,6]
				"holes" : []
			}
		},
		{
			"user" : {
				"uid" : 7,
				"uname" : "坪田　和憲",
				"mail" : "",
				"uimg" : "/images/tsubota.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 4,
				"team" : "PSW孔球部チーム",
				"timg" : "/images/bluecats.jpg"
			},
			"score" : {
				"gross" :92,
				"hc" : 15,
				"net" : 77,
				"rank" : 3,
//				"holes" : [6,6,6,6,6,6,7,7,6,6,6,6,6,6,6,6,6,6]
				"holes" : []
			}
		},
		{
			"user" : {
				"uid" : 8,
				"uname" : "蔵本　圭介",
				"mail" : "",
				"uimg" : "/images/kuramoto.jpg",
				"birth" : "",
				"sex" : ""
			},
			"team" : {
				"tid" : 4,
				"team" : "PSW孔球部チーム",
				"timg" : "/images/bluecats.jpg"
			},
			"score" : {
				"gross" :80,
				"hc" : 5,
				"net" : 75,
				"rank" : 3,
//				"holes" : [6,6,6,6,6,6,7,7,6,6,6,6,6,6,6,6,6,6]
				"holes" : []
			}
		}]
	};

/******************************************************************
 * ページ初期化処理（個人順位）
 ******************************************************************/
$(document).delegate("#rank_personal", "pageinit", function() {
	$(".ui-slider").width(100);
});

/******************************************************************
 * ページ表示前処理（個人順位）
 ******************************************************************/
$(document).delegate("#rank_personal", "pagebeforeshow", function() {
	$("ul#list_personal select.scoremode").val(curScoreMode);
	$("ul#list_personal select.scoremode").slider("refresh");
});

/******************************************************************
 * ページ初期化処理（チーム順位）
 ******************************************************************/
$(document).delegate("#rank_team", "pageinit", function() {
	$(".ui-slider").width(100);
});

/******************************************************************
 * ページ表示前処理（チーム順位）
 ******************************************************************/
$(document).delegate("#rank_team", "pagebeforeshow", function() {
	$("ul#list_team select.scoremode").val(curScoreMode);
	$("ul#list_team select.scoremode").slider("refresh");
});

/******************************************************************
 * ページ表示前処理（スコア）
 ******************************************************************/
$(document).delegate("#score", "pagebeforeshow", function() {
});

/******************************************************************
 * ページ表示前処理（スコア入力ダイアログ）
 ******************************************************************/
$(document).delegate("#inputscore", "pagebeforeshow", function() {
	var desc;
	desc = "(Hole:" + curHole + " par:" + curParNum + ")";
	$("span#inputscore-desc").text(desc)

	var i, target, str, comment;
	for (i = 1; i < 16; i++) {
		target = "select#selectscore option[value='" + i + "']";
		if (i == 1) {
			str = i + " (Hole In One)";
		} else if (i == (curParNum - 3)) {
			str = i + " (Albatros)";
		} else if (i == (curParNum - 2)) {
			str = i + " (Eagle)";
		} else if (i == (curParNum - 1)) {
			str = i + " (Birdie)";
		} else if (i == curParNum) {
			str = i + " (Par)";
		} else if (i == (curParNum + 1)) {
			str = i + " (Boggy)";
		} else if (i == (curParNum + 2)) {
			str = i + " (Double Boggy)";
		} else if (i == (curParNum + 3)) {
			str = i + " (Triple Boggy)";
		} else {
			str = i;
		}
		if (i <= curParNum * 3) { 
			$(target).text(str);
			$(target).show();
		} else {
			$(target).hide();
		}
	}	


	if (curScore == 0) {
	    curScore = curParNum;
	}
	$("#selectscore").val(curScore);
	$("#selectscore").selectmenu("refresh",true);
});

/******************************************************************
 * 初期処理
 ******************************************************************/
$(function() {

	// leadersboard接続
//	io.transports = ['xhr-polling']; 
	io.transports.push('xhr-polling'); 
	lb = io.connect("/leadersboard", { 
	  'try multiple transports': false, 
	  'force new connection': true 
	}); 
	console.log("leadersboard attempt connect...");

	// 接続成功
	lb.on("connect", function() {
		console.log("leadersboard connection succeed!");

		// 個人順位データ通知
		lb.on("personalscore", function(data) {
			console.log("personalscore received");
			console.log(data);

//			curPersonalScores = data; // TODO
//------------- dummy data create -------------------------------
			curPersonalScores = dummyData;	// dummy
            for (var i = 0; i < curPersonalScores.pscores.length; i++) {
/*
				if (curPersonalScores.pscores[i].user.uid == uid) {
					curPersonalScores.pscores[i].score.holes = data.pscores[0].score.holes;
				}
*/
                for (var j = 0; j < data.pscores.length; j++) {
                    if (curPersonalScores.pscores[i].user.uid == data.pscores[j].user.uid) {
//                      curPersonalScores.pscores[i].user.uname = data.pscores[j].user.uname;
                        curPersonalScores.pscores[i].score.holes = data.pscores[j].score.holes;
                    }
                }
            }
//------------- dummy data create -------------------------------

			// 自スコアの反映
			ownScore = searchOwnScore(curPersonalScores, uid);
			if (ownScore != null) {
				reflectOwnScore(ownScore);
			}

			// データ最新化（gross/net計算、チームデータ作成）
			updatePersonalScores(curPersonalScores);
			curTeamScores = createTeamScores(curPersonalScores);

			// 個人順位の反映
			reflectPersonalRank(curPersonalScores);
			
			// チーム順位の反映
			reflectTeamRank(curTeamScores);
		});
	});
	
	// 接続失敗
    lb.on('connect_failed', function(data){
		console.log("leadersboard connection faled " + data);
    });

	// live接続
	live = io.connect("/live", { 
	  'try multiple transports': false, 
	  'force new connection': true 
	}); 
	console.log("live attempt connect...");

	// 接続成功
	live.on("connect", function() {
		console.log("live connection succeed!");

		// メッセージ受信
	    live.on("comment", function(data) {
			console.log("live message received");
			console.log(data);
			$(".dsp_comment").val(data.comment);
		});
	});

	// 接続失敗
    live.on('connect_failed', function(data){
		console.log("live connection faled " + data);
    });

	// cookieから情報取得
	uid = $.cookie("uid")
	uname = $.cookie("uname")

	// ログインデフォルト設定
	if (uid != null) {
		$("#player-name").val(uid);
		$("#player-name").selectmenu("refresh",true);
	}

	/******************************************************************
	 * 【イベント】ログイン - OK
	 ******************************************************************/
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

	/******************************************************************
	 * 【イベント】 スコアモード（グロス or ネット）変更
	 ******************************************************************/
	$(".scoremode").bind("change", function(event, ui) {
		curScoreMode = this.value;

		// 個人順位の反映
		reflectPersonalRank(curPersonalScores);

		// チーム順位の反映
		reflectTeamRank(curTeamScores);
	});

	/******************************************************************
	 * 【イベント】 スコア入力ダイアログ表示
	 ******************************************************************/
    $(".holescore").click(function(event) {
		curHole = parseInt($("h1.hole", this).text().replace("H", ""));
		curParNum = parseInt($("p.par", this).text().replace("par ", ""));
		curScore = $("span.score", this).text();
    	$("#showinputdialog").click();
    });

	/******************************************************************
	 * 【イベント】 スコア選択
	 ******************************************************************/
//	$("select#selectscore").change(function(event) {
//		$("#score_comment").val($("select#selectscore option:selected").text());
//	});

	/******************************************************************
	 * 【イベント】 スコア入力ダイアログ - OK
	 ******************************************************************/
    $("#dlg-ok").click(function(event) {
    	curScore = $("#selectscore").val();
    	inputScore(lb, "1", uid, curHole, curScore);
		var comment = $("#score_comment").val();
		$("#score_comment").val("");
		if (comment != "") {
	    	sendComment(live, "1", uid, uname + ": " + comment);
	    }
    	$(".ui-dialog").dialog("close");
    });
});

/******************************************************************
 * 【関数】 スコア入力（サーバへの送信）
 ******************************************************************/
function inputScore(lb, rid, uid, holeno, score) {
	lb.emit('score', { "rid": rid, "uid": uid, "holeno": holeno, "score": score });
}

/******************************************************************
 * 【関数】 個人スコア要求（サーバへの送信）
 ******************************************************************/
function requestPersonalScore(lb, rid, uid, type) {
	lb.emit('personalscore', { "rid": rid, "uid": uid, "type": type });
}

/******************************************************************
 * 【関数】 コメント（サーバへの送信）
 ******************************************************************/
function sendComment(live, rid, uid, comment) {
	live.emit("comment", { "rid": rid, "uid": uid, "comment": comment});
}

/******************************************************************
 * 【関数】 指定uidのスコア取得
 ******************************************************************/
function searchOwnScore(scores, uid) {
	for (var i = 0; i < scores.pscores.length; i++) {
		if (scores.pscores[i].user.uid == uid) {
			return scores.pscores[i].score;
		}
	}
	return null;
}

/******************************************************************
 * 【関数】 グロス／ネット計算（ラウンド中も加味）
 ******************************************************************/
function updatePersonalScores(scores) {
	for (var i = 0; i < scores.pscores.length; i++) {
		scores.pscores[i].score.gross = calcRelativeGross(scores.pscores[i].score.holes);
		scores.pscores[i].score.net = calcRelativeNet(scores.pscores[i].score.holes, scores.pscores[i].score.hc);
	}
}

/******************************************************************
 * 【関数】 チームスコアデータ作成
 * 
 *	teamscores = [
 *		{
 *			"tid" : 1,
 *			"team" : "xxx",
 *			"timg" : "xxx",
 *			"gross" : 0,
 *			"net" : 0,
 *			"userscores : [
 *				{
 *					// pscores[x]
 *				}],
 *		}];			
 ******************************************************************/
function createTeamScores(scores) {
	var teamscores = new Array();
	for (var i = 0; i < scores.pscores.length; i++) {

		// tidで検索 なければ作成
		var teamscore = searchTeamData(teamscores, scores.pscores[i].team.tid);
		if (teamscore == null) {
			teamscore = new Object();
			teamscore.tid = scores.pscores[i].team.tid;
			teamscore.team = scores.pscores[i].team.team;
			teamscore.timg = scores.pscores[i].team.timg;
			teamscore.gross = 0;
			teamscore.net = 0;
			teamscore.userscores = new Array();
			teamscores.push(teamscore);
		}
		
		teamscore.gross += parseInt(scores.pscores[i].score.gross);
		teamscore.net += parseInt(scores.pscores[i].score.net);
		teamscore.userscores[teamscore.userscores.length] = scores.pscores[i];
	}
	return teamscores;
}

/******************************************************************
 * 【関数】 スコア反映 -> 個人順位
 ******************************************************************/
function reflectPersonalRank(scores) {
	if (score == null) {
		return;
	}

	// 全データ削除
	$("ul#list_personal > li:not(.divider)").remove();

	// グロス or ネットの値を指定
	if (curScoreMode == "gross") {
		for (var i = 0; i < scores.pscores.length; i++) {
			scores.pscores[i].score.count = scores.pscores[i].score.gross
			scores.pscores[i].score.comment = createCommentGross(scores.pscores[i].score.holes);
		}
	} else {
		for (var i = 0; i < scores.pscores.length; i++) {
			scores.pscores[i].score.count = scores.pscores[i].score.net;
			scores.pscores[i].score.comment = createCommentNet(scores.pscores[i].score.holes, scores.pscores[i].score.hc);
		}
	}

	// ソート
    scores.pscores.sort(function(a, b) {
        return (parseInt(a.score.count) > parseInt(b.score.count) ? 1 : -1);
    });

	// データ反映
	$("#listitem_personal").tmpl(scores.pscores).appendTo("ul#list_personal");

	// 順位画像付加
	$("<img src='/images/rank1.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_personal > li:not(.divider):first"));
	$("<img src='/images/rank2.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_personal > li:not(.divider):eq(1)"));
	$("<img src='/images/rank3.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_personal > li:not(.divider):eq(2)"));

	// リストのリフレッシュ	
	$("ul#list_personal").listview("refresh");
}

/******************************************************************
 * 【関数】 スコア反映 -> チーム順位
 ******************************************************************/
function reflectTeamRank(teamscores) {
	if (teamscores == null) {
		return;
	}
	
	// 全データ削除
	$("ul#list_team > li:not(.divider)").remove();

	// グロス or ネットの値を指定
	if (curScoreMode == "gross") {
		for (var i = 0; i < teamscores.length; i++) {
			teamscores[i].count = teamscores[i].gross
		}
	} else {
		for (var i = 0; i < teamscores.length; i++) {
			teamscores[i].count = teamscores[i].net
		}
	}

	// ソート
    teamscores.sort(function(a, b) {
        return (parseInt(a.count) > parseInt(b.count) ? 1 : -1);
    });

	// データ反映
	$("#listitem_team").tmpl(teamscores).appendTo("ul#list_team");

	// 順位画像付加
	$("<img src='/images/rank1.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_team > li:not(.divider):first"));
	$("<img src='/images/rank2.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_team > li:not(.divider):eq(1)"));
	$("<img src='/images/rank3.jpg' class='ui-li-icon'></img>").appendTo($("ul#list_team > li:not(.divider):eq(2)"));

	// データ反映（チーム内個人）
	for (var i = 0; i < teamscores.length; i++) {
		$("#listitem_personal_in_team").tmpl(teamscores[i].userscores).appendTo("ul#list_team > li:not(.divider):eq(" + i + ") > ul");
	}

	// リストのリフレッシュ	
	// 何故か呼ぶとエラーになる
	// annot call methods on listview prior to initialization; attempted to call method 'refresh'
	// see: http://d.hatena.ne.jp/t-horikiri/20120206/1328503072
	$("ul#list_team").listview("refresh");
}

/******************************************************************
 * 【関数】 チームの検索
 ******************************************************************/
function searchTeamData(teamscores, tid) {
	for(i = 0; i < teamscores.length; i++) {
		if (teamscores[i].tid == tid) {
			return teamscores[i];
		}
	}
	return null;
}

/******************************************************************
 * 【関数】 相対グロス（パーに対してのプラマイ）の計算
 ******************************************************************/
function calcRelativeGross(holes) {
	var relScore = 0;
	for (var i = 0; i < holes.length; i++) {
		relScore += (holes[i] - parData[i]);
	}
	return convPlusNumStr(relScore);
}

/******************************************************************
 * 【関数】 相対ネット（パーに対してのプラマイ）の計算
 ******************************************************************/
function calcRelativeNet(holes, hc) {
	var relScore = 0;
	for (var i = 0; i < holes.length; i++) {
		relScore += (holes[i] - parData[i]);
	}
	return convPlusNumStr(relScore - hc);
}

/******************************************************************
 * 【関数】 補足情報の作成（グロス）
 ******************************************************************/
function createCommentGross(holes) {
	return "[Hole:" + holes.length + "]";
}

/******************************************************************
 * 【関数】 補足情報の作成（ネット）
 ******************************************************************/
function createCommentNet(holes, hc) {
	return "[Hole:" + holes.length + " HC:" + hc + "]";
}

/******************************************************************
 * 【関数】 スコア反映 -> 個人（ホール毎）
 ******************************************************************/
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
		$("p.par", target).text("par " + parData[i]);
	}
	$("li#totalscore > span.relscore").text(convPlusNumStr(totalScore));
	$("li#outscore > span.relscore").text(convPlusNumStr(totalScoreOut));
	$("li#inscore > span.relscore").text(convPlusNumStr(totalScoreIn));
}

/******************************************************************
 * 【関数】 1以上の場合、"+" を付与
 ******************************************************************/
function convPlusNumStr(src) {
	if (src > 0) {
		return "+" + src;
	} else {
		return src;
	}
}
