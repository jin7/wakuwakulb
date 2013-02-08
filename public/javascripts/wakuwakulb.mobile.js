var rid=1;
var uid;
var uname;
var curHole;
var curParNum;
var curScore;

var lb;

// �y�[�W�����������i�l���ʁj
$(document).delegate("#rank_personal", "pageinit", function() {
	$(".ui-slider").width(100);
});

// �y�[�W�����������i�`�[�����ʁj
$(document).delegate("#rank_team", "pageinit", function() {
	$(".ui-slider").width(100);
});

// �y�[�W�����������i�X�R�A�j
$(document).delegate("#score", "pageinit", function() {
	
});

// �y�[�W�����������i�X�R�A���̓_�C�A���O�j
$(document).delegate("#inputscore", "pageinit", function() {
	var desc;
	desc = "(Hole:" + curHole + " par:" + curParNum + ")";
	$("span#inputscore-desc").text(desc)

	if (curScore > 0) {
		$("#selectscore").val(curScore);
		$("#selectscore").selectmenu("refresh",true);
	}
/*
	var i, target, str;
	for (i = 1; i < 16; i++) {
		target = "select#selectscore option[value='" + i + "']";
		if (i == 1) {
			str = "Hole In One";
		} else if (i == (curParNum - 3)) {
			str = "Albatros";
		} else if (i == (curParNum - 2)) {
			str = "Eagle";
		} else if (i == (curParNum - 1)) {
			str = "Birdie";
		} else if (i = curParNum) {
			str = "Par";
		} else if (i == (curParNum + 1)) {
			str = "Boggy";
		} else if (i == (curParNum + 2)) {
			str = "Double Boggy";
		} else if (i == (curParNum + 3)) {
			str = "Triple Boggy";
		} else {
			str = curParNum;
		}
		if (i <= curParNum * 3) { 
			$(target).text(str);
//			$(target).show();
		} else {
//			$(target).hide();
		}
	}	
*/	
});


$(function() {

	// leadersboard�ڑ�
	lb = new io.connect("/leadersboard");
	lb.on("connect", function() {
	});
	lb.on("personalscore", function(data) {
		alert(data);
	});

	// cookie������擾
	uid = $.cookie("uid")
	uname = $.cookie("uname")

	// ���O�C���f�t�H���g�ݒ�
	if (uid != null) {
		$("#player-name").val(uid);
		$("#player-name").selectmenu("refresh",true);
	}

	//�y�C�x���g�z���O�C�� - OK
    $("#login-ok").click(function(event) {
    	uid = $("#player-name option:selected").attr("value");
    	uname = $("#player-name option:selected").text();

		// uid��cookie�� -> ����f�t�H���g
    	$.cookie("uid", uid, { expires: 1 });
    	$.cookie("uname", uname, { expires: 30 });

		// ���̉�ʂ�
    	location.href = "#rank_personal";
    });

	//�y�C�x���g�z �X�R�A���̓_�C�A���O�\��
    $(".holescore").click(function(event) {
		curHole = $("h1.hole", this).text().replace("H", "");
		curParNum = $("p.par", this).text().replace("par ", "");
		curScore = $("span.score", this).text();
    	$("#showinputdialog").click();
    });

	//�y�C�x���g�z �X�R�A���̓_�C�A���O - OK
    $("#dlg-ok").click(function(event) {
    	curScore = $("#selectscore").val();
    	inputScore(lb, "1", uid, curHole, curScore);
    	$(".ui-dialog").dialog("close");
    });
});

// �X�R�A����
function inputScore(lb, rid, uid, holeno, score) {
	lb.emit('score', { rid: rid, uid: uid, holeno: holeno, score: score });
}


