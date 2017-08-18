const github = require('../services/github'),
  config = require('../../config'),
  errors = require('../errors');

exports.new = (req, res, next) => {
  res.status(200);
  res.render('index');
};

exports.create = (req, res, next) => {
  const name = req.body.name;
  const privateRepo = !!req.body.private;
  const token = req.body.token;
  const DEVELOPMENT_BRANCH_NAME = 'development';

  Promise.resolve()
    .then(() => {
      if (privateRepo) {
        return github.getPrivateReposCount(token);
      }
      return 0;
    })
    .then(privateRepositoriesCount => {
      if (privateRepositoriesCount < config.common.github.private_repositories_limit) {
        return github.createRepository({
          name,
          privateRepo,
          token
        });
      } else {
        return Promise.reject(errors.repoLimitReached);
      }
    })
    .then(repo =>
      github.createBranchFromMaster({
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repo.data.name,
        token
      })
    )
    .then(repoName =>
      github.protectBranches({
        branches: ['master', DEVELOPMENT_BRANCH_NAME],
        repo: repoName,
        token
      })
    )
    .then(repoName =>
      github.defaultTeams({
        repo: repoName,
        token
      })
    )
    .then(repoName =>
      github.defaultBranch({
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repoName,
        token
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
