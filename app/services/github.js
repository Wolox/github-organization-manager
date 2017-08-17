const GitHubApi = require('github'),
  config = require('../../config'),
  errors = require('../errors');

const github = new GitHubApi({
  // debug: true,
  host: 'api.github.com',
  Promise: require('bluebird'),
  timeout: 5000
});

const init = () =>
  github.authenticate({
    type: 'oauth',
    token: config.common.github.token
  });

const getReference = settings => {
  return github.gitdata.getReference({
    owner: config.common.github.organization,
    repo: settings.repo,
    ref: `heads/${settings.name}`
  });
};

exports.createRepository = settings => {
  const name = settings.name;
  const privateRepo = settings.privateRepo;
  init();

  return github.repos.createForOrg({
    auto_init: true,
    org: config.common.github.organization,
    name,
    private: !!privateRepo
  });
};

exports.createBranchFromMaster = settings => {
  const name = settings.name;
  const repo = settings.repo;
  init();

  return getReference({
    repo,
    name: 'master'
  }).then(master =>
    github.gitdata
      .createReference({
        owner: config.common.github.organization,
        ref: `refs/heads/${name}`,
        repo,
        sha: master.data.object.sha
      })
      .then(() => repo)
  );
};

exports.defaultBranch = settings => {
  const name = settings.name;
  const repo = settings.repo;
  init();

  return github.repos.edit({
    default_branch: name,
    owner: config.common.github.organization,
    name: repo,
    repo
  });
};

exports.protectBranches = settings => {
  const branches = settings.branches;
  const repo = settings.repo;
  init();

  if (branches && branches.length) {
    return Promise.all(
      branches.map(branch =>
        github.repos.updateBranchProtection({
          owner: config.common.github.organization,
          repo,
          branch,
          required_status_checks: {
            contexts: [],
            strict: true
          },
          required_pull_request_reviews: {
            dismiss_stale_reviews: true
          },
          enforce_admins: false,
          restrictions: null
        })
      )
    ).then(() => repo);
  } else {
    return Promise.reject(errors.noBranchesSentToProtect);
  }
};

exports.getPrivateReposCount = (page = 1) => {
  init();
  return github.repos
    .getForOrg({
      org: config.common.github.organization,
      type: 'private',
      page
    })
    .then(repos => {
      const privateReposCount = repos.data.reduce((sum, repo) => sum + (repo.fork ? 0 : 1), 0);
      const nextLink = repos.meta.link.substring(
        repos.meta.link.indexOf('<') + 1,
        repos.meta.link.indexOf('>')
      );

      if (nextLink.indexOf('page=1') === -1) {
        return exports.getPrivateReposCount(page + 1).then(count => count + privateReposCount);
      } else {
        return privateReposCount;
      }
    });
};

// exports.step1 = () => {
//   return github.authenticate({
//     type: 'basic',
//     username: config.common.github.username,
//     password: config.common.github.password
//   });
// };
//
// exports.step2 = (otp) => {
//   github.authorization.create(
//     {
//       note: 'wolox github organization manager authorization note',
//       scopes: ['user', 'public_repo', 'repo', 'repo:status', 'gist'],
//       headers: {
//         'X-GitHub-OTP': otp
//       }
//     },
//     function(err, res) {
//       debugger;
//       if (res && res.token) {
//         // save and use res.token as in the Oauth process above from now on
//       }
//     }
//   );
// };
