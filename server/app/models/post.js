const Sequelize = require('sequelize');
const UserModel = require('./user');
const MessageModel = require('./message');

const db = require('../services/database');

// 1: The model schema.
const modelDefinition = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  image_path: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false
  }
};

// 2: The model options.
const modelOptions = {

};

// 3: Define the Post model.
const PostModel = db.define('post', modelDefinition, modelOptions);

UserModel.hasMany(PostModel, {foreignKey: { name: 'user_id', allowNull: false }});
PostModel.belongsTo(UserModel, {foreignKey: { name: 'user_id', allowNull: false }});

PostModel.hasMany(MessageModel, {foreignKey: { name: 'post_id', allowNull: false }, onDelete: 'CASCADE'});
MessageModel.belongsTo(PostModel, {foreignKey: { name: 'post_id', allowNull: false }, onDelete: 'CASCADE'});

module.exports = PostModel;