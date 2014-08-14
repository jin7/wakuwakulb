
/*
 * GET setting home page.
 */

exports.setting = function(req, res){
  res.render('setting', { title: 'WakuWaku Leaders Board Setting API Explorer' });
};
