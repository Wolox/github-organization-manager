const express = require('express'),
  bodyParser = require('body-parser'),
  rollbar = require('rollbar'),
  morgan = require('morgan'),
  path = require('path'),
  config = require('./config'),
  routes = require('./app/routes'),
  errors = require('./app/middlewares/errors'),
  DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024 * 10,
  DEFAULT_PARAMETER_LIMIT = 10000;

const bodyParserJsonConfig = () => ({
  parameterLimit: config.common.api.parameterLimit || DEFAULT_PARAMETER_LIMIT,
  limit: config.common.api.bodySizeLimit || DEFAULT_BODY_SIZE_LIMIT
});

const bodyParserUrlencodedConfig = () => ({
  extended: true,
  parameterLimit: config.common.api.parameterLimit || DEFAULT_PARAMETER_LIMIT,
  limit: config.common.api.bodySizeLimit || DEFAULT_BODY_SIZE_LIMIT
});

const init = () => {
  const app = express();
  const port = config.common.port || 8080;
  module.exports = app;

  app.use('/docs', express.static(path.join(__dirname, 'docs')));

  // Client must send "Content-Type: application/json" header
  app.use(bodyParser.json(bodyParserJsonConfig()));
  app.use(bodyParser.urlencoded(bodyParserUrlencodedConfig()));

  if (!config.isTesting) {
    morgan.token('req-params', req => req.params);
    app.use(
      morgan(
        '[:date[clf]] :remote-addr - Request ":method :url" with params: :req-params. Response status: :status.'
      )
    );
  }

  routes.init(app);

  app.use(errors.handle);
  app.use(
    rollbar.errorHandler(config.common.rollbar.accessToken, {
      enabled: !!config.common.rollbar.accessToken,
      environment: config.environment
    })
  );

  app.listen(port);
  console.log(`Listening on port: ${port}`); // eslint-disable-line
};
init();
