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
  const DEVELOPMENT_BRANCH_NAME = 'development';

  Promise.resolve()
    .then(() => {
      if (privateRepo) {
        return github.getPrivateReposCount();
      }
      return 0;
    })
    .then(privateRepositoriesCount => {
      if (privateRepositoriesCount < config.common.github.private_repositories_limit) {
        return github.createRepository({
          name,
          privateRepo
        });
      } else {
        return Promise.reject(errors.repoLimitReached);
      }
    })
    .then(repo =>
      github.createBranchFromMaster({
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repo.data.name
      })
    )
    .then(repoName =>
      github.protectBranches({
        branches: ['master', DEVELOPMENT_BRANCH_NAME],
        repo: repoName
      })
    )
    .then(repoName =>
      github.defaultBranch({
        name: DEVELOPMENT_BRANCH_NAME,
        repo: repoName
      })
    )
    .then(repo => {
      res.status(200);
      res.render('index', {
        name: repo.data.name,
        link: repo.data.html_url
      });
    })
    .catch(err => {
      res.status(400);
      res.render('index', {
        error: err.internalError ? err : JSON.parse(err.message)
      });
    });
};
