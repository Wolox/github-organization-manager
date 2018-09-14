const github = require('../services/github'),
  logger = require('../logger'),
  config = require('../../config'),
  errors = require('../errors');

exports.new = (req, res, next) => {
  res.status(200);
  res.render('teams');
};

exports.index = (req, res, next) => {
  const token = req.query.token;

  logger.info(`Searching teams: ${req.query}`);

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
  const { name, token } = req.body;

  github
    .createTeam(token, { name })
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
  const { teamId, repo } = req.params;

  github
    .addTeamToRepo(req.body.token, { teamId, repo })
    .then(result => {
      res.status(200);
      res.send({ result });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};

exports.addMemberToTeam = (req, res, next) => {
  const { teamId, username } = req.params;
  const { token, maintainer } = req.body;

  github
    .addMemberToTeam(token, { teamId, username, maintainer })
    .then(result => {
      res.status(200);
      res.send({ result });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};
