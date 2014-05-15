<!--
	/******************************************************************
	 * セッションストレージ設定
	 ******************************************************************/
	var storage = localStorage;
	var isAnimation = false;


	/******************************************************************
	 * 定数
	 ******************************************************************/
	var kHandicap  = "compe.handicap";
	var kHandyHole = "compe.handiHole";
	var kRId       = "compe.rid";
	var kRName     = "compe.rname";
	var kCName     = "compe.cname";
	var kCHoleInfs = "compe.holeinfs";
	var kPlayers   = "compe.players";
	var kScores    = "compe.scores";
	var kTeams     = "compe.teams";
	var kHandiMax  = "compe.handiMax";

	var ns = ["leadersboard","live"];
	var ev = ["connect","uploadscore","getroundinf","score","personalscore","comment"];


	/******************************************************************
	 * 共通変数
	 ******************************************************************/
	var lb;
	var live;
	var roundData = null;
	var clsAnimete = null;
	var clsAnimete2 = null;
	var scoreData;
	var hHandys = null;
	var hPars = [];


	/******************************************************************
	 * ソート定義
	 ******************************************************************/
	var sort_ary = function( field, reverse, primer, subfield ){
	   reverse = (reverse) ? -1 : 1;
	   return function( a, b){
	       var a1 = a[field];
	       var b1 = b[field];
	       if (typeof(primer) != 'undefined'){
	           a1 = primer(a1);
	           b1 = primer(b1);
	       }
	       if (a1 < b1) return reverse * -1;
	       if (a1 > b1) return reverse * 1;

           var a2 = a[subfield];
           var b2 = b[subfield];
	       if (typeof(primer) != 'undefined'){
	           a2 = primer(a2);
	           b2 = primer(b2);
	       }

	       if (a2 < b2) return reverse * 1;
	       if (a2 > b2) return reverse * -1;
	       return 0;
	   }
	}


