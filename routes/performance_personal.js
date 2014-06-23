
/*
 * GET performance_personal page.
 */

exports.performance_personal = function(req, res){
  res.render('performance_personal',
    {
       hide: req.query.hide,
    }
  );
};
