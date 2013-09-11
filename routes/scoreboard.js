
/*
 * GET scoreboard page.
 */

exports.scoreboard = function(req, res){
  res.render('scoreboard', { title: 'WakuWaku Leaders Board' });
};
