var roulette = {

    // 定数
    BING_NUMBER : 18, // この整数内でビンゴを行う
    BING_NUMBER_HALF : 9, // BING_NUMBERの半分の値を後で入れる
    ROULETTE_SPEED : 100, // ルーレット回転速度(ms)
    FADEIN_SPEED : 2000, // フェードイン速度(ms)
	DIALOG_WIDTH: 300,
	
    // 英語表記用英数字
    ENGLISH_NUMBER_LIST_SMALL : [
        'one','two','three','four','five','six','seven','eight','nine','ten',
        'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'    
    ],
    ENGLISH_NUMBER_LIST_BIG : [
        '','','twenty','thirty','fourty','fifty','sixty','seventy','eighty','ninety'    
    ],

	// ロングホールなどの設定
	early_long_numbers : [],
	early_middle_numbers : [],
	early_short_numbers : [],
	late_long_numbers : [],
	late_middle_numbers : [],
	late_short_numbers : [],
    
	early_selcount : 0,
	early_long_selcount : 0,
	early_middle_selcount : 0,
	early_short_selcount : 0,
	
	late_selcount : 0,
	late_long_selcount : 0,
	late_middle_selcount : 0,
	late_short_selcount : 0,

	hcholes : [],
	pars : [],
	callback : function() {},
	
    // プロパティ
    // 割とtemp的な変数も持っちゃってる
    id : '',
    stop_flg : false,
    rand : 0,
    number : 0,
    number_english : '',
    select_number_list : [],
    past_number_list : [],
	$root : {},
    $bing_number : {},
    $past_number_early_ul : {},
    $past_number_late_ul : {},
    
    // 初期化する
    initRoulette : function(){

		roulette.$root.empty();
		roulette.$root.append($('<div id="number_english">&nbsp;</div>'));
		roulette.$root.append($('<div id="bing_number">&nbsp;</div>'));
		roulette.$root.append($('<div id="past_number_list_early"></div>'));
		roulette.$root.append($('<div id="past_number_list_late"></div>'));
		roulette.$root.append($('<button type="button" id="exe_button">ルーレット開始</button>'));

        roulette.$bing_number = $('#bing_number');
        
        // 過去に出た数字を表示する領域を生成
        // 1列目
        var li = '';
        roulette.$past_number_early_ul = $('<ul>').addClass('past_number_list');
        for (var i = 1; i <= roulette.BING_NUMBER_HALF; i++) {
            li += '<li><div class="background_box">&nbsp;</div></li>';
        }
        roulette.$past_number_early_ul.append(li);
        $('#past_number_list_early').append(roulette.$past_number_early_ul);
        
        // 2列目
        li = '';
        roulette.$past_number_late_ul = $('<ul>').addClass('past_number_list');
        for (i = roulette.BING_NUMBER_HALF + 1; i <= roulette.BING_NUMBER; i++) {
            li += '<li><div class="background_box">&nbsp;</div></li>';
        }
        roulette.$past_number_late_ul.append(li);
        $('#past_number_list_late').append(roulette.$past_number_late_ul);
        
	// 各要素の大きさ、font-sizeなどを定義
        // li要素のwidth、height、font-sizeをウインドウサイズに合わせる
//        var list_size = Math.floor($('.past_number_list').width() / (roulette.BING_NUMBER_HALF+2));
        var list_size = Math.floor(roulette.DIALOG_WIDTH / (roulette.BING_NUMBER_HALF+4));
		$('div#past_number_list_early').width((list_size + 4) * 9);
		$('div#past_number_list_late').width((list_size + 4) * 9);
        $('.past_number_list > li').width(list_size);
        $('.past_number_list > li').height(list_size);
        $('.past_number_list > li').css({fontSize:list_size+'px'});
        $('.past_number_list > li').css("vertical-align","middle");
        $('.past_number_list').css("margin-bottom", "5px");
        $('.past_number_list').height(list_size);
	$('');
	
        // ルーレットの数字を回転中のcssに設定
        roulette.$bing_number.attr('id', 'bing_number_rolling');
    },
    
    // ルーレットを止める
    stop : function() {
        roulette.stop_flg = true;
    },
    
    // ルーレット回転中
    running : function(){
        // 回してるように見えるようダミー回転
        roulette.rand = Math.floor( Math.random() * roulette.BING_NUMBER );
        // 停止ボタンが押された
        if (roulette.stop_flg) {
            // setIntervalを解放
            clearInterval(roulette.id);
			roulette.id = 0;
            roulette.number_english = '';
            // 実際のルーレット
            roulette.rand = Math.floor( Math.random() * roulette.select_number_list.length );
            roulette.number = roulette.select_number_list[roulette.rand];
            
            // 英語文字列生成
            var english_str = 0;
			roulette.number_english = '&nbsp;&nbsp;&nbsp;&nbsp;';
            if (roulette.number < 20) {
                english_str = roulette.ENGLISH_NUMBER_LIST_SMALL[roulette.number-1];
                for (var i = 0; i < english_str.length; i++) {
                    roulette.number_english += english_str.charAt(i)+'&nbsp;&nbsp;&nbsp;&nbsp;';
                }
            }
            else {
                english_str = roulette.ENGLISH_NUMBER_LIST_BIG[Math.floor(roulette.number/10)];
                for (var i = 0; i < english_str.length; i++) {
                    roulette.number_english += english_str.charAt(i)+'&nbsp;&nbsp;&nbsp;&nbsp;';
                }
                if (roulette.number % 10 != 0) {
                    roulette.number_english += '&nbsp;&nbsp;&nbsp;&nbsp;';
                    english_str = roulette.ENGLISH_NUMBER_LIST_SMALL[roulette.number-Math.floor(roulette.number/10)*10-1];
                    for (var i = 0; i < english_str.length; i++) {
                        roulette.number_english += english_str.charAt(i)+'&nbsp;&nbsp;&nbsp;&nbsp;';
                    }    
                }
            }
            
            // 出た数字の表示処理
            roulette.$bing_number
            // 一旦非表示
            .hide()
            // idを回転用から表示用に変更
            .attr('id', 'bing_number_decide')
            // その隙に数字を入れておく
            .text(roulette.number)
            // フェードインさせる
            .fadeIn(roulette.FADEIN_SPEED);
            
	    // 英数字を同じようにフェードイン
            $('#number_english')
            .hide()
            .html(roulette.number_english)
            .fadeIn(roulette.FADEIN_SPEED);
            
            // 出た数を保存
            roulette.past_number_list[roulette.number] = roulette.number;

			// 内部情報の更新
			// 　候補配列から選択された値および関連する値を削除
			refreshRouletteNumber(roulette.number);

			// ここで過去に出た数字を表示
			// 0より大きく半分より下の値であればearlyに入れる
			displaySelectHoleNumber(roulette.number, true);

			console.log(roulette.select_number_list);

            // ボタンのclickイベントをもとに戻す
			if (roulette.select_number_list.length > 0) {
				$('#exe_button').off('click')
				.on('click', roulette.execute)
				.text('ルーレット開始');
			} else {
				$('#exe_button').off('click').on('click', closeDialog).text('終了');
			}
            
			// 決定した数の記録とCallBack呼び出し
			roulette.hcholes.push(roulette.number);
			
			roulette.callback(roulette.hcholes);
			console.log(roulette.hcholes);
        }
        else {
            // ストップされなかったら数字を表示するだけ
            roulette.$bing_number.text(roulette.rand);
        }
    },
    
	sliceNumber: function(target) {
		var hit = -1;
		for (var i = 0; i < roulette.select_number_list.length; i++) {
			if (roulette.select_number_list[i] == target) {
				hit = i;
				break;
			}
		}
		if (hit != -1) {
			roulette.select_number_list.splice(i, 1);
		}
	},
	
	    // 初期化してルーレットを走らせる
    execute : function(){
        // リストが空になったら終了して走らせない
        if (roulette.select_number_list.length == 0) {
            alert('もうこれ以上選べません');
            return false;
        }
        // ボタンのclickイベントを停止するよう付け替える
        $('#exe_button').off('click')
        .on('click', roulette.stop)
        .text('ルーレット停止');
        
        // 初期化
        roulette.$bing_number.attr('id', 'bing_number_rolling');
        roulette.stop_flg = false;
        
        // 英語表記を消す
        $('#number_english').fadeOut(500,function(){$('#number_english').html('&nbsp;').show();});
        // ルーレットを走らせてidを取っておく
		if (roulette.id == 0) {
			roulette.id = setInterval(roulette.running, roulette.ROULETTE_SPEED);
		}
    },

	// 初期化
	init : function(pars, func, target) {
		roulette.$root = $("#" + target);
		roulette.pars = pars;
		roulette.callback = func;
		roulette.initHoleInfo();
		roulette.hcholes = [];
	},

	initHoleInfo : function() {
		roulette.early_long_numbers = [];
		roulette.early_middle_numbers = [];
		roulette.early_short_numbers  = [];
		roulette.late_long_numbers = [];
		roulette.late_middle_numbers = [];
		roulette.late_short_numbers = [];

		for (var i = 0; i < roulette.BING_NUMBER_HALF; i++) {
			if (roulette.pars[i] == 3) {
				roulette.early_short_numbers.push(i+1);
			} else if (roulette.pars[i] == 5) {
				roulette.early_long_numbers.push(i+1);
			} else {
				roulette.early_middle_numbers.push(i+1);
			}
		}
		for (var i = roulette.BING_NUMBER_HALF; i < roulette.BING_NUMBER; i++) {
			if (roulette.pars[i] == 3) {
				roulette.late_short_numbers.push(i+1);
			} else if (roulette.pars[i] == 5) {
				roulette.late_long_numbers.push(i+1);
			} else {
				roulette.late_middle_numbers.push(i+1);
			}
		}
	},
	
	// ダイアログボックス表示
	showDialog : function() {
		roulette.$root.addClass("wrapper");
		roulette.$root.css("background", "darkslategray");
		roulette.$root.dialog( {
			modal: false,
			title: "ハンデホール抽選ルーレット",
			resizable: true,
			width: roulette.DIALOG_WIDTH + "px",
			height: "auto",
		});

		// ルーレットの初期化（過去に選択されたものを反映）
		roulette.early_selcount = 0;
		roulette.early_long_selcount = 0;
		roulette.early_middle_selcount = 0;
		roulette.early_short_selcount = 0;
		roulette.late_selcount = 0;
		roulette.late_long_selcount = 0;
		roulette.late_middle_selcount = 0;
		roulette.late_short_selcount  = 0;

        roulette.select_number_list = [];
        for (var i = 0; i < roulette.BING_NUMBER; i++) {
            roulette.select_number_list.push(i+1);
        }
		roulette.initRoulette();
        for (var i = 0; i < roulette.BING_NUMBER; i++) {
			if( handys[i] != "" ) {
				refreshRouletteNumber(i+1);
				displaySelectHoleNumber(i+1, false);
			}
        }

		$('#exe_button').off('click')
			.on('click', roulette.execute);
		$(".ui-dialog").off('dialogclose')
			.on('dialogclose', closeRulette );
	}
};

