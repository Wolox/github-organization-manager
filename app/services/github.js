const GitHubApi = require('github'),
  config = require('../../config'),
  errors = require('../errors');

const github = new GitHubApi({
  debug: true,
  host: 'api.github.com',
  Promise: require('bluebird'),
  timeout: 5000
});

const init = token =>
  github.authenticate({
    type: 'oauth',
    token
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
  const token = settings.token;
  init(token);

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
  const token = settings.token;
  init(token);

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
  const token = settings.token;
  init(token);

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
  const token = settings.token;
  init(token);

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

exports.getPrivateReposCount = (token, page = 1) => {
  return exports.getPrivateRepos(token, page).then(repos => repos.length);
};

exports.getPrivateRepos = (token, page = 1) => {
  init(token);
  return github.repos
    .getForOrg({
      org: config.common.github.organization,
      type: 'private',
      page
    })
    .then(repos => {
      const privateRepos = repos.data.reduce((arr, repo) => (repo.fork ? arr : arr.concat(repo)), []);
      const nextLink = repos.meta.link.substring(
        repos.meta.link.indexOf('<') + 1,
        repos.meta.link.indexOf('>')
      );

      if (nextLink.indexOf('page=1') === -1) {
        return exports.getPrivateRepos(token, page + 1).then(arr => arr.concat(privateRepos));
      } else {
        return privateRepos;
      }
    });
};

exports.defaultTeams = settings => {
  const repo = settings.repo;
  const token = settings.token;
  init(token);

  return Promise.all([
    github.orgs.addTeamRepo({
      id: 1615796, // bots
      org: config.common.github.organization,
      repo,
      permission: 'push'
    }),
    github.orgs.addTeamRepo({
      id: 1458022, // techleaders
      org: config.common.github.organization,
      repo,
      permission: 'admin'
    })
  ]).then(() => repo);
};

/* ------------------------- AUTH ------------------------- */

exports.auth = (username, password, otp) => {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: 'basic',
      username,
      password
    });
    github.authorization.create(
      {
        note: `wolox github organization manager authorization note ${username}-${otp}`,
        scopes: ['user', 'public_repo', 'repo', 'repo:status', 'gist'],
        headers: {
          'X-GitHub-OTP': otp
        }
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.data.token);
        }
      }
    );
  });
};
