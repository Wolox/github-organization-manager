const logger = require('../logger');
const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const TechLeader = sequelize.define(
    'techleader',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      token: DataTypes.STRING
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  TechLeader.getByToken = token => {
    return TechLeader.findOne({ where: { token } }).catch(err => {
      logger.error(err);
      throw errors.databaseError;
    });
  };

  return TechLeader;
};
