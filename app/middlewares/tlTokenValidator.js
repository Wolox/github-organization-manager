const logger = require('../logger');
const TechLeader = require('../models').techleader;

exports.conditionalValidateTlToken = cond => (req, res, next) => {
  if (cond(req)) {
    exports.validateTlToken(req, res, next);
  } else {
    next();
  }
};

exports.validateTlToken = (req, res, next) => {
  const tlToken = (req.body && req.body.tlToken) || (req.query && req.query.tlToken);
  if (!tlToken) {
    next();
    return;
  }
  logger.info(`Validating TL: ${tlToken}`);
  TechLeader.getByToken(tlToken)
    .then(tl => {
      if (tl) {
        logger.info(`TL found ${tl.name}`);
        if (req.body) {
          req.body.token = process.env.ADMIN_TOKEN;
        }
        if (req.query) {
          req.query.token = process.env.ADMIN_TOKEN;
        }
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
