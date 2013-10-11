<!--
////////////////////////////////////////////////////////
// Created by k.iwamine


// アニメーションフィナーレ非表示
function onclick_finale() {
	cvs = document.getElementById("finale");
	cvs.style.visibility = "hidden";
}

// アニメーションフィナーレ非表示
var gAnimetionMode = "team";

// アニメーションオブジェクトの取得
function getAnimationObject() {
	return (gAnimetionMode == "team") ? clsAnimete : clsAnimete2;
}


// Y座標計算
//    ranking：順位
function prvCalcPos( ranking ) {
	var y = 40;
	y += ( (ranking-1) * 50);
	return y;
}

// 数値変換
//    val：変換対象（文字列OR数値）
function prvStoN( val ) {
	var num;
	if( typeof(val) == "string" ) {
		num = parseFloat( scoreValue );
	} else {
		num = val
	}
	return num;
}

// スコア桁揃え（四捨五入して小数1桁にする）
//    scoreValue：スコア
function prvPreValue( scoreValue ) {
	var val = prvStoN( scoreValue );
	var num = new Number( val );
	var str = num.toPrecision( 6 );
	var n = str.split(".")[0].length;
	str = num.toPrecision( n+1 );
	return str;
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
	var elm = document.getElementById( id );
	var y = parseInt( elm.style.top, 10 );
	return y;
}

// X座標取得
//    id    ：チームID
function prvGetPositionX( id ) {
	var elm = document.getElementById( id );
	var x = parseInt( elm.offsetLeft, 10 );
	return x;
}

-->


