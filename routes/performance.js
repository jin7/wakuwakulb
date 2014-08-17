
/*
 * GET performance page.
 */

exports.performance = function(req, res){
  res.render('performance',
    {
      title: 'WakuWaku Leaders Board',
      rid: req.query.rid
    }
  );
};
