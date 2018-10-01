const GitHubApi = require('@octokit/rest'),
  config = require('../../config'),
  logger = require('../logger'),
  errors = require('../errors');

const github = new GitHubApi({
  debug: true,
  host: 'api.github.com',
  Promise: require('bluebird'),
  timeout: 5000
});

const init = token => {
  try {
    return github.authenticate({
      type: 'oauth',
      token
    });
  } catch (e) {
    logger.error(e);
  }
};

const getReference = settings => {
  return github.gitdata.getReference({
    owner: config.common.github.organization,
    repo: settings.repo,
    ref: `heads/${settings.name}`
  });
};

const shouldFetchAnotherPage = response => {
  const nextLink = response.meta.link
    ? response.meta.link.substring(response.meta.link.indexOf('<') + 1, response.meta.link.indexOf('>'))
    : '';
  return nextLink.length && nextLink.indexOf('?page=1') === -1 && nextLink.indexOf('&page=1') === -1;
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

  logger.info(`Creating repo for settings: ${JSON.stringify(settings)}`);
  return github.repos
    .createForOrg({
      auto_init: true,
      org: config.common.github.organization,
      name,
      private: privateRepo
    })
    .then(resp => {
      logger.info(`Creating repo for settings: ${JSON.stringify(resp.data)}`);
      return resp;
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
});

exports.setTopics = authenticated(settings => {
  logger.info(`Adding topics: ${JSON.stringify(settings)}`);
  return github.repos
    .replaceTopics({
      owner: config.common.github.organization,
      repo: settings.repo,
      names: settings.names
    })
    .then(resp => {
      logger.info(`Topics result: ${JSON.stringify(resp.data)}`);
      return settings.repo;
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
});

exports.createBranchFromMaster = authenticated(settings => {
  const name = settings.name;
  const repo = settings.repo;

  logger.info(`Create Branch From Master: ${JSON.stringify(settings)}`);
  logger.info('Getting master reference');
  return getReference({
    repo,
    name: 'master'
  })
    .then(master => {
      logger.info('Creating reference');
      return github.gitdata
        .createReference({
          owner: config.common.github.organization,
          ref: `refs/heads/${name}`,
          repo,
          sha: master.data.object.sha
        })
        .then(resp => {
          logger.info('Reference created');
          return repo;
        })
        .catch(err => {
          logger.error(err);
          return Promise.reject(err);
        });
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
});

exports.defaultBranch = authenticated(settings => {
  const name = settings.name;
  const repo = settings.repo;

  logger.info(`Setting default branch: ${JSON.stringify(settings)}`);
  return github.repos
    .edit({
      default_branch: name,
      owner: config.common.github.organization,
      name: repo,
      repo
    })
    .then(resp => {
      logger.info('Successfully set default branch');
      return resp;
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
});

exports.protectBranches = authenticated(settings => {
  const branches = settings.branches;
  const repo = settings.repo;

  logger.info(`Protecting branches: ${JSON.stringify(settings)}`);

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
    )
      .then(() => {
        logger.info('Successfully protected branches');
        return repo;
      })
      .catch(err => {
        logger.error(err);
        return Promise.reject(err);
      });
  } else {
    return Promise.reject(errors.noBranchesSentToProtect);
  }
});

exports.getPrivateReposCount = (token, page = 1) => {
  logger.info('Getting private repos count');
  return exports
    .getPrivateRepos(token, page)
    .then(repos => {
      logger.info(`Successfully got count: ${repos.length}`);
      return repos.length;
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
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

  logger.info(`Adding default teams: ${JSON.stringify(settings)}`);

  return Promise.all([
    github.orgs.addTeamRepo({
      id: 2543535, // calidad
      org: config.common.github.organization,
      repo,
      permission: 'pull'
    }),
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
  ])
    .then(() => {
      logger.info('Successfully added teams');
      return repo;
    })
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
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
