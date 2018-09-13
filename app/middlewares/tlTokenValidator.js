const TechLeader = require('../models').techleader;

exports.validateTlToken = (error, req, res, next) => {
  TechLeader.getByToken(req.data.tlToken)
    .then(tl => {
      if (tl) {
        next();
      } else {
        res.status(401);
        res.end();
      }
    })
    .catch(err => {
      console.err(err);
      res.status(500);
      res.end();
    });
};
