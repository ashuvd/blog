const Sequelize = require('sequelize')
const UserModel = require('./user')
const db = require('../services/database');

// 1: The model schema.
const modelDefinition = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false
  }
};

// 2: The model options.
const modelOptions = {

};

// 3: Define the Message model.
const MessageModel = db.define('message', modelDefinition, modelOptions);

UserModel.hasMany(MessageModel, {foreignKey: { name: 'user_id', allowNull: false }});
MessageModel.belongsTo(UserModel, {foreignKey: { name: 'user_id', allowNull: false }});

module.exports = MessageModel;