const github = require('../services/github'),
  config = require('../../config'),
  errors = require('../errors');

exports.new = (req, res, next) => {
  res.status(200);
  res.render('repositories');
};

exports.create = (req, res, next) => {
  const name = req.body.name;
  const privateRepo = req.body.private !== 'false';
  const forkedRepo = req.body.fork !== 'false';
  const token = req.body.token;
  const DEVELOPMENT_BRANCH_NAME = 'development';

  Promise.resolve()
    .then(() => {
      if (privateRepo && !forkedRepo) {
        return github.getPrivateReposCount(token);
      }
      return 0;
    })
    .then(privateRepositoriesCount => {
      if (forkedRepo) {
        return Promise.resolve({ data: { name } });
      } else if (privateRepositoriesCount < config.common.github.private_repositories_limit) {
        return github.createRepository(token, { name, privateRepo });
      } else {
        return Promise.reject(errors.repoLimitReached);
      }
    })
    .then(repo =>
      github.createBranchFromMaster(token, {
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repo.data.name
      })
    )
    .then(repoName =>
      github.protectBranches(token, {
        branches: ['master', DEVELOPMENT_BRANCH_NAME],
        repo: repoName
      })
    )
    .then(repoName =>
      github.defaultTeams(token, {
        repo: repoName
      })
    )
    .then(repoName =>
      github.defaultBranch(token, {
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repoName
      })
    )
    .then(repo => {
      res.status(200);
      res.send({
        name: repo.data.name,
        link: repo.data.html_url
      });
    })
    .catch(err => {
      res.status(400);
      res.send(err.internalError ? err : JSON.parse(err.message));
    });
};
