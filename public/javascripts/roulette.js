var roulette = {

    // 定数
    BING_NUMBER : 18, // この整数内でビンゴを行う
    BING_NUMBER_HALF : 9, // BING_NUMBERの半分の値を後で入れる
    ROULETTE_SPEED : 100, // ルーレット回転速度(ms)
    FADEIN_SPEED : 2000, // フェードイン速度(ms)
	DIALOG_WIDTH: 350,
	
    // 英語表記用英数字
    ENGLISH_NUMBER_LIST_SMALL : [
        'one','two','three','four','five','six','seven','eight','nine','ten',
        'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'    
    ],
    ENGLISH_NUMBER_LIST_BIG : [
        '','','twenty','thirty','fourty','fifty','sixty','seventy','eighty','ninety'    
    ],

	// ロングホールなどの設定
	numbers  : [],
/*
	{
		long_numbers : [],
		middle_numbers : [],
		short_numbers : [],
		total_selcount : 0,
		long_selcount : 0,
		middle_selcount: 0,
		short_selcount : 0,
	},
 */   
	hcholes : [],
	subCourses : [],
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
    $past_number_ul : [],
    
    // これがtrueのとき、サブコース名とホール名をくっつけたものを中央に表示する
    holestr_use : false,

    // 初期化する
    initRoulette : function(){

		roulette.$root.empty();
		roulette.$root.append($('<div id="number_english">&nbsp;</div>'));
		roulette.$root.append($('<div id="bing_number">&nbsp;</div>'));
		for (var i = 0; i < roulette.subCourses.length; i++) {
			roulette.$root.append($('<div class="past_number_list_group" id="past_number_list_' + (i+1) + '"></div>'));
		}
		roulette.$root.append($('<button type="button" id="exe_button">ルーレット開始</button>'));

        roulette.$bing_number = $('#bing_number');
        
        // 過去に出た数字を表示する領域を生成
		for (var i = 0; i < roulette.subCourses.length; i++) {
			var li = '';
//			var courseName = roulette.subCourses[i].csubname.substring(0,1);
			var courseName = roulette.subCourses[i].csubname;
			var $courseName = $('<span>' + courseName + '</span>').addClass('course_name');
			roulette.$past_number_ul[i] = $('<ul>').addClass('past_number_list');
			for (var j = 0; j < roulette.BING_NUMBER_HALF; j++) {
				li += '<li><div class="background_box">&nbsp;</div></li>';
			}
			roulette.$past_number_ul[i].append(li);
			$('#past_number_list_' + (i+1)).append($courseName);
			$('#past_number_list_' + (i+1)).append(roulette.$past_number_ul[i]);
		}
          
	// 各要素の大きさ、font-sizeなどを定義
        // li要素のwidth、height、font-sizeをウインドウサイズに合わせる
//        var list_size = Math.floor($('.past_number_list').width() / (roulette.BING_NUMBER_HALF+2));
        var list_size = Math.floor((roulette.DIALOG_WIDTH - 44) / (roulette.BING_NUMBER_HALF+4));
		$('div.past_number_list_group').width((list_size + 4) * 9 + 40);
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
/*			
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
*/         
            // 出た数字の表示処理
            roulette.$bing_number
            // 一旦非表示
            .hide()
            // idを回転用から表示用に変更
            .attr('id', 'bing_number_decide')
            // その隙に数字を入れておく
            .text(roulette.toHoleStr(roulette.number))
            // フェードインさせる
            .fadeIn(roulette.FADEIN_SPEED);
            
	    // 英数字を同じようにフェードイン
/*
            $('#number_english')
            .hide()
            .html(roulette.number_english)
            .fadeIn(roulette.FADEIN_SPEED);
*/            
            // 出た数を保存
            roulette.past_number_list[roulette.number] = roulette.number;

			// 内部情報の更新
			// 　候補配列から選択された値および関連する値を削除
			refreshRouletteNumber(roulette.number);

			// ここで過去に出た数字を表示
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
			roulette.hcholes.push(roulette.number);  // ログ用
			console.log(roulette.hcholes);

			roulette.remainFixedNumber(roulette.number);
			roulette.callback(roulette.subCourses);
        }
        else {
            // ストップされなかったら数字を表示するだけ
            roulette.$bing_number.text(roulette.toHoleStr(roulette.rand));
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
	init : function(subCourses, func, target) {
		roulette.$root = $("#" + target);
		roulette.subCourses = subCourses;
		roulette.BING_NUMBER = subCourses.length * 9;
		roulette.callback = func;
		roulette.initHoleInfo();
		roulette.hcholes = [];
/*
		{
			csubid : 0,
			hcholes : [],
		};
*/		

		// 2つのsubCourceの1ホール目のホール名が同じだった場合、区別するために
		// 表示するホール名を サブコース名+ホール番号 にする。(holestr_use = true)
		if (subCourses.length > 1) {
			if (subCourses[0].names[0] == subCourses[1].names[0]) {
				roulette.holestr_use = true;
			}
		}
	},

	initHoleInfo : function() {
		roulette.numbers = [];
		for (var i = 0; i < roulette.subCourses.length; i++) {
            roulette.numbers[i] = {};
			roulette.numbers[i].long_numbers = [];
			roulette.numbers[i].middle_numbers = [];
			roulette.numbers[i].short_numbers  = [];
			roulette.subCourses[i].selected = [];

			for (var j = 0; j < roulette.BING_NUMBER_HALF; j++) {
				if (roulette.subCourses[i].pars[j] == 3) {
					roulette.numbers[i].short_numbers.push(j+1);
				} else if (roulette.subCourses[i].pars[j] == 5) {
					roulette.numbers[i].long_numbers.push(j+1);
				} else {
					roulette.numbers[i].middle_numbers.push(j+1);
				}
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
		for (var i = 0; i < roulette.subCourses.length; i++) {
			roulette.numbers[i].total_selcount = 0;
			roulette.numbers[i].long_selcount = 0;
			roulette.numbers[i].short_selcount  = 0;
			roulette.numbers[i].middle_selcount  = 0;
		}

        roulette.select_number_list = [];
        for (var i = 0; i < roulette.BING_NUMBER; i++) {
            roulette.select_number_list.push(i+1);
        }
		roulette.initRoulette();

		if (handys != null && handys.length > 0) {
			for (var i = 0; i < roulette.subCourses.length; i++) {
				handys[i].selected = convertFromO(handys[i].pars);
				if (handys[i].selected != null) {
					if (handys[i].selected.length > 0) {
						for (var j = 0; j < handys[i].selected.length; j++) {
							refreshRouletteNumber(i * roulette.BING_NUMBER_HALF + handys[i].selected[j]);
							displaySelectHoleNumber(i * roulette.BING_NUMBER_HALF + handys[i].selected[j], false);
						}
					}
				}
			}	
		}			

		$('#exe_button').off('click')
			.on('click', roulette.execute);
		$(".ui-dialog").off('dialogclose')
			.on('dialogclose', closeRulette );
	},

	toHoleStr : function(number) {
		if (roulette.holestr_use == true) {
			var scn = parseInt((number - 1) / roulette.BING_NUMBER_HALF);
			var mod = (number - 1) % roulette.BING_NUMBER_HALF;
			return roulette.subCourses[scn].csubname.substring(0,1) + (mod + 1)
		} else {
			return roulette.toHoleName(number);
		}
	},

	toHoleName : function(number) {
		var scn = parseInt((number - 1) / roulette.BING_NUMBER_HALF);
		var mod = (number - 1) % roulette.BING_NUMBER_HALF;
		return roulette.subCourses[scn].names[mod];
	},

	remainFixedNumber : function(number) {
		var scn = parseInt((number - 1) / roulette.BING_NUMBER_HALF);
		var holeNumber = (number - 1) % roulette.BING_NUMBER_HALF + 1;
		 roulette.subCourses[scn].selected.push(holeNumber);
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
	var scn = parseInt((holeNumber - 1) / roulette.BING_NUMBER_HALF);
	var holeNumber2 = (holeNumber - 1) % roulette.BING_NUMBER_HALF + 1;
	
	roulette.numbers[scn].total_selcount++;
	if (roulette.numbers[scn].total_selcount > 5) {
			for (var i = 1; i < 10; i++) {
				roulette.sliceNumber(scn * roulette.BING_NUMBER_HALF + i);
			}
	} else {
		if (isInNumber(roulette.numbers[scn].long_numbers, holeNumber2)) {
			roulette.numbers[scn].long_selcount++;
			for (var i = 0; i < roulette.numbers[scn].long_numbers.length; i++) {
				roulette.sliceNumber(scn * roulette.BING_NUMBER_HALF + roulette.numbers[scn].long_numbers[i]);
			}
		}  else 	if (isInNumber(roulette.numbers[scn].short_numbers, holeNumber2)) {
			roulette.numbers[scn].short_selcount++;
			for (var i = 0; i < roulette.numbers[scn].short_numbers.length; i++) {
				roulette.sliceNumber(scn * roulette.BING_NUMBER_HALF + roulette.numbers[scn].short_numbers[i]);
			}
		} else {
			roulette.numbers[scn].middle_selcount++;
			if (roulette.numbers[scn].middle_selcount > 3) {
				for (var i = 0; i < roulette.numbers[scn].middle_numbers.length; i++) {
					roulette.sliceNumber(scn * roulette.BING_NUMBER_HALF + roulette.numbers[scn].middle_numbers[i]);
				}
			}
		}
	}
}

// @add iwa
function displaySelectHoleNumber(holeNumber, anim) {
	var scn = parseInt((holeNumber - 1) / roulette.BING_NUMBER_HALF);
	var mod = (holeNumber - 1) % roulette.BING_NUMBER_HALF;

	var textcolor = "black";
	if (roulette.subCourses[scn].pars[mod] == 3) {
		textcolor = "yellow";
	} else if (roulette.subCourses[scn].pars[mod] == 5) {
		textcolor = "red";
	}

	if (anim) {
		$(roulette.$past_number_ul[scn][0].childNodes[mod]).hide().text(roulette.toHoleName(holeNumber)).css("color", textcolor).fadeIn(1000);
	} else {
		$(roulette.$past_number_ul[scn][0].childNodes[mod]).hide().text(roulette.toHoleName(holeNumber)).css("color", textcolor).show();
	}
}

// @add iwa
function closeRulette() {
	callback_calc();
}

function closeDialog() {
	roulette.$root.dialog("close");
}

