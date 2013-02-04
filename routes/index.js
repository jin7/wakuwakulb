
/*
 * GET home page.
 */

var model = require('../model');
var Score = model.Score;

exports.index = function(req, res){
  res.render('index', { title: 'WakuWaku Leaders Board' });
};

exports.inputscore = function(req, res) {
  var newScore = new Score(req.body);
  var oldScore;
  Score.findOne({ 'uid': req.body.uid }, function (err, score) {
    // score
    oldScore = score;
  });
  newScore.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      // 個人順位通知
      res.redirect('/pscore.js');
    }
  });
};

