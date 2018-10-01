const auth = require('./controllers/auth'),
  repositories = require('./controllers/repositories'),
  home = require('./controllers/home'),
  teams = require('./controllers/teams'),
  routesPermissions = require('./services/routesPermissions'),
  tlTokenValidator = require('./middlewares/tlTokenValidator');

exports.init = app => {
  app.get('/repositories', [], repositories.new);
  app.get('/teams', [], teams.new);
  app.get('/', [], home.index);

  app.get('/api/repositories/private', [], repositories.getPrivate);
  app.post(
    '/api/repositories',
    [tlTokenValidator.conditionalValidateTlToken(routesPermissions.tlCanCreateRepo)],
    repositories.create
  );
  app.post('/api/repositories/:repo/teams/:teamId', [tlTokenValidator.validateTlToken], teams.addTeamToRepo);

  app.get('/api/teams', [tlTokenValidator.validateTlToken], teams.index);
  app.post('/api/teams', [tlTokenValidator.validateTlToken], teams.create);
  app.post('/api/teams/:teamId/members/:username', [tlTokenValidator.validateTlToken], teams.addMemberToTeam);

  app.post('/auth', [], auth.init);
};
