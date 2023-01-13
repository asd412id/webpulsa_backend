const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");
const PostModel = require("./PostModel");

const PostCategoryModel = db.define('post_categories', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

PostCategoryModel.belongsToMany(PostModel, { as: 'posts', through: 'post_category', timestamps: false });
PostModel.belongsToMany(PostCategoryModel, { as: 'categories', through: 'post_category', timestamps: false });

module.exports = PostCategoryModel;