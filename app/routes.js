const auth = require('./controllers/auth'),
  repositories = require('./controllers/repositories');

exports.init = app => {
  app.get('/repositories', [], repositories.new);
  app.post('/repositories', [], repositories.create);

  app.post('/auth', [], auth.init);
};
