"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define associations here
      User.belongsTo(models.Role, {
        foreignKey: "role_code",
        targetKey: "code",
        as: "roleData",
      });
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      provider: DataTypes.STRING,
      verifyState: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role_code: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
