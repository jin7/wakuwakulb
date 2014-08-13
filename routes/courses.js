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
    if (isNullOrEmpty(newCourse.cname)) {
      responseError(400, res, "invalid:cname");
      return;
    }
    if (isNullOrEmpty(newCourse.holeinfs) || newCourse.holeinfs.length < 2) {
      responseError(400, res, "invalid:holeinfs");
      return;
    }
    createCid(function(cid) {
      newCourse.cid = cid;
      newCourse.save(function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
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
    if (isNullOrEmpty(req.params.cid)) {
      responseError(400, res, "invalid:cid");
      return;
    }
    if (isNullOrEmpty(req.body.cname)) {
      responseError(400, res, "invalid:cname");
      return;
    }
    if (isNullOrEmpty(req.body.holeinfs) || req.body.holeinfs.length < 2) {
      responseError(400, res, "invalid:holeinfs");
      return;
    }
    Course.findOne({ 'cid': req.params.cid },
      function(err, course) {
        if (!err) {
          if (course) {
            if (req.body.cname) {
              course.cname = req.body.cname;
            }
            if (req.body.holeinfs) {
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
