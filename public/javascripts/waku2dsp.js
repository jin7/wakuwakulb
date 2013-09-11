<!--
////////////////////////////////////////////////////////
// Created by k.iwamine

////////////////////////////////////////////////////////
// チームスコア表示制御クラス
//
//  使い方：
//    1)wk2TeamAnimetionClassクラスのインスタンスを作成
//    2)setSrcScoreで更新前のデータを設定
//    3)setDstScoreで更新後のデータを設定
//    4)CreateTeamObjectsで更新前のデータを元にHTMLのオブジェクトを調整する
//    5)restoreDataで更新前のデータを画面に反映
//    6)updaeDataで更新前のデータから更新後のデータにアニメーションしながらを画面に反映
//        クリックしてめくれるようにするなどHTMLのオブジェクトを調整する
//  備考：
//    ・アニメーション処理はタイマーなど遅延処理を入れないとうまくアニメーションしない
//      本クラス内で
var wk2TeamAnimetionClass = function() {

	////////////////////////////////////////////////////////
	// プロパティ
	this.m_dstScoreArray = null;			// 更新後のチームスコア(dataTeamScoreの配列)
	this.m_srcScoreArray = null;			// 更新前のチームスコア(dataTeamScoreの配列)

	// 定数
	this.m_stObjName = "div.teamResult";	// 操作対象オブジェクト名


	////////////////////////////////////////////////////////
	// メソッド

	this.setSrcScore = function( tmArray ) {
		this.m_srcScoreArray = tmArray;
	}
	this.setDstScore = function( tmArray ) {
		this.m_dstScoreArray = tmArray;
	}


	// チームオブジェクトの生成
	this.CreateTeamObjects = function() {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateTeamObjects");
			return;
		}

		// ノードを複製
		//   読み込み済みのデータ数分ノードを複製
		//   チームIDをオブジェクトIDとして設定
		var obj = document.querySelectorAll( this.m_stObjName );
		var array = this.m_srcScoreArray;
		for (var i = 0; i < array.length; i++) {
			if( i == 0 ) {
				// 先頭を雛型ノードとする
				obj[0].setAttribute( "id", array[i].teamId );
			} else {
				// 雛型ノードを複製する
				var copy = obj[0].cloneNode(true);
				copy.setAttribute( "id", array[i].teamId );
				obj[0].parentNode.appendChild(copy);
			}
		}

		// フリップアニメーションの設定
		animSet3Di();
	}

	// 更新前スコアを復元する
	//   bAnime :アニメーション有無
	this.restoreData = function( bAnime ) {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateTeamObjects");
			return;
		}

		{
			// データ更新
			for (var i = 0; i < this.m_srcScoreArray.length; i++) {
				animUpdateScore(this.m_srcScoreArray[i]);
			}

			// 座標更新
			this.m_dstScoreArray = this.m_srcScoreArray;
			setTimeout( animNone, 0 );	// 更新
			return;
		}
	}

	// 新しいスコアに更新する
	//   animeType : アニメーションタイプ
	//     "none"    : アニメなし
	//     "update"  : 中間結果用
	//     "finale"  : 最終結果表示用
	this.updaeData = function( animeType ) {
		if(this.m_dstScoreArray == null || this.m_srcScoreArray.length == null) {
			alert("データが設定されていません。\nCreateTeamObjects");
			return;
		}

		var startDur = 1000;	// 1秒後に動作開始
		switch(animeType) {
		case "finale":	// 最終結果表示用
//			setTimeout( animUpdate, startDur );
			setTimeout( animFinale, startDur );
			break;
		case "update":	// 中間結果用
			setTimeout( animUpdate, startDur );
			break;
		case "none":	// アニメなし
		default:
			setTimeout( animNone, startDur );
			break;
		}

	}

	// Y座標計算
	//    ranking：順位
	function animCalcPos( ranking ) {
//		var y = (ranking+1) * 60;
		var y = (ranking) * 60;
		return y;
	}

	// データ更新
	//    score：スコアデータ
	function animUpdateScore( score ) {
		var team = document.getElementById( score.teamId );
		// データを更新する
		var ch = team.children[0].children;
		for (var j = 0; j < ch.length; j++) {
			// クラス名を元にデータを設定する
			switch( ch[j].getAttribute("class") ) {
			case "ranking":
				ch[j].innerHTML = score.ranking; break;
			case "name":
				ch[j].innerHTML = score.teamname; break;
			case "gross":
				ch[j].innerHTML = score.score_gross; break;
			case "net":
				ch[j].innerHTML = score.score_net; break;
			}
		}
	}

	// Y座標計算
	//    score：チームデータ
	function animSetPosition( score ) {
		var y = animCalcPos( score.ranking );
		var team = document.getElementById( score.teamId );
		team.style.top = y + "px";
	}

	// Y座標取得
	//    score：チームデータ
	function animGetPosition( score ) {
		var team = document.getElementById( score.teamId );
		var y = parseInt( team.style.top, 10 );
		return y;
	}

	// アニメーション後の後始末
	function animFinish() {
		clsAnimete.m_srcScoreArray = clsAnimete.m_dstScoreArray;
		clsAnimete.m_dstScoreArray = null;
	}

	// アニメーションエフェクトの後始末
	function animClear() {
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			$( "#"+clsAnimete.m_srcScoreArray[i].teamId ).tween({
				shadow:{
					start: '3px 3px 8px #00f',
					stop: '0px 0px 0px #000',
					time: 0,
					duration: 0.5,
					effect:'easeInOut'
				}
			} );
			// アニメーション実行
			$.play();
		}
	}


	///////////////////////////////////////////////
	function mySideChange(front) {
		if (front) {
			$(this).find('div.front').show();
			$(this).find('div.back').hide();
		} else {
			$(this).find('div.front').hide();
			$(this).find('div.back').show();
		}
	}

	function myComplete() {
		$(this).find('div.front').show();
		$(this).find('div.back').hide();
	}

	// フリップアニメーションの設定
	function animSet3Di() {
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			$( "#"+clsAnimete.m_srcScoreArray[i].teamId ).click( function () {
				var result = $(this).find('div.back').is(':visible');
				if( result != false ) {
					$(this).rotate3Di(
						'900',
						500,
						{
							sideChange: mySideChange,
							complete: myComplete
						}
					);
				}
			});

			$("#"+clsAnimete.m_srcScoreArray[i].teamId).find('div.front').show();
			$("#"+clsAnimete.m_srcScoreArray[i].teamId).find('div.back').hide();
		}
	}


	//////////////////////////////////////////////
	// 最終結果表示用
	var nCount;
	function animFlipBack() {
		// 裏返す
		$("#"+clsAnimete.m_srcScoreArray[nCount].teamId).rotate3Di( '180', 500 );
		$("#"+clsAnimete.m_srcScoreArray[nCount].teamId).find('div.front').hide();
		$("#"+clsAnimete.m_srcScoreArray[nCount].teamId).find('div.back').show();

		// 座標書き換え
		animSetPosition( clsAnimete.m_dstScoreArray[nCount] );

		// 最後
		if( nCount == clsAnimete.m_srcScoreArray.length + 1 ) {
			animFinish();

			// 値書き換え
			for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
				animUpdateScore(clsAnimete.m_srcScoreArray[nCount]);
			}
		}

		nCount++;
	}
	function animFinale() {
		// クリックしたらマスク解除
		nCount = 0;
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			setTimeout( animFlipBack, 300*i );
		}
	}


	//////////////////////////////////////////////
	// 入れ替え用
	var aniCount;
	function animUpdate() {
		// 変更前先頭から順に移動
		aniCount = clsAnimete.m_srcScoreArray.length;
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			var id= clsAnimete.m_srcScoreArray[i].teamId;
			var orgPos = animGetPosition( clsAnimete.m_srcScoreArray[i] );
			var newPos = orgPos;
			for (var j = 0; j < clsAnimete.m_dstScoreArray.length; j++) {
				if( clsAnimete.m_dstScoreArray[j].teamId == clsAnimete.m_srcScoreArray[i].teamId ) {
					newPos = animCalcPos( clsAnimete.m_dstScoreArray[j].ranking );
					break;
				}
			}

			// 移動＆アニメーション処理
			var dur = 2;
			var interval = 0.3;
			{
				$( "#"+id ).tween({
					top:{
						start: orgPos,
						stop: newPos,
						time: interval * i,
						duration: dur,
						units: 'px',
						effect: 'bounceOut',
					},
					shadow:{
						start: '0px 0px 0px #000',
						stop: '3px 3px 8px #00f',
						time: interval * i,
						duration: (dur / 2),
						effect:'easeInOut'
					},
					onStop: function( elem ) {
						// 最後の場合は後始末
						aniCount--;
						if( aniCount == 0 ) {
							animNone();
							for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
								animUpdateScore(clsAnimete.m_srcScoreArray[i]);
							}
							animClear();
						}
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}


	//////////////////////////////////////////////
	// アニメーションなし
	function animNone() {
		// 座標書き換え
		for (var i = 0; i < clsAnimete.m_dstScoreArray.length; i++) {
			animSetPosition( clsAnimete.m_dstScoreArray[i] );
		}

		animFinish();

		// 値書き換え
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			animUpdateScore(clsAnimete.m_srcScoreArray[i]);
		}
	}

}

-->


