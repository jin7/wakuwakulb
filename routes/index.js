
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index',
    {
      title: 'WakuWaku Leaders Board',
      rid: req.query.rid
    }
  );
};
