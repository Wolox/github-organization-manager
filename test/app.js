'use strict';

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  Sequelize = require('sequelize');

chai.use(chaiHttp);

// including all test files
const normalizedPath = path.join(__dirname, '.');
fs.readdirSync(normalizedPath).forEach(file => {
  require(`./${file}`);
});