/*
	var sort_json = function( field, reverse, primer ){
	   reverse = (reverse) ? -1 : 1;
	   return function( a, b){
	       a = JSON.parse(a)[field];
	       b = JSON.parse(b)[field];
	       if (typeof(primer) != 'undefined'){
	           a = primer(a);
	           b = primer(b);
	       }
	       if (a < b) return reverse * -1;
	       if (a > b) return reverse * 1;
	       return 0;
	   }
	}
*/


	/******************************************************************
	 * 初期設定
	 ******************************************************************/
	function initializeCommon()
	{
		// 杯名称を設定する
		document.getElementById('captitle').innerHTML  = storage.getItem(kRName);
	}


	/******************************************************************
	 * ストレージ初期化処理
	 ******************************************************************/
	function initAll(pageuri)
	{
		// 初期化
		storage.removeItem(kRName);
		storage.removeItem(kRId);
		storage.removeItem(kCName);
		storage.removeItem(kCHoleInfs);
		storage.removeItem(kHandicap);
		storage.removeItem(kPlayers);
		storage.removeItem(kScores);
		storage.removeItem(kTeams);
		storage.removeItem(kHandyHole);
		storage.removeItem(kHandiMax);

		// 移行
		storage.setItem(kRName,     storage.getItem("_" + kRName));
		storage.setItem(kRId,       storage.getItem("_" + kRId));
		storage.setItem(kCName,     storage.getItem("_" + kCName));
		storage.setItem(kCHoleInfs, storage.getItem("_" + kCHoleInfs));
		storage.setItem(kHandicap,  storage.getItem("_" + kHandicap));
		storage.setItem(kPlayers,   storage.getItem("_" + kPlayers));
		storage.setItem(kScores, storage.getItem("_" + kScores));
		storage.setItem(kTeams, storage.getItem("_" + kTeams));
		storage.setItem(kHandiMax, storage.getItem("_" + kHandiMax));

		// 初期化2
		initNext();

    if (pageuri) {
      window.location = "_blank";
      window.location = pageuri;
    }
	}


	/******************************************************************
	 * ストレージの初期化
	 ******************************************************************/
	function initNext()
	{
		storage.removeItem("_" + kRName);
		storage.removeItem("_" + kRId);
		storage.removeItem("_" + kCName);
		storage.removeItem("_" + kCHoleInfs);
		storage.removeItem("_" + kHandicap);
		storage.removeItem("_" + kPlayers);
		storage.removeItem("_" + kScores);
		storage.removeItem("_" + kTeams);
		storage.removeItem("_" + kHandiMax);
	}

	/******************************************************************
	 * ストレージの初期化
	 ******************************************************************/
	function clearData()
	{
		storage.clear();
	}


	/******************************************************************
	 * コース情報取得処理（初回接続時）
	 ******************************************************************/
	function connectTop()
	{
        // leadersboard接続
		io.transports.push('websocket');
		io.transports.push('xhr-polling'); 
		io.transports.push('jsonp-polling');
		io.transports.push('flashsocket');
		io.transports.push('htmlfile');
		lb = io.connect("http://wakuwaku.c.node-ninja.com:3000/leadersboard", {
//		lb = io.connect("http://localhost:3000/leadersboard", {
			'try multiple transports': true, 
			'force new connection': true 
		});
		console.log("leadersboard attempt connect...");

		// 接続成功
		lb.on(ev[0], function() {
			console.log("connect success...");

			// ラウンド情報取得
			lb.on(ev[2], function(round) {
				console.log("getroundinf access...");
				getRoundData(round);
				getPlayerData(round);

				if (storage.getItem("_" + kRId) != null
					&& storage.getItem("_" + kRId) != ""
					&& storage.getItem("_" + kRId) != "undefined")
				{

					// スコア要求
					requestPersonalScore(lb, storage.getItem("_" + kRId), 2);

					lb.on(ev[4], function(score) {
						getScoreData(score);
						setTeamScoreData();
					});
				}
			});
		});

		// 接続失敗
	    lb.on('connect_failed', function(data){
			console.log("leadersboard connection faled " + data);
			alert("Connection Error!" + data);
			return;
	    });

		// ラウンド情報要求
		requestRoundInfo(lb);
	}


	/******************************************************************
	 * ラウンド情報要求（初回接続時　サーバへの送信）
	 ******************************************************************/
	function requestRoundInfo( lb ) {
		lb.emit(ev[2], {});
		console.log("send request RoundInfo");
	}


	/******************************************************************
	 * スコア要求（初回接続時　サーバへの送信）
	 ******************************************************************/
	function requestPersonalScore( lb, rid, type ) {
		lb.emit(ev[4], { "rid": rid, "type": type });
		console.log("send requestPersonalScore type:" + type);
	}


	/******************************************************************
	 * ラウンド情報の取得（初回接続時）
	 ******************************************************************/
	function getRoundData( roundData ) {
		// ラウンドID
		storage.setItem("_" + kRId, roundData[0].rid);

		// ラウンド名
		storage.setItem("_" + kRName, roundData[0].rname);

		// ハンディキャップ方式
		storage.setItem("_" + kHandicap, JSON.stringify(roundData[0].handicapinf));

		// コース名
		storage.setItem("_" + kCName, roundData[0].cinf.cname);

		// コース情報
		var arraySubCourses = [];
		for (var i = 0; i < roundData[0].cinf.holeinfs.length; i++)
		{
			arraySubCourses[i] = roundData[0].cinf.holeinfs[i];
		}
		storage.setItem("_" + kCHoleInfs, JSON.stringify(arraySubCourses));

		// ハンデ選択数
		var h = 6;
/*		if (JSON.parse(storage.getItem(kHandicap)).method == 1) {
			h = 4;
		} else if (JSON.parse(storage.getItem(kHandicap)).method == 2) {
			h = 6;
		} else if (JSON.parse(storage.getItem(kHandicap)).method == 3) {
			h = 8;
		}
*/
		storage.setItem("_" + kHandiMax, h * JSON.parse(storage.getItem("_" + kCHoleInfs)).length);

	}


	/******************************************************************
	 * プレイヤー情報/チーム情報の取得（初回接続時）
	 ******************************************************************/
	function getPlayerData( roundData ) {
		var arrayPlayers = [];
		var arrayTeams = [];
		var k = 0;
		var l = 0;

		var plobj = new Array();
		for (var i = 0; i < roundData[0].prtyinfs.length; i++)
		{
			for (var j = 0; j < roundData[0].prtyinfs[i].plyrifs.length; j++)
			{
				// プレイヤー情報
				plobj[k] = roundData[0].prtyinfs[i].plyrifs[j];

				// プレイヤーキー一覧
				arrayPlayers[k] = roundData[0].prtyinfs[i].plyrifs[j].plid;
				k++;
				
				// チームキー一覧
				if (arrayTeams.indexOf(roundData[0].prtyinfs[i].plyrifs[j].tid) == -1)
				{
					arrayTeams[l] = roundData[0].prtyinfs[i].plyrifs[j].tid;
					l++;
				}
			}
		}

		storage.setItem("_" + kPlayers, JSON.stringify(plobj));
	}


	/******************************************************************
	 * スコア情報取得処理（初回接続時）
	 ******************************************************************/
	function getScoreData( scoreData )
	{
		// 各プレイヤースコア
		for (var i = 0; i < scoreData.pscores.length; i++)
		{
			storage.setItem("_" + scoreData.pscores[i].plid + ".scr", JSON.stringify(scoreData.pscores[i].score));
		}
	}


	/******************************************************************
	 * スコア情報取得処理（初回接続時）
	 ******************************************************************/
	function setTeamScoreData()
	{
		var dataPlayerScores = new Array();
		var dataTeamScores = new Array();

		// 各プレイヤー情報から値を加算していく
		var plObj = JSON.parse(storage.getItem("_" + kPlayers));
		for (var i = 0; i < plObj.length; i++)
		{
			var tid = plObj[i].tid;
			var tname = plObj[i].team.tname;
			var scr = JSON.parse(storage.getItem("_" + plObj[i].plid + ".scr"));
			if (scr == null) continue;

			var plScr = new dataPlayerScore()
			plScr.dataId = plObj[i].plid;
			plScr.name = plObj[i].user.uname;
			plScr.hole_score = scr.holes;
			plScr.score_gross = scr.gross;
			plScr.score_net = scr.gross;
			plScr.teamId = tid;
			plScr.age = getCulculateAge(plObj[i].user.brthdy);
			dataPlayerScores.push(plScr);

			// 成績表示用のチーム情報に加算する
			var flg = false;
			var cnt = dataTeamScores.length;
			for (var j = 0; j < cnt; j++)
			{
				if (dataTeamScores[j].dataId == tid)
				{
					// 既にチームが登録されている
					dataTeamScores[j].score_gross += scr.gross;
					dataTeamScores[j].count += 1;
					// 年齢の加算
					dataTeamScores[j].age += getCulculateAge(plObj[i].user.brthdy);
					flg = true;
					break;
				}
			}

			// チームが未登録
			if (!flg)
			{
				dataTeamScores[cnt] = new dataTeamScore();
				dataTeamScores[cnt].dataId = tid;
				dataTeamScores[cnt].name = tname;
				dataTeamScores[cnt].score_gross = scr.gross;
				dataTeamScores[cnt].count = 1;
				dataTeamScores[cnt].age = getCulculateAge(plObj[i].user.brthdy);
			}

			// 不要になったstorageを削除
			storage.removeItem("_" + plObj[i].plid + ".scr");
		}

		// 全プレイヤーの集計が終わったので、スコアを人数割りする
		for (var i = 0; i < dataTeamScores.length; i++)
		{
			dataTeamScores[i].score_gross = Math.round(dataTeamScores[i].score_gross * 10 / dataTeamScores[i].count) / 10;
			dataTeamScores[i].score_net = Math.round(dataTeamScores[i].score_gross * 10) /10;
			dataTeamScores[i].age = Math.round(dataTeamScores[i].age / dataTeamScores[i].count);
		}

		storage.setItem("_" + kScores, JSON.stringify(dataPlayerScores));
		storage.setItem("_" + kTeams, JSON.stringify(dataTeamScores));
	}


	/******************************************************************
	 * チーム成績表：初期反映
	 *   チーム成績表のDOMContentLoadedで呼び出される
	 ******************************************************************/
	function initializePerformance()
	{
		if( clsAnimete == null ) {
			clsAnimete = new wk2AnimetionClass;
		}

		// 初期化共通処理呼出し
		initializeCommon();

		var countHandy = 0;

		// ハンデ抽選状況の更新
		if (document.getElementById('drawHole') !=  null)
		{
			countHandy = countSelectHandy();
			document.getElementById('drawHole').innerHTML  = countHandy + " / " + storage.getItem(kHandiMax);
		}

		// チームデータを作成する
		var teamData;
		var isUpdate = false;
		var animeType = "none";

		teamData = sortDisplayData(kTeams, "score_net", "age");
		clsAnimete.setSrcScore( teamData );

		// TODO
/*
		if (storage.getItem(kHandyHole + "0") != null)
		{
			teamData = culcHandy();
			clsAnimete.setDstScore( teamData );
			isUpdate = true;
			// TODO ハンデホール決定数
			animeType = "update";
		}
*/

		// データをアニメーションクラスに設定し、初期表示を行う
		clsAnimete.CreateObjects();
		clsAnimete.restoreData( true );  // アニメーションあり
//		if (isUpdate)
//		{
//			clsAnimete.updaeData(animeType);
//		}
	}


	/******************************************************************
	 * 個人成績表：初期反映
	 ******************************************************************/
	function initializePerformancePersonal()
	{
		if( clsAnimete2 == null ) {
			clsAnimete2 = new wk2AnimetionClass("parsonal");
		}
		// 初期化共通
		initializeCommon();

		if (document.getElementById('drawHole') !=  null)
		{
			document.getElementById('drawHole').innerHTML  = countSelectHandy() + " / " + storage.getItem(kHandiMax);
		}

		// データ反映
		var dataPlayerScore = sortDisplayData(kScores, "score_net", "age");

		// データをアニメーションクラスに設定し、初期表示を行う
		clsAnimete2.setSrcScore( dataPlayerScore );
		clsAnimete2.CreateObjects();
//		clsAnimete2.restoreData( true );  // アニメーションあり
		clsAnimete2.restoreData( false );  // アニメーションなし
	}


	/******************************************************************
	 * チームオブジェクトを初期化する
	 ******************************************************************/
	function initializeObjects( divname, keyname )
	{
		var obj = document.querySelectorAll( divname );

		// ノードを複製
		//   読み込み済みのデータ数分ノードを複製
		//   チームIDをオブジェクトIDとして設定
		var array = storage.getItem(keyname).split(",");

		for (var i = 0; i < array.length; i++) {
			if( i == 0 ) {
				// 先頭を雛型ノードとする
				obj[0].setAttribute( "id", array[i] );
			} else {
				// 雛型ノードを複製する
				var copy = obj[0].cloneNode(true);
				copy.setAttribute( "id", array[i] );
				obj[0].parentNode.appendChild(copy);
			}
		}
	}


	/******************************************************************
	 * チームデータを作成する
	 ******************************************************************/
	function sortDisplayData( dataname, keyname, subkeyname )
	{
		var obj;
		var scores = JSON.parse(storage.getItem(dataname));

		// netスコア順にソート
		var array = new Array();
		for (var i = 0;i < scores.length; i++) {
			array.push(scores[i]);
		}

		array.sort(sort_ary(keyname, false, parseFloat, subkeyname));

		for (var i = 0; i < array.length; i++)
		{
			array[i].ranking = i + 1;
		}
		return array;

	}


	/******************************************************************
	 * ハンディキャップ計算
	 ******************************************************************/
	function culcHandy()
	{
		// ハンデホールのパー数取得
		var arrays = getHandiPars();

		// 各人のハンデ計算
		var dataPlayerScores = culcHandyPerson(arrays);

		// 各グループの集計（＆人数で割る）
		return culcHandyTeams(dataPlayerScores);
	}


	/******************************************************************
	 * ハンデホールのパー数を取得
	 ******************************************************************/
	function getHandiPars()
	{
		var handiPars = new Array();
		var pars = new Object();

		var handyArray = JSON.parse(storage.getItem(kHandyHole));
		var holeArray = JSON.parse(storage.getItem(kCHoleInfs));

		// サブごとのオブジェクト配列
		for (var ix in handyArray)
		{
			var h = handyArray[ix];
			if (h == null || h.pars.length < 9)	continue;

			for (var hix in holeArray)
			{
				pars = holeArray[hix];
				if (h.csubid != pars.csubid) continue;

				var arrays = new Array();
				for (var k = 0; k < h.pars.length; k++)
				{
					if (h.pars[k] == "") {
						arrays[k] = 0;
					} else {
						arrays[k] = pars.pars[k];
					}
				}
				var obj = new Object();
				obj.csubid = h.csubid;
				obj.hole_score = arrays;
				handiPars.push(obj);
				break;
			}
		}
		return handiPars;
	}

