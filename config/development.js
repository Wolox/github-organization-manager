exports.config = {
  environment: 'development',
  isDevelopment: true,
  common: {
    api: {},
    github: {
      organization: process.env.NODE_MANAGER_ORGANIZATION || 'Wolox',
      private_repositories_limit: process.env.NODE_MANAGER_PRIVATE_REPOSITORIES_LIMIT || 125
    },
    rollbar: {},
    port: process.env.PORT
  }
};
