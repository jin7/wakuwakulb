module.exports = {
  // コース情報一覧取得
  index: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Course.find().exec(function(err, courses) {
        if (!err && courses != null && courses.length > 0) {
          responseSuccess(res, courses);
        } else {
          responseError(500, res, err);
        }
      });
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // コース情報追加
  create: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
        console.log(req.body);
        var newCourse = new Course(req.body);
        if (isNullOrEmpty(newCourse.cname)) {
          responseError(400, res, "invalid:cname");
          return;
        }
        isValidHoleinfs(newCourse.holeinfs, function(isValid) {
          if (isValid) {
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
          } else {
            responseError(400, res, "invalid:holeinfs");
          }
        });
    });
  },
  // コース情報取得
  show: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Course.findOne({ 'cid': req.params.cid },
        function(err, course) {
          if (!err) {
            if (course) {
              responseSuccess(res, course);
            } else {
              responseError(404, res);
            }
          } else {
            responseError(500, res, err);
          }
        });
    });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // コース情報更新
  update: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      if (isNullOrEmpty(req.params.cid)) {
        responseError(400, res, "invalid:cid");
        return;
      }
      if (isNullOrEmpty(req.body.cname)) {
        responseError(400, res, "invalid:cname");
        return;
      }
      isValidHoleinfs(req.body.holeinfs, function(isValid) {
        if (!isValid) {
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
        });
    });
  },
  destroy: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log('cid=' + req.params.cid);
      Course.remove({ 'cid': req.params.cid }, function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
    });
  }
};
