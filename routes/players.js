module.exports = {
  // プレーヤー情報一覧取得
  index: function(req, res) {
    Player.find().exec(function(err, players) {
      if (!err && players != null && players.length > 0) {
        responseSuccess(res, players);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // プレーヤー情報追加
  create: function(req, res) {
    console.log(req.body);
    var newPlayer = new Player(req.body);
    createPlid(function(plid) {
      newPlayer.plid = plid;
      newPlayer.save(function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
    });
  },
  // プレーヤー情報取得
  show: function(req, res) {
    Player.findOne({ 'plid': req.params.plid },
      function(err, player) {
        if (!err) {
          responseSuccess(res, player);
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // プレーヤー情報更新
  update: function(req, res) {
    Player.findOne({ 'plid': req.params.plid },
      function(err, player) {
        if (!err) {
          if (player) {
            if (req.body.rid) {
              player.rid = req.body.rid;
            }
            if (req.body.uid) {
              player.uid = req.body.uid;
            }
            if (req.body.tid) {
              player.tid = req.body.tid;
            }
            if (req.body.csubids) {
              player.csubids = req.body.csubids;
            }
            player.save(function(err) {
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
  // プレーヤー情報削除
  destroy: function(req, res) {
    console.log('plid=' + req.params.plid);
    Player.remove({ 'plid': req.params.plid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};