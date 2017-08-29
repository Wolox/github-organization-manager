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
  const name = req.body.teamId;
  const teamManagerGithubUser = req.body.teamManagerGithubUser;
  const token = req.body.token;

  github
    .createTeam({ name, teamManagerGithubUser })
    .then(teamName => {
      res.status(200);
      res.send({ name: teamName });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};
