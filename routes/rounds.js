module.exports = {
  // ラウンド情報一覧取得
  index: function(req, res) {
    Round.find().exec(function(err, rounds) {
      if (!err && rounds != null && rounds.length > 0) {
        responseSuccess(res, rounds);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // ラウンド情報追加
  create: function(req, res) {
    console.log(req.body);
    var newRound = new Round(req.body);
    newRound.save(function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  },
  // ラウンド情報取得
  show: function(req, res) {
    Round.findOne({ 'rid': req.params.rid },
      function(err, round) {
        if (!err) {
          responseSuccess(res, round);
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // ラウンド情報更新
  update: function(req, res) {
    Round.findOne({ 'rid': req.params.rid },
      function(err, round) {
        if (!err) {
          if (round) {
            if (req.body.rname) {
              round.rname = req.body.rname;
            }
            if (req.body.cid) {
              round.cid = req.body.cid;
            }
            if (req.body.csubids) {
              round.csubids = req.body.csubids;
            }
            if (req.body.handicapinf) {
              round.handicapinf = req.body.handicapinf;
            }
            if (req.body.date) {
              round.date = req.body.date;
            }
            if (req.body.time) {
              round.time = req.body.time;
            }
            if (req.body.prtyifs) {
              round.prtyifs = req.body.prtyifs;
            }
            round.save(function(err) {
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
  // ラウンド情報削除
  destroy: function(req, res) {
    console.log('rid=' + req.params.rid);
    Round.remove({ 'rid': req.params.rid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};
