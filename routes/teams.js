module.exports = {
  // チーム情報一覧取得
  index: function(req, res) {
    Team.find().exec(function(err, teams) {
      if (!err && teams != null && teams.length > 0) {
        responseSuccess(res, teams);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // チーム情報追加
  create: function(req, res) {
    console.log(req.body);
    if (isNullOrEmpty(req.body.tname)) {
      responseError(400, res, "invalid:tname");
      return;
    }
    var newTeam = new Team(req.body);
//    var newTeam = new Team({ 'tid': req.body.tid ? req.body.tid : "", 'tname': req.body.tname ? req.body.tname : "" });
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
  },
  // チーム情報取得
  show: function(req, res) {
    Team.findOne({ 'tid': req.params.tid },
      function(err, team) {
        if (!err) {
          responseSuccess(res, team);
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // チーム情報更新
  update: function(req, res) {
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
  },
  // チーム情報削除
  destroy: function(req, res) {
    console.log('tid=' + req.params.tid);
    Team.remove({ 'tid': req.params.tid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};
