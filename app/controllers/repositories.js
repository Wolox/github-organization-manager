const github = require('../services/github'),
  config = require('../../config');

exports.new = (req, res, next) => {
  const name = req.query.name;
  const privateRepo = req.query.private === 'true';
  const DEVELOPMENT_BRANCH_NAME = 'development';
  // const name = req.body.name;
  // const privateRepo = req.body.private;

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
        // throw in_private_repos_limit_error
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
      // debugger;
      res.status(200);
      res.send(repo);
    })
    .catch(next);
};

// exports.init = (req, res, next) => {
//   const name = req.query.name;
//   const privateRepo = req.query.private === 'true';
//   // const name = req.body.name;
//   // const privateRepo = req.body.private;
//
//   github.getPrivateReposCount().then(privateRepositoriesCount => {
//     debugger;
//     if (privateRepositoriesCount < config.common.github.private_repositories_limit) {
//       return github.createRepository({
//         name,
//         privateRepo
//       });
//     }
//   });
// };
//
// exports.step1 = (req, res, next) => {
//   github.step1();
// };
//
// exports.step2 = (req, res, next) => {
//   github.step2(req.query.otp);
// };
