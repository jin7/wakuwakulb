<!--
	/******************************************************************
	 * セッションストレージ設定
	 ******************************************************************/
	var storage = localStorage;
	var isAnimation = false;


	/******************************************************************
	 * 定数
	 ******************************************************************/
	var handyMax = 12;
	var handyScoreMax = 40;
	var kHandyHole = "compe.handyHole";
	var kRId       = "compe.rid";
	var kRName     = "compe.rname";
	var kCName     = "compe.cname";
	var kCHoleInfs = "compe.holeinfs";
	var kSubCArray = "compe.subcourseKey";
	var kPlayers   = "compe.players";
	var kScores    = "compe.scores";
	var kTeams     = "compe.teams";

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
	var sort_ary = function( field, reverse, primer ){
	   reverse = (reverse) ? -1 : 1;
	   return function( a, b){
	       a = a[field];
	       b = b[field];
	       if (typeof(primer) != 'undefined'){
	           a = primer(a);
	           b = primer(b);
	       }
	       if (a < b) return reverse * -1;
	       if (a > b) return reverse * 1;
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
	function initAll()
	{
		// 初期化
		
		for (var i = 0; storage.getItem(kSubCArray) != null && i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			storage.removeItem(kCHoleInfs + i);
			storage.removeItem(kHandyHole + i);
		}
		storage.removeItem(kRName);
		storage.removeItem(kRId);
		storage.removeItem(kCName);
		storage.removeItem(kSubCArray);
		storage.removeItem(kPlayers);
		storage.removeItem(kScores);
		storage.removeItem(kTeams);

		// 移行
		storage.setItem(kRName,     storage.getItem("_" + kRName));
		storage.setItem(kRId,       storage.getItem("_" + kRId));
		storage.setItem(kCName,     storage.getItem("_" + kCName));
		storage.setItem(kSubCArray, storage.getItem("_" + kSubCArray));

		for (var i = 0; storage.getItem(kSubCArray) != null && i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			storage.setItem(kCHoleInfs + i, storage.getItem("_" + kCHoleInfs + i));
		}

		storage.setItem(kPlayers,   storage.getItem("_" + kPlayers));
		storage.setItem(kScores, storage.getItem("_" + kScores));
		storage.setItem(kTeams, storage.getItem("_" + kTeams));

		// 初期化2
		initNext();
	}


	/******************************************************************
	 * ストレージの初期化
	 ******************************************************************/
	function initNext()
	{
		for (var i = 0; storage.getItem("_" + kSubCArray) != null && i < storage.getItem("_" + kSubCArray).split(",").length; i++)
		{
			storage.removeItem("_" + kCHoleInfs + i);
			storage.removeItem("_" + kHandyHole + i);
		}
		storage.removeItem("_" + kRName);
		storage.removeItem("_" + kRId);
		storage.removeItem("_" + kCName);
		storage.removeItem("_" + kSubCArray);
		storage.removeItem("_" + kPlayers);
		storage.removeItem("_" + kScores);
		storage.removeItem("_" + kTeams);
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
		io.transports.push('xhr-polling'); 
		io.transports.push('jsonp-polling');
		io.transports.push('flashsocket');
//		lb = io.connect("http://wakuwaku.c.node-ninja.com:3000/leadersboard", {
		lb = io.connect("http://localhost:3000/leadersboard", {
			'try multiple transports': false, 
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

		// コース名
		storage.setItem("_" + kCName, roundData[0].cinf.cname);

		// コース情報
		var arraySubCourses = [];
		for (var i = 0; i < roundData[0].cinf.holeinfs.length; i++)
		{
			storage.setItem("_" + kCHoleInfs + i, JSON.stringify(roundData[0].cinf.holeinfs[i]));
			arraySubCourses[i] = roundData[0].cinf.holeinfs[i].csubid;
		}
		storage.setItem("_" + kSubCArray, arraySubCourses);
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
			plScr.playerId = plObj[i].plid;
			plScr.playername = plObj[i].user.uname;
			plScr.hole_score = scr.holes;
			plScr.score_gross = scr.gross;
			plScr.score_net = scr.gross;
			plScr.teamId = tid;
			dataPlayerScores.push(plScr);

			// 成績表示用のチーム情報に加算する
			var flg = false;
			var cnt = dataTeamScores.length;
			for (var j = 0; j < cnt; j++)
			{
				if (dataTeamScores[j].teamId == tid)
				{
					// 既にチームが登録されている
					dataTeamScores[j].score_gross += scr.gross;
					dataTeamScores[j].count += 1;
					flg = true;
					break;
				}
			}

			// チームが未登録
			if (!flg)
			{
				dataTeamScores[cnt] = new dataTeamScore();
				dataTeamScores[cnt].teamId = tid;
				dataTeamScores[cnt].teamname = tname;
				dataTeamScores[cnt].score_gross = scr.gross;
				dataTeamScores[cnt].count = 1;
			}

			// 不要になったstorageを削除
			storage.removeItem("_" + plObj[i].plid + ".scr");
		}

		// 全プレイヤーの集計が終わったので、スコアを人数割りする
		for (var i = 0; i < dataTeamScores.length; i++)
		{
			dataTeamScores[i].score_gross = Math.round(dataTeamScores[i].score_gross * 10 / dataTeamScores[i].count) / 10;
			dataTeamScores[i].score_net = Math.round(dataTeamScores[i].score_gross * 10) /10;
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
			clsAnimete = new wk2TeamAnimetionClass;
		}

		// 初期化共通処理呼出し
		initializeCommon();

		var countHandy = 0;

		// ハンデ抽選状況の更新
		if (document.getElementById('drawHole') !=  null)
		{
			countHandy = countSelectHandy();
			document.getElementById('drawHole').innerHTML  = countHandy + " / " + handyMax;
		}

		// チームデータを作成する
		var teamData;
		var isUpdate = false;
		var animeType = "none";

		teamData = sortDisplayData(kTeams, "score_net");
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
		clsAnimete.CreateTeamObjects();
		clsAnimete.restoreData( false );  // アニメーションあり
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
			clsAnimete2 = new wk2PersonalAnimetionClass;
		}
		// 初期化共通
		initializeCommon();

		if (document.getElementById('drawHole') !=  null)
		{
			document.getElementById('drawHole').innerHTML  = countSelectHandy() + " / " + handyMax;
		}

		// データ反映
		var dataPlayerScore = sortDisplayData(kScores, "score_net");

		// データをアニメーションクラスに設定し、初期表示を行う
		clsAnimete2.setSrcScore( dataPlayerScore );
		clsAnimete2.CreateTeamObjects();
		clsAnimete2.restoreData( false );  // アニメーションあり
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
	function sortDisplayData( dataname, keyname )
	{
		var obj;
		var scores = JSON.parse(storage.getItem(dataname));

		// netスコア順にソート
		var array = new Array();
		for (var i = 0;i < scores.length; i++) {
			array.push(scores[i]);
		}

		array.sort(sort_ary(keyname, false, parseFloat));

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
		var arrays = getHandyPars();

		// 各人のハンデ計算
		var dataPlayerScores = culcHandyPerson(arrays);

		// 各グループの集計（＆人数で割る）
		return culcHandyTeams(dataPlayerScores);
	}


	/******************************************************************
	 * ハンデホールのパー数を取得
	 ******************************************************************/
	function getHandyPars()
	{
		var arrays = new Array();

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			if (storage.getItem(kHandyHole + i) == null)
			{
				return [];
			}

			hHandys = storage.getItem(kHandyHole + i).split(",");

			var h = JSON.parse(storage.getItem(kCHoleInfs + i));
			if (h == null || h.pars.length < 9)	return;
			hPars = h.pars;

			// ハンデホールのパー数を取得し、配列に格納する

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


	/******************************************************************
	 * 各人のハンディキャップ計算
	 *   arrays : ハンデホールのパー値（ハンデホール以外はゼロ）
	 ******************************************************************/
	function culcHandyPerson( arrays )
	{

		var plObj = JSON.parse(storage.getItem(kScores));
		var dataPlayerScores = new Array();
		var k = 0;

		for (var i = 0; i < plObj.length; i++)
		{
			plObj[i]
			var net = 0;
			for (var j = 0; j < plObj[i].hole_score.length; j++)
			{
				// TODO 18この同一連番Holeであることを信頼
				if (arrays.length > j && arrays[j] != 0) {
					// TODO マイナスハンデがないなら、コメントをはずす
					//if (plObj[i].hole_score[j] > arrays[j])
					net += plObj[i].hole_score[j] - arrays[j];
				}
			}
			net = net * 1.2;
			if (net > handyScoreMax) net = handyScoreMax;
			plObj[i].score_net = plObj[i].score_gross - net;
		}

		// ソートし、順位付け
		plObj.sort(sort_ary("score_net", false, parseFloat));

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
				if (teams[j].teamId == plObj[i].teamId)
				{
					teams[j].score_net += plObj[i].score_net;
					break;
				}
			}
		}

		// ソートし、順位付け
		teams.sort(sort_ary("score_net", false, parseFloat));
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
		var handys = holeNumbers;
		var arrayHandyHole = getHandyData();

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
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
	}


	/******************************************************************
	 * 初期化処理（ハンディキャップ画面）（←削除予定）
	 ******************************************************************/
	function initializeHandyCap()
	{
		// 初期化共通
		initializeCommon();

		// データ反映
		updateParDataDisplay();
	}


	/******************************************************************
	 * 抽選済みのホール数をカウント（←削除予定）
	 ******************************************************************/
	function countSelectHandy()
	{
		var count = 0;
		var array = [];

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			if (storage.getItem(kHandyHole + i) == null) continue;

			array[i] = storage.getItem(kHandyHole + i).split(",");

			for (var j = 0; j < array[i].length; j++)
			{
				if (array[i][j] != "")
				{
					count++;
				}
			}
		}

		return count;
	}


	/******************************************************************
	 * パーデータを画面に反映する（←削除予定）
	 ******************************************************************/
	function updateParDataDisplay()
	{
		var js_h = [];
		var parent_object = [];
		var thole = [];
		var ch = [];
		var set = [];

		hHandys = ["","","","","","","","",""];

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			if (storage.getItem(kHandyHole + i) != null)
			{
				hHandys = storage.getItem(kHandyHole + i).split(",");
			}

			js_h[i] = JSON.parse(storage.getItem(kCHoleInfs + i));
			parent_object[i] = document.getElementById("hole" + i);

			thole[i] = document.createElement('tr');
			thole[i].innerHTML = '<th>' + js_h[i].csubname + '</th>';

			for (var j = 0; j < 9; j++) {
				thole[i].innerHTML += '<th>' + js_h[i].names[j]  + '</th>';
			}
			parent_object[i].appendChild(thole[i]);

			ch[i] = document.createElement('tr');
			ch[i].innerHTML = '<td>PAR</td>';
			set[i] = document.createElement('tr');
			set[i].innerHTML = '<td>Handy</td>';

			hPars[i] = js_h[i].pars;

			for (var k = 0; k < 9; k++) {
				ch[i].innerHTML = ch[i].innerHTML + '<td>' + js_h[i].pars[k]  + '</td>';
				set[i].innerHTML = set[i].innerHTML + '<td><input type="text" size="7" id="set' + k + '" value="' + hHandys[k] + '"></td>';
			}
			parent_object[i].appendChild(ch[i]);
			parent_object[i].appendChild(set[i]);
		}

	}

	/******************************************************************
	 * パーデータ配列を通知する
	 ******************************************************************/
	function getParData()
	{
		var js_h = [];
		var parArray = new Array();

		hHandys = ["","","","","","","","",""];

		for (var i = 0; i < storage.getItem(kSubCArray).split(",").length; i++)
		{
			js_h[i] = JSON.parse(storage.getItem(kCHoleInfs + i));
			parArray = parArray.concat(js_h[i].pars);

			if (storage.getItem(kHandyHole + i) != null)
			{
				hHandys = storage.getItem(kHandyHole + i).split(",");
			}
		}
		return parArray;
	}

	/******************************************************************
	 * ハンデ選択されたホールを取得する
	 ******************************************************************/
	function getHandyData()
	{
		var arrayHandyHole = new Array();
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
	}

	/******************************************************************
	 * チーム成績表：更新  @iwa
	 *   ルーレットを閉じた後に呼び出される
	 ******************************************************************/
	function updatePerformance()
	{
		var countHandy = 0;

		// ハンデ抽選状況の更新
		if (document.getElementById('drawHole') !=  null)
		{
			countHandy = countSelectHandy();
			document.getElementById('drawHole').innerHTML  = countHandy + " / " + handyMax;
		}

		// チームデータを作成してソートする
		var teamData;
		teamData = culcHandy();
		teamData = sortDisplayData(kTeams, "score_net");

		// データを設定して表示を更新
		clsAnimete.setDstScore( teamData );
		animeType = countHandy == 12 ? "finale" : "update";
		clsAnimete.updaeData(animeType);
	}

// -->