/*

		hHandys = storage.getItem(kHandyHole).split(",");
		var holes = storage.getItem(kCHoleInfs).split(",");
		for (var i = 0; i < hHandys.length; i++)
		{
			var h = JSON.parse(hHandys[i]);
			if (h == null || h.pars.length < 9)	continue;

			for (var j = 0; j < holes.length; j++)
			{
				pars = JSON.parse(holes[j]);
				if (h.csubid != pars.csubid) continue;

				for (var k = 0; k < h.pars.length; k++)
				{
					if (h.pars[k] == "") {
						arrays[k] = 0;
					} else {
						arrays[k] = pars.pars[k];
					}
				}
				var obj = new Object();
				obj.csubid = h.csubid;
				obj.hole_score = arrays;
				handiPars.push(obj);
			}
		}
		return handiPars;

	function getHandyPars()
	{
		var arrays = new Array();

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			if (storage.getItem(kHandyHole + i) == null)
			{
				return [];
			}

			// TODO サブごとのオブジェクト配列に！
			hHandys = storage.getItem(kHandyHole + i).split(",");

			var h = JSON.parse(storage.getItem(kCHoleInfs + i));
			if (h == null || h.pars.length < 9)	return;
			hPars = h.pars;

			// ハンデホールのパー数を取得し、配列に格納する
			// TODO 不要？

			for (var j = 0; j < hHandys.length; j++)
			{
				// TODO hPars1 → hPars2 の順であることを信頼
				if (hHandys[j] == "")
				{
					arrays[j + i * 9] = 0;
				} else {
					arrays[j + i * 9] = h.pars[j];
				}
			}
		}
		return arrays;
	}
*/


	/******************************************************************
	 * 各人のハンディキャップ計算
	 *   arrays : ハンデホールのパー値（ハンデホール以外はゼロ）
	 ******************************************************************/
	function culcHandyPerson( arrays )
	{

		var plObj = JSON.parse(storage.getItem(kScores));
		var dataPlayerScores = new Array();
		var k = 0;
		var handiScoreMax = JSON.parse(storage.getItem(kHandicap)).upperLimit;

		for (var i = 0; i < plObj.length; i++)
		{
			var net = 0;
			for (var x = 0; x < arrays.length; x++)
			{
				for (var j = 0; j < plObj[i].hole_score.length; j++)
				{
					if (plObj[i].hole_score[j].csubid != arrays[x].csubid) {
						continue;
					}

					for (var k = 0; k < arrays[x].hole_score.length; k++)
					{
						if (arrays[x].hole_score[k] != 0) {
							// TODO マイナスハンデがないなら、コメントをはずす
							//if (plObj[i].score.hole[j].scores[k] > arrays[x].hole_score[k])
							net += plObj[i].hole_score[j].scores[k] - arrays[x].hole_score[k];
						}
					}
					break;
				}
			}
			net = net * 1.2;
			if (net > handiScoreMax) net = handiScoreMax;
			plObj[i].score_net = plObj[i].score_gross - net;
		}

/*		for (var i = 0; i < plObj.length; i++)
		{
			var net = 0;
			for (var j = 0; j < plObj[i].hole_score.length; j++)
			{
				var holes = JSON.parse(plObj[i].hole_score[j]);

				// TODO 18この同一連番Holeであることを信頼
				if (arrays.length > j && arrays[j] != 0) {
					// TODO マイナスハンデがないなら、コメントをはずす
					//if (plObj[i].hole_score[j] > arrays[j])
					net += plObj[i].hole_score[j] - arrays[j];
				}
			}
			net = net * 1.2;
			if (net > handiScoreMax) net = handiScoreMax;
			plObj[i].score_net = plObj[i].score_gross - net;
		}
*/

		// ソートし、順位付け
		plObj.sort(sort_ary("score_net", false, parseFloat, "age"));

		for (var i = 0; i < plObj.length; i++)
		{
			plObj[i].ranking = i + 1;
			plObj[i].score_net = Math.round(plObj[i].score_net * 10) /10;
		}

		storage.setItem(kScores, JSON.stringify(plObj));
		return plObj;
	}


	/******************************************************************
	 * 各チームのハンディキャップ計算
	 ******************************************************************/
	function culcHandyTeams( plObj )
	{
		// チーム情報の score_net を初期化
		var teams = JSON.parse(storage.getItem(kTeams));
		for (var i = 0; i < teams.length; i++)
		{
			teams[i].score_net = 0;
		}

		// チーム情報の score_net にプレイヤーの score_netを加算していく
		for (var i = 0; i < plObj.length; i++)
		{
			for (var j = 0; j < teams.length; j++)
			{
				if (teams[j].dataId == plObj[i].teamId)
				{
					teams[j].score_net += plObj[i].score_net;
					break;
				}
			}
		}

		// ソートし、順位付け
		teams.sort(sort_ary("score_net", false, parseFloat, "age"));
		for (var i = 0; i < teams.length; i++)
		{
			teams[i].ranking = i + 1;
			teams[i].score_net = Math.round(teams[i].score_net / teams[i].count * 10) / 10;
		}

		// 保存（更新）
		storage.setItem(kTeams, JSON.stringify(teams));
		return teams;
	}


	/******************************************************************
	 * ハンデ選択したホールを記憶する
	 *  TODO:抽選結果により選択できなくなったホールにも情報をセットすること
	 ******************************************************************/
	function setHandy(holeNumbers)
	{
		var handis = holeNumbers;
		var arrayHandyHole = getHandyData();
		var array = new Array();

		for (var i = 0; i < arrayHandyHole.length; i++)
		{
			for (var j = 0; j < handis.length; j++)
			{
				if (arrayHandyHole[i].csubid != holeNumbers[j].csubid) continue;

				var wkArray = new Array();
				for (var k = 0; k < 9; k++)
				{
					wkArray[k] = arrayHandyHole[i].pars[k];
				}
/*
				var wkHole = handis[j].pars;
				for (var l = 0; l < wkHole.length; l++)
				{
					if (wkHole[l] >= 0 && wkHole[l] <= 9 )
					{
						wkArray[wkHole - 1] = "○";
					}
				}
*/
				for (var l = 0; l < handis[j].selected.length; l++) 
				{
					wkArray[handis[j].selected[l] - 1] = "○";
				}	

				var a = new Object();
				a.csubid = arrayHandyHole[i].csubid;
				a.csubname = arrayHandyHole[i].csubname;
				a.name = arrayHandyHole[i].names;
				a.pars = wkArray;
				array.push(a);
				break;
			}
		}
		storage.setItem(kHandyHole, JSON.stringify(array));

/*		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			var wkArray = new Array();
			for (var k = 0; k < 9; k++)
			{
				wkArray[k] = arrayHandyHole[k+i*9];
			}

			for (var j = 0; j < handys.length; j++)
			{
				var wkHole = handys[j] - (i*9);
				if (wkHole >= 0 && wkHole <= 9 )
				{
					wkArray[wkHole - 1] = "○";
				}
			}
			storage.setItem(kHandyHole + i, wkArray);
		}
*/
	}


	/******************************************************************
	 * 抽選済みのホール数をカウント
	 ******************************************************************/
	function countSelectHandy()
	{
		var count = 0;

		var arrayHoles = getHandyData();
		for (var ix in  arrayHoles)
		{
			var holes = arrayHoles[ix];
			if (holes == null) continue;

			for (var j = 0; j < holes.pars.length; j++)
			{
				if (holes.pars[j] != "")
				{
					count++;
				}
			}
		}

		return count;

/*		var arrayHoleInfs = storage.getItem(kCHoleInfs).split(",");
		for (var i = 0; i < arrayHoleInfs.length; i++)
		{
			var holes = JSON.parse(arrayHoleInfs[i]);
			if (holes == null) continue;

			for (var j = 0; j < holes.pars.length; j++)
			{
				if (holes.pars[j] != "" && holes.pars[j] != 0)
				{
					count++;
				}
			}
		}

		return count;
*/
	}


	/******************************************************************
	 * パーデータ配列を通知する
	 ******************************************************************/
	function getParData()
	{
		var parArray = new Array();
		var arrayHoleInfs = JSON.parse(storage.getItem(kCHoleInfs));

		for (var i in arrayHoleInfs)
		{
			var js_h = new Object();
			js_h.pars = arrayHoleInfs[i].pars;
			js_h.csubid = arrayHoleInfs[i].csubid;
			parArray = parArray.concat(js_h);
		}
		return parArray;

/*
		var parArray = new Array();

		//hHandys = ["","","","","","","","",""];

		var arrayHoleInfs = storage.getItem(kCHoleInfs).split(",");
		for (var i = 0; i < arrayHoleInfs.length; i++)
		{
			var js_h = new Object();
			js_h.pars = JSON.parse(arrayHoleInfs[i]).pars;
			js_h.csubid = JSON.parse(arrayHoleInfs[i]).csubid;
			parArray = parArray.concat(js_h);

			//if (storage.getItem(kHandyHole + i) != null)
			//{
			//	hHandys = storage.getItem(kHandyHole + i).split(",");
			//}
		}
		return parArray;
*/
	}


	/******************************************************************
	 * ハンデ選択されたホールを取得する
	 ******************************************************************/
	function getHandyData()
	{
		var arrayHandiHole = [];
		var defaultValue = ["","","","","","","","",""];
		var hData = JSON.parse(storage.getItem(kHandyHole));
		
		var arrayHoleInfs = JSON.parse(storage.getItem(kCHoleInfs));
		for (var i = 0; i < arrayHoleInfs.length; i++)
		{
			var wkData = new Object();
			wkData.csubid = arrayHoleInfs[i].csubid;
			wkData.csubname = arrayHoleInfs[i].csubname;
			wkData.names = arrayHoleInfs[i].names;
			if (hData == null || hData == undefined || hData.length <= i) {
				wkData.pars = defaultValue;
			} else if( hData[i] == null || hData[i] == undefined || hData[i].csubid != arrayHoleInfs[i].csubid) {
				wkData.pars = defaultValue;
			} else {
				wkData.pars = hData[i].pars;
			}
			arrayHandiHole.push( wkData );
		}

		return arrayHandiHole;

/*		var arrayHandyHole = new Array();
		var arrayDefaultValue = ["","","","","","","","",""];
		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			var wkData = new Array();
			wkData = storage.getItem(kHandyHole + i);
			if( wkData == null || wkData == undefined) {
				wkData = arrayDefaultValue;
			} else {
				wkData = wkData.split(",");
			}
			arrayHandyHole = arrayHandyHole.concat( wkData );
		}
		return arrayHandyHole;
*/
	}


	/******************************************************************
	 * チーム成績表：更新  @iwa
	 *   ルーレットを閉じた後に呼び出される
	 ******************************************************************/
	function updatePerformance()
	{
		var countHandy = 0;
		var handiMax = storage.getItem(kHandiMax);

		// ハンデ抽選状況の更新
		if (document.getElementById('drawHole') !=  null)
		{
			countHandy = countSelectHandy();
			document.getElementById('drawHole').innerHTML  = countHandy + " / " + handiMax;
		}

		// チームデータを作成してソートする
		var teamData;
		teamData = culcHandy();
		teamData = sortDisplayData(kTeams, "score_net", "age");

		// データを設定して表示を更新
		clsAnimete.setDstScore( teamData );
		animeType = countHandy == handiMax ? "finale" : "update";
		clsAnimete.updaeData(animeType);
	}


	/******************************************************************
	 * 年齢（経過日数）取得
	 *   yyyy-MM-ddThh:mm:ss.sssZから現在年齢（経過日数）を求める
	 ******************************************************************/
	function getCulculateAge(birthday)
	{
		// yyyy-MM-ddのみ取得
		var birth = birthday.substr(0,10).split('-');
		var _birth = new Date(parseInt(birth[0]), parseInt(birth[1]-1),  parseInt(birth[2]));
		var today = new Date();

		return (Math.floor( (today.getTime() - _birth.getTime()) / (1000 * 60 * 60 * 24)) + 1);
	}

	function getArrayHoleInfs() 
	{
		return JSON.parse(storage.getItem(kCHoleInfs));
	}

	/******************************************************************
	 * 変換
   *  src["3","5","o",....] を "o" の部分だけの 番号（左記なら3）の
   * 配列に変換する
	 ******************************************************************/
	function convertFromO(src)
	{
		var dst = [];
		for (var i = 0; i < src.length; i++) {
			if (src[i] == "○") {
				dst.push(i+1);
			}
		}
		return dst;
	}

	/******************************************************************
	 * 上の反対
	 ******************************************************************/
	function convertToO(src, dst)
	{
		var dst2 = dst;
		for (var i = 0; i < src.length; i++) {
			dst2[src[i]] = "○";
		}
		return dst2;
	}



// -->
