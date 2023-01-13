const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");
const slug = require('slug');

const PostModel = db.define('posts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  picture: {
    type: DataTypes.STRING
  },
  slug: {
    type: DataTypes.STRING,
    set(value) {
      this.setDataValue('slug', slug(value));
    }
  }
});

module.exports = PostModel;