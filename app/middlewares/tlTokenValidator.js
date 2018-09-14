const TechLeader = require('../models').techleader;

exports.validateTlToken = (error, req, res, next) => {
  if (!req.data.tlToken && !req.query.tlToken) {
    next();
    return;
  }
  TechLeader.getByToken(req.data.tlToken || req.query.tlToken)
    .then(tl => {
      if (tl) {
        req.data.token = process.env.ADMIN_TOKEN;
        req.query.token = process.env.ADMIN_TOKEN;
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
