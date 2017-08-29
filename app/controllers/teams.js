const github = require('../services/github'),
  config = require('../../config'),
  errors = require('../errors');

exports.new = (req, res, next) => {
  res.status(200);
  res.render('teams');
};

exports.index = (req, res, next) => {
  const token = req.query.token;
  github
    .getTeams(token)
    .then(teams => {
      res.status(200);
      res.send({ teams });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};

exports.create = (req, res, next) => {
  const name = req.body.name;
  const token = req.body.token;

  github
    .createTeam({ name })
    .then(team => {
      res.status(200);
      res.send({ team });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};

exports.addTeamToRepo = (req, res, next) => {
  const teamId = req.params.teamId;
  const repoName = req.params.repo;
  const token = req.body.token;

  github
    .addTeamToRepo(teamId, repoName)
    .then(result => {
      res.status(200);
      res.send({ result });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};
