const logger = require('../logger');
const TechLeader = require('../models').techleader;

exports.validateTlToken = (error, req, res, next) => {
  logger.info(`Validating TL: ${req.data.tlToken || req.query.tlToken}`);
  if (!req.data.tlToken && !req.query.tlToken) {
    next();
    return;
  }
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
