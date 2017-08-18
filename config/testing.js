exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    api: {},
    github: {
      organization: process.env.NODE_MANAGER_ORGANIZATION || 'Wolox',
      private_repositories_limit: process.env.NODE_MANAGER_PRIVATE_REPOSITORIES_LIMIT || 50
    },
    rollbar: {}
  }
};
