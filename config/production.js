exports.config = {
  environment: 'production',
  isProduction: true,
  common: {
    api: {},
    github: {
      organization: process.env.NODE_MANAGER_ORGANIZATION || 'Wolox',
      private_repositories_limit: process.env.NODE_MANAGER_PRIVATE_REPOSITORIES_LIMIT || 125
    },
    rollbar: {
      accessToken: process.env.ROLLBAR_TOKEN
    },
    port: process.env.PORT
  }
};
