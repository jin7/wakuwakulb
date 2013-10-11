<!--
////////////////////////////////////////////////////////
// Created by k.iwamine


////////////////////////////////////////////////////////
// チームスコア表示制御クラス
//
//  使い方：
//    1)wk2AnimetionClassクラスのインスタンスを作成
//    2)setSrcScoreで更新前のデータを設定
//    3)setDstScoreで更新後のデータを設定
//    4)CreateTeamObjectsで更新前のデータを元にHTMLのオブジェクトを調整する
//    5)restoreDataで更新前のデータを画面に反映
//    6)updaeDataで更新前のデータから更新後のデータにアニメーションしながらを画面に反映
//        クリックしてめくれるようにするなどHTMLのオブジェクトを調整する
//  備考：
//    ・アニメーション処理はタイマーなど遅延処理を入れないとうまくアニメーションしない

var wk2AnimetionClass = function( mode ) {

	////////////////////////////////////////////////////////
	// プロパティ
	this.m_mode = (typeof(mode) == "undefined") ? "team" : mode;
	gAnimetionMode = this.m_mode;
	this.m_dstScoreArray = null;			// 更新後のチームスコア(dataTeamScoreの配列)
	this.m_srcScoreArray = null;			// 更新前のチームスコア(dataTeamScoreの配列)
	this.animStartTime = 1000;				// アニメーション開始までの時間

	// 定数
	this.m_stObjName = "div.scoreResult";	// 操作対象オブジェクト名

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

	// チームモードか
	this.isModeTeam = function( ) { return (this.m_mode == "team"); }


	// オブジェクトの生成
	this.CreateObjects = function() {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateObjects");
			return;
		}

		// 動作モード設定（waku2settings.js）
		if( wk2_setting_mode == "parsonal" ) {
			// 個人成績表ボタンを消す
			var elms = document.getElementById( "handicapHole" );
			elms.style.visibility ="hidden";

			// スコアのタイトルを氏名に変更する
			elms = document.getElementsByClassName("nameLabel");
			elms[0].innerText = "氏名";
		}

		// ノードを複製
		//   読み込み済みのデータ数分ノードを複製
		//   チームID/プレイヤーIDをオブジェクトIDとして設定
		var obj = document.querySelectorAll( this.m_stObjName );
		var array = this.m_srcScoreArray;
		var nId;
		for (var i = 0; i < array.length; i++) {
			nId = array[i].dataId;
			if( i == 0 ) {
				// 先頭を雛型ノードにする
				obj[0].setAttribute( "id", nId );
			} else {
				// 雛型ノードを複製する
				var copy = obj[0].cloneNode(true);
				copy.setAttribute( "id", nId );
				obj[0].parentNode.appendChild(copy);
			}
		}

		// アニメーション用の設定
		this.prvAnimInitialize( this );

	}

	// 更新前スコアを復元する
	//   bAnime :アニメーション有無
	this.restoreData = function( bAnime ) {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateObjects");
			return;
		}

		// 座標更新
		if( !bAnime ) {
			// データ更新
			for (var i = 0; i < this.m_srcScoreArray.length; i++) {
				this.prvUpdateScore(this.m_srcScoreArray[i], this.m_srcScoreArray.length);
			}

			this.m_dstScoreArray = this.m_srcScoreArray;
			setTimeout( this.animNone.bind(this), 0 );	// 更新
			return;
		} else {
			setTimeout( prvJST_FadeIn, 0 );	// 更新
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
			setTimeout( this.prvAnimFinale.bind(this), this.animStartTime );
			break;
		case "update":	// 中間結果用
			setTimeout( this.prvAnimUpdate.bind(this), this.animStartTime );
			break;
		case "none":	// アニメなし
		default:
			setTimeout( this.animNone.bind(this), this.animStartTime );
			break;
		}

	}

	// チームオブジェクトの生成
	this.test = function() {
		prvAnimFinaleEnd();
	}


	////////////////////////////////////////////////////////
	// 内部メソッド


	// データ更新
	//    score：スコアデータ
	//    cnt  ：スコアデータ総数
	this.prvUpdateScore = function ( score, cnt ) {
		var nId = score.dataId;
		var elm = document.getElementById( nId );
		// 表面のデータを更新する
		var ch = elm.children[0].children;
		for (var j = 0; j < ch.length; j++) {
			// クラス名を元にデータを設定する
			switch( ch[j].getAttribute("class") ) {
			case "ranking":
				ch[j].innerHTML = score.ranking; break;
			case "name":
				ch[j].innerHTML = score.name; break;
			case "gross":
				ch[j].innerHTML = prvPreValue( score.score_gross ); break;
			case "net":
				ch[j].innerHTML = prvPreValue( score.score_net ); break;
			case "handi":
				{
					var num = prvStoN(score.score_gross) - prvStoN(score.score_net);
					ch[j].innerHTML = prvPreValue( num );
					break;
				}
			}
		}

		// 裏面のデータを設定
		ch = elm.children[1];
		ch.innerHTML = score.ranking;

		// zIndex設定
		elm.style.zIndex = cnt - score.ranking;
	}

	// チームデータ差し替え
	this.prvDataExchange = function() {
		this.m_srcScoreArray = this.m_dstScoreArray;
		this.m_dstScoreArray = null;
	}

	// アニメーションエフェクトの後始末
	this.prvAnimClear = function() {
		prvJST_Clear();
	}

	// アニメーション初期化
	this.prvAnimInitialize = function( aniObj ) {
		// フリップアニメーションの設定
		prvR3Di_initialize( aniObj );
	}


	// アニメーションフィナーレ
	function prvAnimFinaleEnd2() {
		// 紙ふぶき
		cvs = document.getElementById("finale");
		cvs.style.visibility = "visible";
		finale_init();
	}

	// アニメーションフィナーレ
	function prvAnimFinaleEnd() {
		// 内容表示
		prvJST_Zoom();

		// 紙ふぶき
		setTimeout( prvAnimFinaleEnd2, 2000 );
	}



	////////////////////////////////////////////////////////
	//アニメーション関連

	// 最終結果表示用
	this.prvAnimFinale = function() {
		// スコアを裏返してクリックしたらめくれるように設定する
		mCountAnimTarget = 0;
		var objAnime = getAnimationObject();
		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			setTimeout( prvR3Di_SetFlipBack, 300*i );
		}
	}

	// 中間結果表示用
	this.prvAnimUpdate = function() {
		prvJST_MovePositionStart();
	}

	// アニメーションなし
	this.animNone = function() {
		if( this.m_dstScoreArray == null ) {
			return;
		}

		// 座標書き換え
		var data;
		var nId;
		for (var i = 0; i < this.m_dstScoreArray.length; i++) {
			data = this.m_dstScoreArray[i];
			nId = data.dataId;
            prvSetPosition( data.ranking, nId );
		}

		// データ差し替え
		this.prvDataExchange();

		// 値書き換え
		for (var i = 0; i < this.m_srcScoreArray.length; i++) {
			this.prvUpdateScore( this.m_srcScoreArray[i], this.m_srcScoreArray.length );
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

		// すべてめくり完了
		mCountAnimTarget--;
		if( mCountAnimTarget == 0 ) {
			prvAnimFinaleEnd();
		}
	}

	// 3Di切り替えクリックコールバック
	function prvR3Di_Click() {
		var result = $(this).find('div.back').is(':visible');
		if( result != false ) {
			$(this).rotate3Di( '900', 500,
				{
					sideChange: prvR3Di_SideChange,
					complete: prvR3Di_Complete
				}
			);
		}
	}


	// 3Di初期化
	function prvR3Di_initialize( aniObj ) {
		// rotate3Di関連
		var nId;
		for (var i = 0; i < aniObj.m_srcScoreArray.length; i++) {
			nId = aniObj.m_srcScoreArray[i].dataId;
			$("#"+nId).click( prvR3Di_Click );
			$("#"+nId).find('div.front').show();
			$("#"+nId).find('div.back').hide();
		}
	}

	// めくり設定完了後の操作
	function prvR3Di_ExitFlipBackSetting() {
		var objAnime = getAnimationObject();

		// データを差し替える
        objAnime.prvDataExchange();

		// スコア更新
		var teamData;
		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			teamData = objAnime.m_srcScoreArray[i];
            // 座標書き換え
            prvSetPosition( teamData.ranking, teamData.dataId );
            // 値更新
			objAnime.prvUpdateScore( teamData, objAnime.m_srcScoreArray.length );
		}

		// カウントリセット
		mCountAnimTarget = objAnime.m_srcScoreArray.length;
	}

	// スコアを裏返す
	function prvR3Di_SetFlipBack() {
		var objAnime = getAnimationObject();

		// 裏返す
		$("#"+objAnime.m_srcScoreArray[mCountAnimTarget].dataId).rotate3Di( '360', 500 );
		$("#"+objAnime.m_srcScoreArray[mCountAnimTarget].dataId).find('div.front').hide();
		$("#"+objAnime.m_srcScoreArray[mCountAnimTarget].dataId).find('div.back').show();

		mCountAnimTarget++;

		// 最後
		if( mCountAnimTarget == objAnime.m_srcScoreArray.length - 1 ) {
			setTimeout( prvR3Di_ExitFlipBackSetting, 300 );
		}
	}


	///////////////////////////////////////////////
	// JSTween関連

	function prvSetOpacity(id, val) {
		$("#"+id).css('opacity', val);
	}

	// フェードイン
	function prvJST_FadeIn() {
		var objAnime = getAnimationObject();

		mCountAnimTarget = objAnime.m_srcScoreArray.length;

		// 先頭から順に移動
		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			// データ更新
			objAnime.prvUpdateScore(objAnime.m_srcScoreArray[i], objAnime.m_srcScoreArray.length);

			prvSetOpacity(objAnime.m_srcScoreArray[i].dataId, 0);

			// 位置計算
			var id= objAnime.m_srcScoreArray[i].dataId;
			var posY = prvCalcPos( objAnime.m_srcScoreArray[i].ranking );
			var posX = prvGetPositionX( objAnime.m_srcScoreArray[i].dataId );

			// zIndex設定
			var elm = document.getElementById( id );
			elm.style.zIndex = objAnime.m_srcScoreArray.length - objAnime.m_srcScoreArray[i].ranking;

			// 移動＆アニメーション処理
			var dur = 0.2;
			var interval = 0.05;
			var moveY = -10;
			var moveX = -40;
			{
				$( "#"+id ).tween({
					top:{
						start: posY + moveY,
						stop: posY,
						time: interval * i,
						duration: dur,
						units: 'px',
						effect: 'easeInOut',
					},
					left:{
						start: posX + moveX,
						stop: posX,
						time: interval * i,
						duration: dur,
						units: 'px',
						effect: 'easeInOut',
					},
					opacity:{
					  start: 0,
					  stop: 100,
					  time: interval * i,
					  duration: dur,
					  effect:'easeInOut'
					},
					onStop: function( elem ) {
						// 最後の場合は後始末
						mCountAnimTarget--;
						if( mCountAnimTarget == 0 ) {
							var obAni = getAnimationObject();
							obAni.animNone();
							for (var i = 0; i < obAni.m_srcScoreArray.length; i++) {
								obAni.prvUpdateScore( obAni.m_srcScoreArray[i], obAni.m_srcScoreArray.length );
							}
						}
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}


	// 移動開始
	function prvJST_MovePositionStart() {
		var objAnime = getAnimationObject();

		mCountAnimTarget = objAnime.m_srcScoreArray.length;

		// 変更前先頭からシャドウ追加
		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			var id= objAnime.m_srcScoreArray[i].dataId;

			// アニメーション処理
			var dur = 0.2;
			var interval = 0.1;
			{
				$( "#"+id ).tween({
					shadow:{
						start: wk2_setting_shadow_move2,
						stop: wk2_setting_shadow_move1,
						time: interval * i,
						duration: dur,
						effect:'easeInOut'
					},
					onStop: function( elem ) {
						// 最後の場合は移動処理開始
						mCountAnimTarget--;
						if( mCountAnimTarget == 0 ) {
							setTimeout( prvJST_MovePosition, 10 );
						}
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}

	// 移動
	function prvJST_MovePosition() {
		var objAnime = getAnimationObject();

		mCountAnimTarget = objAnime.m_srcScoreArray.length;

		// 変更前先頭から順に移動
		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			var id= objAnime.m_srcScoreArray[i].dataId;
			var orgPos = prvGetPosition( getAnimationObject().m_srcScoreArray[i].dataId );
			var newPos = orgPos;
			for (var j = 0; j < objAnime.m_dstScoreArray.length; j++) {
				if( objAnime.m_dstScoreArray[j].dataId == id ) {
					// 位置計算
					newPos = prvCalcPos( objAnime.m_dstScoreArray[j].ranking );

					// zIndex設定
					var elm = document.getElementById( id );
					elm.style.zIndex = objAnime.m_dstScoreArray.length - objAnime.m_dstScoreArray[j].ranking;
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
					onStop: function( elem ) {
						// 最後の場合は後始末
						mCountAnimTarget--;
						if( mCountAnimTarget == 0 ) {
							var obAni = getAnimationObject();
							obAni.animNone();
							for (var i = 0; i < obAni.m_srcScoreArray.length; i++) {
								obAni.prvUpdateScore( obAni.m_srcScoreArray[i], obAni.m_srcScoreArray.length );
							}
							prvJST_Clear();
						}
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}

	// 効果の削除
	function prvJST_Clear() {
		var objAnime = getAnimationObject();

		for (var i = 0; i < objAnime.m_srcScoreArray.length; i++) {
			// 影をクリアする
			$( "#"+objAnime.m_srcScoreArray[i].dataId ).tween({
				shadow:{
					start: wk2_setting_shadow_move1,
					stop: wk2_setting_shadow_move2,
					time: 0,
					duration: 0.5,
					effect:'easeInOut'
				}
			} );
			// アニメーション実行
			$.play();
		}
	}


	// トップとラストの拡大
	function prvJST_Zoom() {
		var objAnime = getAnimationObject();

		mCountAnimTarget = objAnime.m_srcScoreArray.length;

		// 上へスクロール
		document.getElementById("resultTable").scrollTop = 0;


		// 拡大表示
		var dur = 1;
		var interval = 0.3;
		var teamCount = objAnime.m_srcScoreArray.length;
		// 1st
		{
			var pos = 0;
			var id= objAnime.m_srcScoreArray[pos].dataId;
			var orgPos = prvGetPosition( objAnime.m_srcScoreArray[pos].dataId );
			var newPos = 20;

			// zIndex
			var team = document.getElementById( id );
			team.style.zIndex = 3 + teamCount;

			// 移動＆アニメーション処理
			{
				$( "#"+id ).tween({
					top:{ start: orgPos, stop: newPos,
						time: interval, duration: dur, units: 'px', effect: 'bounceOut',
					},
					transform:{
						start: 'rotateX(0deg) scale( 1 )', stop: 'rotateX(1080deg) scale( 1.2 )',
						time: interval, duration: dur, effect:'easeInOut'
					},
					shadow:{ start: '0px 0px 0px #000', stop: wk2_setting_shadow_1st,
						time: interval, duration: dur, effect:'easeInOut'
					}
				} );
				// アニメーション実行
				$.play();
			}
		}

		// 2nd
		if(objAnime.m_srcScoreArray.length > 2)
		{
			var pos = 1;
			var id= objAnime.m_srcScoreArray[pos].dataId;
			var orgPos = prvGetPosition( objAnime.m_srcScoreArray[pos].dataId );
			var newPos = 90;

			// zIndex
			var team = document.getElementById( id );
			team.style.zIndex = 2 + teamCount;

			// 移動＆アニメーション処理
			{
				$( "#"+id ).tween({
					top:{ start: orgPos, stop: newPos,
						time: interval, duration: dur, units: 'px', effect: 'bounceOut',
					},
					transform:{
						start: 'rotateX(0deg) scale( 1 )', stop: 'rotateX(720deg) scale( 1.1 )',
						time: interval, duration: dur, effect:'easeInOut'
					},
					shadow:{ start: '0px 0px 0px #000', stop: wk2_setting_shadow_2nd,
						time: interval, duration: dur, effect:'easeInOut'
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
		// 3rd
		if(objAnime.m_srcScoreArray.length > 4)
		{
			var pos = 2;
			var id= objAnime.m_srcScoreArray[pos].dataId;
			var orgPos = prvGetPosition( objAnime.m_srcScoreArray[pos].dataId );
			var newPos = 155;

			// zIndex
			var team = document.getElementById( id );
			team.style.zIndex = 1 + teamCount;

			// 移動＆アニメーション処理
			{
				$( "#"+id ).tween({
					top:{ start: orgPos, stop: newPos,
						time: interval, duration: dur, units: 'px', effect: 'bounceOut',
					},
					transform:{
						start: 'rotateX(0deg) scale( 1 )', stop: 'rotateX(360deg) scale( 1.05 )',
						time: interval, duration: dur, effect:'easeInOut'
					},
					shadow:{ start: '0px 0px 0px #000', stop: wk2_setting_shadow_3rd,
						time: interval, duration: dur, effect:'easeInOut'
					}
				} );
				// アニメーション実行
				$.play();
			}
		}

		// boobee
		if(objAnime.m_srcScoreArray.length > 3)
		{
			var pos = objAnime.m_srcScoreArray.length-2;
			var id= objAnime.m_srcScoreArray[pos].dataId;
			var orgPos = prvGetPosition( objAnime.m_srcScoreArray[pos].dataId );
			var newPos = 500;

			// zIndex
			var team = document.getElementById( id );
			team.style.zIndex = 2 + teamCount;

			// 移動＆アニメーション処理
			{
				$( "#"+id ).tween({
					top:{ start: orgPos, stop: newPos,
						time: interval, duration: dur, units: 'px', effect: 'bounceOut',
					},
					transform:{ start: 'rotateX(0deg) scale( 1 )', stop: 'rotateX(720deg) scale( 1.1 )',
						time: interval, duration: dur, effect:'easeInOut'
					},
					shadow:{ start: '0px 0px 0px #000', stop: wk2_setting_shadow_boobee,
						time: interval, duration: dur, effect:'easeInOut'
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
		// last
		{
			var pos = objAnime.m_srcScoreArray.length-1;
			var id= objAnime.m_srcScoreArray[pos].dataId;
			var orgPos = prvGetPosition( objAnime.m_srcScoreArray[pos].dataId );
			var newPos = 570;

			// zIndex
			var team = document.getElementById( id );
			team.style.zIndex = 3 + teamCount;

			// 移動＆アニメーション処理
			{
				$( "#"+id ).tween({
					top:{ start: orgPos, stop: newPos,
						time: interval, duration: dur, units: 'px', effect: 'bounceOut',
					},
					transform:{ start: 'rotateX(0deg) scale( 1 )', stop: 'rotateX(1080deg) scale( 1.2 )',
						time: interval, duration: dur, effect:'easeInOut'
					},
					shadow:{ start: '0px 0px 0px #000', stop: wk2_setting_shadow_last,
						time: interval, duration: dur, effect:'easeInOut'
					}
				} );
				// アニメーション実行
				$.play();
			}
		}
	}

}

-->