function isInNumber(nums, target) {
	for (var i =0; i < nums.length; i++) {
		if (nums[i] == target) {
			return true;
		}
	}
	return false;
}

// ルーレットの候補リスト更新
function refreshRouletteNumber(holeNumber) {

	// 指定された番号を候補リストから削除
	for (var i = 0; i < roulette.select_number_list.length; i++) {
		if (roulette.select_number_list[i] == holeNumber) {
			roulette.select_number_list.splice(i, 1);
			break;
		}
	}
	
	// ロング、ショートなど条件に合わせて関連する番号を削除
	if (holeNumber < 10) {
		roulette.early_selcount++;
		if (roulette.early_selcount > 5) {
			for (var i = 1; i < 10; i++) {
				roulette.sliceNumber(i);
			}
		} else {
			if (isInNumber(roulette.early_long_numbers, holeNumber)) {
				roulette.early_long_selcount++;
				for (var i = 0; i < roulette.early_long_numbers.length; i++) {
					roulette.sliceNumber(roulette.early_long_numbers[i]);
				}
			}  else 	if (isInNumber(roulette.early_short_numbers, holeNumber)) {
				roulette.early_short_selcount++;
				for (var i = 0; i < roulette.early_short_numbers.length; i++) {
					roulette.sliceNumber(roulette.early_short_numbers[i]);
				}
			} else {
				roulette.early_middle_selcount++;
				if (roulette.early_middle_selcount > 3) {
					for (var i = 0; i < roulette.early_middle_numbers.length; i++) {
						roulette.sliceNumber(roulette.early_middle_numbers[i]);
					}
				}
			}
		}
	} else {
		roulette.late_selcount++;
		if (roulette.late_selcount > 5) {
			for (var i = 10; i < 19; i++) {
				roulette.sliceNumber(i);
			}
		} else {
			if (isInNumber(roulette.late_long_numbers, holeNumber)) {
				roulette.late_long_selcount++;
				for (var i = 0; i < roulette.late_long_numbers.length; i++) {
					roulette.sliceNumber(roulette.late_long_numbers[i]);
				}
			}  else 	if (isInNumber(roulette.late_short_numbers, holeNumber)) {
				roulette.late_short_selcount++;
				for (var i = 0; i < roulette.late_short_numbers.length; i++) {
					roulette.sliceNumber(roulette.late_short_numbers[i]);
				}
			} else {
				roulette.late_middle_selcount++;
				if (roulette.late_middle_selcount > 3) {
					for (var i = 0; i < roulette.late_middle_numbers.length; i++) {
						roulette.sliceNumber(roulette.late_middle_numbers[i]);
					}
				}
			}
		}
	}
}

