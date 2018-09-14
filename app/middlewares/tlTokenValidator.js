const logger = require('../logger');
const TechLeader = require('../models').techleader;

exports.validateTlToken = (error, req, res, next) => {
  if (!req.data.tlToken && !req.query.tlToken) {
    next();
    return;
  }
  logger.info(`Searching TL: ${req.data.tlToken || req.query.tlToken}`);
  TechLeader.getByToken(req.data.tlToken || req.query.tlToken)
    .then(tl => {
      if (tl) {
        logger.info(`TL found ${tl.name}`);
        req.data.token = process.env.ADMIN_TOKEN;
        req.query.token = process.env.ADMIN_TOKEN;
        next();
      } else {
        logger.info('TL not found');
        res.status(401);
        res.end();
      }
    })
    .catch(err => {
      logger.error(err);
      res.status(500);
      res.end();
    });
};
