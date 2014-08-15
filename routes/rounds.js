module.exports = {
  // ラウンド情報一覧取得
  index: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Round.find().exec(function(err, rounds) {
        if (!err && rounds != null && rounds.length > 0) {
          responseSuccess(res, rounds);
        } else {
          responseError(500, res, err);
        }
      });
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // ラウンド情報追加
  create: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log("create round start:" + req.body);
      var newRound = new Round(req.body);
      if (isNullOrEmpty(newRound.rname)) {
        responseError(400, res, "invalid:rname");
        return;
      }
      if (isNullOrEmpty(newRound.handicapinf) || !isValidHandicapMethod(newRound.handicapinf.method)) {
        responseError(400, res, "invalid:handicapinf.method");
        return;
      }
      if (isNullOrEmpty(newRound.handicapinf) || !isValidHandicapUpperLimit(newRound.handicapinf.upperLimit)) {
        responseError(400, res, "invalid:handicapinf.upperLimit");
        return;
      }
      if (isNullOrEmpty(newRound.prtyifs)) {
        responseError(400, res, "invalid:prtyifs");
        return;
      }
      var async = require('async');
      var pids;
      async.series([
        // cid チェック
        function(next) {
          isValidCid(newRound.cid, function(isValid) {
            if (!isValid) {
              next(400, "invalid:cid");
            } else {
              next(null);
            }
          });
        },
        // csubids チェック
        function(next) {
          isValidHoleinfs(newRound.csubids, function(isValid) {
            if (!isValid) {
              next(400, "invalid:csubids");
            } else {
              next(null);
            }
          });
        },
        // prtyifs 内、plyrifs(plid) チェック
        function(next) {
          async.forEach(newRound.prtyifs, function(prtyif, cb) {
            // plid チェック
console.log("prtyif=" + prtyif);
            isValidPlids(prtyif.plyrifs, function(isValid) {
  //console.log("isValidPlids finished.");
              if (!isValid) {
                cb(400, "invalid:plyrifs(plid)");
              } else {
                cb(null);
              }
            });
          }, function(err, results) {
            if (err) {
              next(err, results);
            } else {
              next(null);
            }
          });
        },
        // prtyifs 内、csubids(csubid) チェック
        function(next) {
          async.forEach(newRound.prtyifs, function(prtyif, cb) {
            // csubid チェック
            isValidHoleinfs(prtyif.csubids, function(isValid) {
              if (!isValid) {
                next(400, "invalid:prtyif.csubids(csubid)");
              } else {
                next(null);
              }
            });
          }, function(err, results) {
            if (err) {
              next(err, results);
            } else {
              next(null);
            }
          });
        },
        // pid 作成
        function(next) {
          createPid(newRound.prtyifs.length, function(retPids) {
            pids = retPids;
            next(null);
          });
        },
        // rid 作成
        function(next) {
          createRid(function(rid) {
            newRound.rid = rid;
            next(null);
          });
        },
        // プレーヤー情報へ rid を埋め込む、パーティ情報に pid を埋め込む
        function(next) {
          var prtyifs = newRound.prtyifs;
          embedRidInPlayer(newRound.rid, prtyifs, function(isSucceed) {
            if (!isSucceed) {
              next(500, "embed rid failed.");
            } else {
              for (i = 0, l = prtyifs.length; i < l; i++) {
                prtyifs[i].cid = newRound.cid;
                prtyifs[i].pid = pids[i];
                prtyifs[i].rid = newRound.rid;
                prtyifs[i].number = i + 1;
                newRound.save(function(err) {
                  if (err) {
                    next(500, err);
                  }
                });
              }
              next(null);
            }
          });
        }
      ], function complete(err, msg) {
        if (err) {
          responseError(err, res, msg);
        } else {
          responseSuccess(res);
        }
      });
    });
  },
  // ラウンド情報取得
  show: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      Round.findOne({ 'rid': req.params.rid },
        function(err, round) {
          if (!err) {
            if (round) {
              responseSuccess(res, round);
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
  // ラウンド情報更新
  update: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log("update round start:" + req.body);
      if (isNullOrEmpty(req.params.rid)) {
        responseError(400, res, "invalid:rid");
        return;
      }
      if (isNullOrEmpty(req.body.rname)) {
        responseError(400, res, "invalid:rname");
        return;
      }
      if (isNullOrEmpty(req.body.cid)) {
        responseError(400, res, "invalid:cid");
        return;
      }
      if (isNullOrEmpty(req.body.csubids) || req.body.csubids.length < 2) {
        responseError(400, res, "invalid:csubids");
        return;
      }
      if (isNullOrEmpty(req.body.handicapinf) || !isValidHandicapMethod(req.body.handicapinf.method)) {
        responseError(400, res, "invalid:handicapinf.method");
        return;
      }
      if (isNullOrEmpty(req.body.handicapinf) || !isValidHandicapUpperLimit(req.body.handicapinf.upperLimit)) {
        responseError(400, res, "invalid:handicapinf.upperLimit");
        return;
      }
      if (isNullOrEmpty(req.body.prtyifs)) {
        responseError(400, res, "invalid:prtyifs");
        return;
      }
      var async = require('async');
      async.series([
        // rid チェック
        function(next) {
          isValidRid(req.params.rid, function(isValid) {
            if (!isValid) {
              next(400, "invalid:rid");
            } else {
              next(null);
            }
          });
        },
        // cid チェック
        function(next) {
          isValidCid(req.body.cid, function(isValid) {
            if (!isValid) {
              next(400, "invalid:cid");
            } else {
              next(null);
            }
          });
        },
        // csubids チェック
        function(next) {
          isValidHoleinfs(req.body.csubids, function(isValid) {
            if (!isValid) {
              next(400, "invalid:csubids");
            } else {
              next(null);
            }
          });
        },
        // prtyifs 内、plyrifs(plid) チェック
        function(next) {
          async.forEach(req.body.prtyifs, function(prtyif, cb) {
            // plid チェック
  //console.log("prtyif=" + prtyif);
            isValidPlids(prtyif.plyrifs, function(isValid) {
              if (!isValid) {
                cb(400, "invalid:plyrifs(plid)");
              } else {
                cb(null);
              }
            });
          }, function(err, results) {
            if (err) {
              next(err, results);
            } else {
              next(null);
            }
          });
        },
        // prtyifs 内、csubids(csubid) チェック
        function(next) {
          async.forEach(req.body.prtyifs, function(prtyif, cb) {
            // rid 一致チェック
            if (req.params.rid != prtyif.rid) {
              next(400, "invalid:prtyif.rid(unmatch)");
            }
            // cid 一致チェック
            if (req.body.cid != prtyif.cid) {
              next(400, "invalid:prtyif.cid(unmatch)");
            }
            // csubid チェック
            isValidHoleinfs(prtyif.csubids, function(isValid) {
              if (!isValid) {
                next(400, "invalid:prtyif.csubids(csubid)");
              } else {
                next(null);
              }
            });
          }, function(err, results) {
            if (err) {
              next(err, results);
            } else {
              next(null);
            }
          });
        },
        // 更新
        function(next) {
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
                    if (err) {
                      next(500, err);
                    } else {
                      next(null);
                    }
                  });
                } else {
                  next(404, "invalid:rid");
                }
              } else {
                next(500, err);
              }
            });
        }
      ], function complete(err, msg) {
        if (err) {
          responseError(err, res, msg);
        } else {
          responseSuccess(res);
        }
      });
    });
  },
  // ラウンド情報削除
  destroy: function(req, res) {
    isValidKey(req.header('X-W2LBKey'), function(isValid) {
      if (!isValid) {
        responseError(401, res);
        return;
      }
      console.log('rid=' + req.params.rid);
      Round.remove({ 'rid': req.params.rid }, function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
    });
  }
};
