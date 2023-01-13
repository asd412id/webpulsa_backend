const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");
const PulsaModel = require("./PulsaModel");

const OperatorModel = db.define('operators', {
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
  logo: {
    type: DataTypes.STRING
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
});

OperatorModel.belongsToMany(PulsaModel, { as: 'pulsa', through: 'pulsa_operator', timestamps: false });
PulsaModel.belongsToMany(OperatorModel, { as: 'operator', through: 'pulsa_operator', timestamps: false });

module.exports = OperatorModel;