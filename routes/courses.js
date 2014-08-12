module.exports = {
  // コース情報一覧取得
  index: function(req, res) {
    Course.find().exec(function(err, courses) {
      if (!err && courses != null && courses.length > 0) {
        responseSuccess(res, courses);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // コース情報追加
  create: function(req, res) {
    console.log(req.body);
    var newCourse = new Course(req.body);
    newCourse.save(function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  },
  // コース情報取得
  show: function(req, res) {
    Course.findOne({ 'cid': req.params.cid },
      function(err, course) {
        if (!err) {
          responseSuccess(res, course);
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // コース情報更新
  update: function(req, res) {
    Course.findOne({ 'cid': req.params.cid },
      function(err, course) {
        if (!err) {
          if (course) {
            if (course.body.cname) {
              course.cname = req.body.cname;
            }
            if (course.body.holeinfs) {
              course.holeinfs = req.body.holeinfs;
            }
            course.save(function(err) {
              if (!err) {
                responseSuccess(res);
              } else {
                responseError(500, res, err);
              }
            });
          } else {
            responseError(404, res);
          }
        } else {
          responseError(500, res, err);
        }
      });
  },
  destroy: function(req, res) {
    console.log('cid=' + req.params.cid);
    Course.remove({ 'cid': req.params.cid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};
