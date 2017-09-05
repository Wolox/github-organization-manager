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

const shouldFetchAnotherPage = response => {
  const nextLink = response.meta.link.substring(
    response.meta.link.indexOf('<') + 1,
    response.meta.link.indexOf('>')
  );
  return nextLink.indexOf('?page=1') === -1 && nextLink.indexOf('&page=1') === -1;
};

const authenticated = wrappedFunction => {
  return (token, ...args) => {
    init(token);
    return wrappedFunction(...args);
  };
};

exports.createRepository = authenticated(settings => {
  const name = settings.name;
  const privateRepo = settings.privateRepo;

  return github.repos.createForOrg({
    auto_init: true,
    org: config.common.github.organization,
    name,
    private: privateRepo
  });
});

exports.createBranchFromMaster = authenticated(settings => {
  const name = settings.name;
  const repo = settings.repo;

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
});

exports.defaultBranch = authenticated(settings => {
  const name = settings.name;
  const repo = settings.repo;

  return github.repos.edit({
    default_branch: name,
    owner: config.common.github.organization,
    name: repo,
    repo
  });
});

exports.protectBranches = authenticated(settings => {
  const branches = settings.branches;
  const repo = settings.repo;

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
});

exports.getPrivateReposCount = (token, page = 1) => {
  return exports.getPrivateRepos(token, page).then(repos => repos.length);
};

exports.getPrivateRepos = (token, page = 1) => {
  init(token);
  return github.repos
    .getForOrg({
      org: config.common.github.organization,
      type: 'private',
      per_page: 100,
      page
    })
    .then(repos => {
      const privateRepos = repos.data.reduce((arr, repo) => (repo.fork ? arr : arr.concat(repo)), []);
      if (shouldFetchAnotherPage(repos)) {
        return exports.getPrivateRepos(token, page + 1).then(arr => arr.concat(privateRepos));
      } else {
        return privateRepos;
      }
    });
};

exports.defaultTeams = authenticated(settings => {
  const repo = settings.repo;

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
});

exports.createTeam = authenticated(settings =>
  github.orgs.createTeam({
    org: config.common.github.organization,
    name: settings.name
  })
);

exports.addTeamToRepo = authenticated(settings =>
  github.orgs.addTeamRepo({
    id: settings.teamId,
    org: config.common.github.organization,
    repo: settings.repo,
    permission: 'push'
  })
);

exports.addMemberToTeam = authenticated(settings =>
  github.orgs.addTeamMembership({
    id: settings.teamId,
    username: settings.username,
    role: settings.maintainer === 'false' ? 'member' : 'maintainer'
  })
);

exports.getTeams = (token, page = 1) => {
  init(token);
  return github.orgs
    .getTeams({
      org: config.common.github.organization,
      per_page: 100,
      page
    })
    .then(response => {
      if (shouldFetchAnotherPage(response)) {
        return exports.getTeams(token, page + 1).then(arr => arr.concat(response.data));
      } else {
        return response.data;
      }
    });
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
