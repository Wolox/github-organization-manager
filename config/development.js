exports.config = {
  environment: 'development',
  isDevelopment: true,
  common: {
    api: {},
    github: {
      organization: process.env.NODE_MANAGER_ORGANIZATION || 'Wolox',
      private_repositories_limit: process.env.NODE_MANAGER_PRIVATE_REPOSITORIES_LIMIT || 50,
      username: process.env.NODE_MANAGER_USERNAME,
      password: process.env.NODE_MANAGER_PASSWORD,
      one_time_password: process.env.NODE_MANAGER_ONE_TIME_PASSWORD,
      token: process.env.NODE_MANAGER_TOKEN
    },
    session: {
      header_name: 'authorization',
      secret: process.env.NODE_API_SESSION_SECRET
    },
    rollbar: {
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN
    }
  }
};
