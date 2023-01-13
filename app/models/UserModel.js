const { hashSync } = require("bcryptjs");
const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");

const UserModel = db.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('password', hashSync(value, 10));
    }
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  opt: {
    type: DataTypes.TEXT,
    set(value) {
      this.setDataValue('opt', JSON.stringify(value));
    },
    get() {
      return JSON.parse(this.getDataValue('opt'));
    }
  }
}, {
  scopes: {
    hidePassword: {
      attributes: {
        exclude: ['password']
      }
    }
  }
});

module.exports = UserModel;