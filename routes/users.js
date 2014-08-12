module.exports = {
  // ユーザー情報一覧取得
  index: function(req, res) {
    User.find().exec(function(err, users) {
      if (!err && users != null && users.length > 0) {
        responseSuccess(res, users);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // ユーザー情報追加
  create: function(req, res) {
    console.log(req.body);
    var newUser = new User(req.body);
    newUser.save(function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  },
  // ユーザー情報取得
  show: function(req, res) {
    User.findOne({ 'tid': req.params.uid },
      function(err, user) {
        if (!err) {
          responseSuccess(res, user);
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // ユーザー情報更新
  update: function(req, res) {
    User.findOne({ 'uid': req.params.uid },
      function(err, user) {
        if (!err) {
          if (user) {
            if (req.body.uname) {
              user.uname = req.body.uname;
            }
            if (req.body.brthdy) {
              user.brthdy = req.body.brthdy;
            }
            if (req.body.mail) {
              user.mail = req.body.mail;
            }
            if (req.body.sex) {
              user.sex = req.body.sex;
            }
            if (req.body.uimg) {
              user.uimg = req.body.uimg;
            }
            user.save(function(err) {
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
  // ユーザー情報削除
  destroy: function(req, res) {
    console.log('uid=' + req.params.uid);
    User.remove({ 'uid': req.params.uid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};
