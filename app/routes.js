const repositories = require('./controllers/repositories');

exports.init = app => {
  app.get('/repositories', [], repositories.new);
  app.post('/repositories', [], repositories.create);
};
