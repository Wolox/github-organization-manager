const auth = require('./controllers/auth'),
  repositories = require('./controllers/repositories'),
  teams = require('./controllers/teams');

exports.init = app => {
  app.get('/repositories', [], repositories.new);
  app.post('/api/repositories', [], repositories.create);
  app.post('/api/repositories/:repo/teams/:teamId', [], teams.addTeamToRepo);
  app.get('/teams', [], teams.new);
  app.get('/api/teams', [], teams.index);
  app.post('/api/teams', [], teams.create);
  app.post('/api/teams/:teamId/members/:username', [], teams.addMemberToTeam);

  app.post('/auth', [], auth.init);
};
