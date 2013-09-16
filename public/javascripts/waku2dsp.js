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
	this.animStartTime = 1000;				// アニメーション開始までの時間

	// 定数
	this.m_stObjName = "div.teamResult";	// 操作対象オブジェクト名

	// プライベート変数
	var mCountAnimTarget;					// アニメ処理用カウンタ


	////////////////////////////////////////////////////////
	// 公開メソッド

	// 更新前データ設定
	this.setSrcScore = function( tmArray ) {
		this.m_srcScoreArray = tmArray;
	}
	// 更新後データ設定
	this.setDstScore = function( tmArray ) {
		this.m_dstScoreArray = tmArray;
	}


	// チームオブジェクトの生成
	this.CreateTeamObjects = function() {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateTeamObjects");
			return;
		}

		// 動作モード設定（waku2settings.js）
		if( wk2_setting_mode == "parsonal" ) {
			// 個人成績表ボタンを消す
			var elms = document.getElementById( "handicapHole" );
			elms.style.visibility ="hidden";

			// スコアのタイトルを氏名に変更する
			elms = document.getElementsByClassName("nameTeamLabel");
			elms[0].innerText = "氏名";
		}

		// ノードを複製
		//   読み込み済みのデータ数分ノードを複製
		//   チームIDをオブジェクトIDとして設定
		var obj = document.querySelectorAll( this.m_stObjName );
		var array = this.m_srcScoreArray;
		for (var i = 0; i < array.length; i++) {
			if( i == 0 ) {
				// 先頭を雛型ノードにする
				obj[0].setAttribute( "id", array[i].teamId );
			} else {
				// 雛型ノードを複製する
				var copy = obj[0].cloneNode(true);
				copy.setAttribute( "id", array[i].teamId );
				obj[0].parentNode.appendChild(copy);
			}
		}

		// アニメーション用の設定
		prvAnimInitialize();
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
				prvUpdateScore(this.m_srcScoreArray[i]);
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
			alert("データが設定されていません。\nupdaeData");
			return;
		}

		// アニメーション設定
		switch( animeType ) {
		case "finale":	// 最終結果表示用
			setTimeout( prvAnimFinale, this.animStartTime );
			break;
		case "update":	// 中間結果用
			setTimeout( prvAnimUpdate, this.animStartTime );
			break;
		case "none":	// アニメなし
		default:
			setTimeout( animNone, this.animStartTime );
			break;
		}

	}



	////////////////////////////////////////////////////////
	// 内部メソッド

	// Y座標計算
	//    ranking：順位
	function prvCalcPos( ranking ) {
		var y = (ranking) * 60;
		return y;
	}

	// スコア桁揃え（四捨五入して小数1桁にする）
	//    scoreValue：スコア
	function prvPreValue( scoreValue ) {
		var val;
		if( typeof(scoreValue) == "string" ) {
			val = parseFloat( scoreValue );
		} else {
			val = scoreValue
		}
		var num = new Number( val );
		var str = num.toPrecision( 6 );
		var n = str.split(".")[0].length;
		str = num.toPrecision( n+1 );
		return str;
	}

	// データ更新
	//    score：スコアデータ
	function prvUpdateScore( score ) {
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
				ch[j].innerHTML = prvPreValue( score.score_gross ); break;
			case "net":
				ch[j].innerHTML = prvPreValue( score.score_net ); break;
			}
		}
	}

	// Y座標設定
	//    newPos：新しい順位（1から開始）
	//    id    ：チームID
	function prvSetPosition( newPos, id ) {
		var y = prvCalcPos( newPos );
		var team = document.getElementById( id );
		team.style.top = y + "px";
	}

	// Y座標取得
	//    id    ：チームID
	function prvGetPosition( id ) {
		var team = document.getElementById( id );
		var y = parseInt( team.style.top, 10 );
		return y;
	}

	// チームデータ差し替え
	function prvDataExchange() {
		clsAnimete.m_srcScoreArray = clsAnimete.m_dstScoreArray;
		clsAnimete.m_dstScoreArray = null;
	}

	// アニメーションエフェクトの後始末
	function prvAnimClear() {
		prvR3Di_Clear();
	}

	// アニメーション初期化
	function prvAnimInitialize() {
		// フリップアニメーションの設定
		prvR3Di_initialize();
	}

	// 疑似スリープ
	function prvSleep(time) {
		var d1 = new Date().getTime();
		var d2 = new Date().getTime();
		while (d2 < d1 + time) {
			d2 = new Date().getTime();
		}
		return;
	}


	////////////////////////////////////////////////////////
	//アニメーション関連

	// 最終結果表示用
	function prvAnimFinale() {
		// スコアを裏返してクリックしたらめくれるように設定する
		mCountAnimTarget = 0;
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			setTimeout( prvR3Di_SetFlipBack, 300*i );
		}
	}

	// 中間結果表示用
	function prvAnimUpdate() {
		prvJST_MovePosition();
	}

	// アニメーションなし
	function animNone() {
		// 座標書き換え
		var data;
		for (var i = 0; i < clsAnimete.m_dstScoreArray.length; i++) {
			data = clsAnimete.m_dstScoreArray[i];
            prvSetPosition( data.ranking, data.teamId );

		}

		// データ差し替え
		prvDataExchange();

		// 値書き換え
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			prvUpdateScore( clsAnimete.m_srcScoreArray[i] );
		}
	}



	///////////////////////////////////////////////
	// rotate3Di関連

	// 3Di裏表の切り替えコールバック
	function prvR3Di_SideChange(front) {
		// 裏表の差し替え
		if (front) {
			$(this).find('div.front').show();
			$(this).find('div.back').hide();
		} else {
			$(this).find('div.front').hide();
			$(this).find('div.back').show();
		}
	}

	// 3Di切り替え完了コールバック
	function prvR3Di_Complete() {
		$(this).find('div.front').show();
		$(this).find('div.back').hide();
	}

	// 3Di初期化
	function prvR3Di_initialize() {
		// rotate3Di関連
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			$( "#"+clsAnimete.m_srcScoreArray[i].teamId ).click( function () {
				var result = $(this).find('div.back').is(':visible');
				if( result != false ) {
					$(this).rotate3Di(
						'900',
						500,
						{
							sideChange: prvR3Di_SideChange,
							complete: prvR3Di_Complete
						}
					);
				}
			});

			$("#"+clsAnimete.m_srcScoreArray[i].teamId).find('div.front').show();
			$("#"+clsAnimete.m_srcScoreArray[i].teamId).find('div.back').hide();
		}
	}

	// 3Di効果の削除
	function prvR3Di_Clear() {
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			// 影をクリアする
			$( "#"+clsAnimete.m_srcScoreArray[i].teamId ).tween({
				shadow:{
					start: '6px 3px 8px #000',
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

	// めくり設定完了後の操作
	function prvR3Di_ExitFlipBackSetting() {
		// データを差し替える
        prvDataExchange();

		// スコア更新
		var teamData;
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			teamData = clsAnimete.m_srcScoreArray[i];
            // 座標書き換え
            prvSetPosition( teamData.ranking, teamData.teamId );
            // 値更新
			prvUpdateScore( teamData );
		}
	}

	// スコアを裏返す
	function prvR3Di_SetFlipBack() {
		// 裏返す
		$("#"+clsAnimete.m_srcScoreArray[mCountAnimTarget].teamId).rotate3Di( '360', 500 );
		$("#"+clsAnimete.m_srcScoreArray[mCountAnimTarget].teamId).find('div.front').hide();
		$("#"+clsAnimete.m_srcScoreArray[mCountAnimTarget].teamId).find('div.back').show();

		// 最後
		if( mCountAnimTarget == clsAnimete.m_srcScoreArray.length - 1 ) {
			setTimeout( prvR3Di_ExitFlipBackSetting, 300 );
		}

		mCountAnimTarget++;
	}


	///////////////////////////////////////////////
	// JSTween関連
	function prvJST_MovePosition() {
		mCountAnimTarget = clsAnimete.m_srcScoreArray.length;

		// 変更前先頭から順に移動
		for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
			var id= clsAnimete.m_srcScoreArray[i].teamId;
			var orgPos = prvGetPosition( clsAnimete.m_srcScoreArray[i].teamId );
			var newPos = orgPos;
			for (var j = 0; j < clsAnimete.m_dstScoreArray.length; j++) {
				if( clsAnimete.m_dstScoreArray[j].teamId == clsAnimete.m_srcScoreArray[i].teamId ) {
					newPos = prvCalcPos( clsAnimete.m_dstScoreArray[j].ranking );
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
						stop: '6px 3px 8px #000',
						time: interval * i,
						duration: (dur / 4),
						effect:'easeInOut'
					},
					onStop: function( elem ) {
						// 最後の場合は後始末
						mCountAnimTarget--;
						if( mCountAnimTarget == 0 ) {
							animNone();
							for (var i = 0; i < clsAnimete.m_srcScoreArray.length; i++) {
								prvUpdateScore( clsAnimete.m_srcScoreArray[i] );
							}
							prvAnimClear();
						}
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}

}

-->

