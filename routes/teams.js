module.exports = {
  // チーム情報一覧取得
  index: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Team.find().exec(function(err, teams) {
        if (!err && teams != null && teams.length > 0) {
          responseSuccess(res, teams);
        } else {
          responseError(500, res, err);
        }
      });
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // チーム情報追加
  create: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log(req.body);
      if (isNullOrEmpty(req.body.tname)) {
        responseError(400, res, "invalid:tname");
        return;
      }
      var newTeam = new Team(req.body);
      createTid(function(tid) {
        newTeam.tid = tid;
        newTeam.save(function(err) {
          if (!err) {
            responseSuccess(res);
          } else {
            responseError(500, res, err);
          }
        });
      });
    });
  },
  // チーム情報取得
  show: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Team.findOne({ 'tid': req.params.tid },
        function(err, team) {
          if (!err) {
            if (team) {
              responseSuccess(res, team);
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
  // チーム情報更新
  update: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Team.findOne({ 'tid': req.params.tid },
        function(err, team) {
          if (!err) {
            if (team) {
              if (req.body.tname) {
                team.tname = req.body.tname;
              }
              if (req.body.timg) {
                team.timg = req.body.timg;
              }
              team.save(function(err) {
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
  },
  // チーム情報削除
  destroy: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log('tid=' + req.params.tid);
      Team.remove({ 'tid': req.params.tid }, function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
    });
  }
};