// @add iwa
function displaySelectHoleNumber(holeNumber, anim) {
	var textcolor = "black";
	if (roulette.pars[holeNumber-1] == 3) {
		textcolor = "yellow";
	} else if (roulette.pars[holeNumber-1] == 5) {
		textcolor = "red";
	}
	if (0 < holeNumber && holeNumber <= roulette.BING_NUMBER_HALF) {
		if (anim) {
			$(roulette.$past_number_early_ul[0].childNodes[holeNumber-1]).hide().text(holeNumber).css("color", textcolor).fadeIn(1000);
		} else {
			$(roulette.$past_number_early_ul[0].childNodes[holeNumber-1]).hide().text(holeNumber).css("color", textcolor).show();
		}
	}
	// 上の値であればlateに入れる
	else {
		if (anim) {
			$(roulette.$past_number_late_ul[0].childNodes[holeNumber - roulette.BING_NUMBER_HALF-1]).hide().text(holeNumber).css("color", textcolor).fadeIn(1000);
		} else {
			$(roulette.$past_number_late_ul[0].childNodes[holeNumber - roulette.BING_NUMBER_HALF-1]).hide().text(holeNumber).css("color", textcolor).show();
		}
	}
}

// @add iwa
function closeRulette() {
	callback_calc();
}

function closeDialog() {
	roulette.$root.dialog("close");
}

