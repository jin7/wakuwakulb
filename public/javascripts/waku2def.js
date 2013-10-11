<!--
////////////////////////////////////////////////////////
// Created by k.iwamine

// チームスコアデータ
function dataTeamScore () {
	this.dataId = 0;		// チーム固有のID。HTMLオブジェクトのIDとして利用
	this.ranking = 0;		// 順位（表示用）
	this.name = "";			// チーム名
	this.score_gross = 0;	// グロスのスコア
	this.handicap = 0;		// ハンディキャップ
	this.score_net = 0;		// ネットのスコア
	this.count = 0;			// チーム人数
	this.age = 0; 			// 誕生経過日数
}

// 個人スコアデータ
function dataPlayerScore () {
	this.dataId = 0;		// プレイヤー固有のID。HTMLオブジェクトのIDとして利用
	this.ranking = 0;		// 順位（表示用）
	this.name = "";			// プレイヤー名
//	this.hole1_id = "";		// ホール1のコースID
//	this.hole1_score = "";	// ホール1のスコア
//	this.hole2_id = "";		// ホール2のコースID
//	this.hole2_score = "";	// ホール2のスコア
	this.hole_score = "";	// ホールのスコア
	this.score_gross = 0;	// グロスのスコア
	this.handicap = 0;		// ハンディキャップ
	this.score_net = 0;		// ネットのスコア
	this.teamId = 0; 		// チームID
	this.age = 0; 			// 誕生経過日数
}


-->
