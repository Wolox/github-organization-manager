const repositories = require('./controllers/repositories');

exports.init = app => {
  app.get('/new', [], repositories.new);
  // app.get('/step1', [], repositories.step1);
  // app.get('/step2', [], repositories.step2);
};
