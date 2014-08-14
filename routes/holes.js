module.exports = {
  // ホール情報一覧取得
  index: function(req, res) {
    Hole.find().exec(function(err, holes) {
      if (!err && holes != null && holes.length > 0) {
        responseSuccess(res, holes);
      } else {
        responseError(500, res, err);
      }
    });
  },
  new: function(req, res) {
    responseError(501, res);
  },
  // ホール情報追加
  create: function(req, res) {
    console.log(req.body);
    var newHole = new Hole(req.body);
    if (isNullOrEmpty(newHole.csubname)) {
      responseError(400, res, "invalid:csubname");
      return;
    }
    if (isNullOrEmpty(newHole.names) || newHole.names.length != 9) {
      responseError(400, res, "invalid:names");
      return;
    }
    if (isNullOrEmpty(newHole.pars) || !isValidPars(newHole.pars)) {
      responseError(400, res, "invalid:pars");
      return;
    }
    createCsubid(function(csubid) {
      newHole.csubid = csubid;
      newHole.save(function(err) {
        if (!err) {
          responseSuccess(res);
        } else {
          responseError(500, res, err);
        }
      });
    });
  },
  // ホール情報取得
  show: function(req, res) {
    Hole.findOne({ 'csubid': req.params.csubid },
      function(err, hole) {
        if (!err) {
          if (hole) {
            responseSuccess(res, hole);
          } else {
            responseError(404, res);
          }
        } else {
          responseError(500, res, err);
        }
      });
  },
  edit: function(req, res) {
    responseError(501, res, err);
  },
  // ホール情報更新
  update: function(req, res) {
    if (isNullOrEmpty(req.params.csubid)) {
      responseError(400, res, "invalid:csubid");
      return;
    }
    if (isNullOrEmpty(req.body.csubname)) {
      responseError(400, res, "invalid:csubname");
      return;
    }
    if (isNullOrEmpty(req.body.names) || req.body.names.length != 9) {
      responseError(400, res, "invalid:names");
      return;
    }
    if (isNullOrEmpty(req.body.pars) || req.body.pars.length != 9) {
      responseError(400, res, "invalid:pars");
      return;
    }
    Hole.findOne({ 'csubid': req.params.csubid },
      function(err, hole) {
        if (!err) {
          if (hole) {
            if (req.body.csubname) {
              hole.csubname = req.body.csubname;
            }
            if (req.body.names) {
              hole.names = req.body.names;
            }
            if (req.body.pars) {
              hole.pars = req.body.pars;
            }
            hole.save(function(err) {
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
  // ホール情報削除
  destroy: function(req, res) {
    console.log('csubid=' + req.params.csubid);
    Hole.remove({ 'csubid': req.params.csubid }, function(err) {
      if (!err) {
        responseSuccess(res);
      } else {
        responseError(500, res, err);
      }
    });
  }
};
