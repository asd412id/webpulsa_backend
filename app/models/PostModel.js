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
  publish: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  date_publish: {
    type: DataTypes.DATE,
    defaultValue: new Date()
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    set(value) {
      this.setDataValue('slug', slug(value));
    }
  }
});

module.exports = PostModel;