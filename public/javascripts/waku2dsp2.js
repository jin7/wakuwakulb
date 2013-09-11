<!--
////////////////////////////////////////////////////////
// Created by k.iwamine(akamura)

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
var wk2PersonalAnimetionClass = function() {

	////////////////////////////////////////////////////////
	// プロパティ
	this.m_dstScoreArray = null;			// 更新後のチームスコア(dataTeamScoreの配列)
	this.m_srcScoreArray = null;			// 更新前のチームスコア(dataTeamScoreの配列)

	// 定数
	this.m_stObjName = "div.personalResult";	// 操作対象オブジェクト名


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
				obj[0].setAttribute( "id", array[i].playerId );
			} else {
				// 雛型ノードを複製する
				var copy = obj[0].cloneNode(true);
				copy.setAttribute( "id", array[i].playerId );
				obj[0].parentNode.appendChild(copy);
			}
		}
	}

	// 更新前スコアを復元する
	//   bAnime :アニメーション有無
	this.restoreData = function( bAnime ) {
		if(this.m_srcScoreArray == null) {
			alert("データが設定されていません。\nCreateTeamObjects");
			return;
		}

		{
			var player;
			for (var i = 0; i < this.m_srcScoreArray.length; i++) {
				player = document.getElementById( this.m_srcScoreArray[i].playerId );
				if( player == null ) {
					alert("プレイヤーデータが読み込まれていません。");
					break;
				}
				var ch = player.children;
				for (var j = 0; j < ch.length; j++) {
					// クラス名を元にデータを設定する
					switch( ch[j].getAttribute("class") ) {
					case "ranking":
						ch[j].innerHTML = this.m_srcScoreArray[i].ranking; break;
					case "name":
						ch[j].innerHTML = this.m_srcScoreArray[i].playername; break;
					case "gross":
						ch[j].innerHTML = this.m_srcScoreArray[i].score_gross; break;
					case "net":
						ch[j].innerHTML = this.m_srcScoreArray[i].score_net; break;
					}
				}
			}
		}

		// チーム初期表示位置調整
		{
			dur = bAnime ? 1 : 0.1;
			var players = document.querySelectorAll( "div.personalResult" );
			for (var i = 0; i < players.length; i++) {
				var y = (i+1) * 60;
				$( "#"+players[i].id ).tween({
				   top:{
				      start: 0,
				      stop: y,
				      time: 0,
				      duration: dur,
				      units: 'px',
				      effect: 'easeInOut',
				   },
					opacity:{
					  start: 0,
					  stop: 100,
					  time: 0,
					  duration: dur,
					  effect:'easeInOut'
					}
				});
				$.play();
			}
		}
	}

	// 新しいスコアに更新する
	//   animeType : アニメーションタイプ
	//     "none"    : アニメなし
	//     "update"  : 中間結果用
	//     "finale"  : 最終結果表示用
	this.updaeData = function( animeType ) {

	}

}

-->


