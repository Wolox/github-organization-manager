const auth = require('./controllers/auth'),
  repositories = require('./controllers/repositories'),
  teams = require('./controllers/teams');

exports.init = app => {
  app.get('/repositories', [], repositories.new);
  app.post('/api/repositories', [], repositories.create);
  app.get('/teams', [], teams.new);
  app.get('/api/teams', [], teams.index);
  app.post('/api/teams', [], teams.create);

  app.post('/auth', [], auth.init);
};
