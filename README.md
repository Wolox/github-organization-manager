github-organization-manager
===============

Project to manage github repos

## First steps

#### Installing node
Get the latest version of node from the [official website](https://nodejs.org/) or using [nvm](https://github.com/creationix/nvm)
Nvm approach is preferred.

#### Getting dependencies
Run ```npm install``` or ```yarn``` from rootpath of the project.

#### Kickoff - Removing sample project
Run ```node ./scripts/kick-off.js``` from project's rootpath to remove the existing sample project and start developing your app.

#### Database configuration
Before running the app, make sure you must have a postgres db created. Then, set the `$NODE_API_DB_URL` environmental variable. It should look something like: `postgres://username:password@host:port/databasename`.
For more information feel free to glance at the [`app/orm.js`](https://github.com/Wolox/github-organization-manager/blob/master/app/orm.js#L6) file.

### Migrations

To create a migration, run `./node_modules/.bin/sequelize migration:create --name="my-migration-name" --config ./migrations/config.js --migrations-path ./migrations/migrations`.

To run them, execute `npm run migrations`.

#### Starting your app
Now, to start your app run ```npm start``` in the rootpath of the project. Then access your app at **localhost:port**. The port is logged in the console where you ran the start script.

## Development

#### Environments
By default, the environment will be **development**, but you can easily change it using the **NODE_ENV** environmental variable.

#### Debugging
As we know, a NodeJS application is not something easy to debug and because of that we've added the `--inspect` flag to make it simpler. Chrome DevTools will get started when running your app using the start script (`npm start`), making your debugging easier.

#### Documentation
Documentation will be served at `/docs`. Remember using [dictum.js](http://www.github.com/Wolox/dictum.js) package to automatically generate documentation for your endpoints. Check [this link](https://github.com/Wolox/dictum.js#chai) for further details.

## Deploy

#### Heroku
Pushing the desired branch to heroku should be enough.
For more information check: https://devcenter.heroku.com/articles/getting-started-with-nodejs#define-a-procfile.

## About

This project is maintained by [Wolox](https://github.com/Wolox) and it was written by [Wolox](http://www.wolox.com.ar).

![Wolox](https://raw.githubusercontent.com/Wolox/press-kit/master/logos/logo_banner.png)