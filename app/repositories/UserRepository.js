const { compareSync } = require("bcryptjs");
const UserModel = require("../models/UserModel");
const jwt = require('jsonwebtoken');
const { secret } = require("../../configs/JWT");
const { statusMessage, statusData } = require("../../helpers/Status");
const { Op } = require("sequelize");

class UserRepository {
  checkLogin(data) {
    return new Promise((resolve, reject) => {
      const check = async (data) => {
        const { username, password } = data;
        if (!username || !password) {
          return reject(statusMessage('Username dan password harus diisi', 406));
        }
        try {
          const user = await UserModel.findOne({
            where: {
              username: username
            }
          });
          if (user) {
            if (compareSync(password, user.password)) {
              user.update({ lastLogin: new Date() });
              const encode = {
                _id: user.id
              }
              const token = jwt.sign(encode, secret);
              const data = {
                id: user.id,
                name: user.name,
                username: user.username,
                lastLogin: user.lastLogin,
                token: token
              }
              return resolve(statusData(data));
            }
          }
          return reject(statusMessage('Username atau password tidak ditemukan', 404));
        } catch (error) {
          return reject(statusMessage(error.message, 500));
        }
      }
      check(data);
    });
  }

  store(data) {
    return new Promise((resolve, reject) => {
      const store = async (data) => {
        const { name, username, password } = data;
        if (!name || !username || !password) {
          return reject(statusMessage('Data tidak lengkap', 406));
        }
        try {
          const duplicate = await UserModel.findOne({
            where: {
              username: username
            }
          });
          if (!duplicate) {
            const insert = await UserModel.create({ name, username, password });
            delete insert.dataValues.password;
            return resolve(statusData(insert.dataValues, 201));
          }
          return reject(statusMessage(`Username '${username}' telah digunakan`, 406));
        } catch (error) {
          return reject(statusMessage(error.message, 500));
        }
      }
      store(data);
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      const update = async (data) => {
        const { name, username, password } = data;
        if (!name || !username) {
          return reject(statusMessage('Data tidak lengkap', 406));
        }
        try {
          const duplicate = await UserModel.findOne({
            where: {
              username: username,
              id: {
                [Op.ne]: id
              }
            }
          });
          if (!duplicate) {
            const insert = await UserModel.findByPk(id);
            if (insert) {
              await insert.update({ name, username, password });
              delete insert.dataValues.password;
              return resolve(statusData(insert.dataValues, 200));
            }
            return reject(statusMessage(`Data tidak ditemukan`, 404));
          }
          return reject(statusMessage(`Username '${username}' telah digunakan`, 406));
        } catch (error) {
          return reject(statusMessage(error.message, 500));
        }
      }
      update(data);
    });
  }

  async getByid(id) {
    try {
      const data = await UserModel.findByPk(id, {
        attributes: ['id', 'name', 'username', 'lastLogin']
      });
      if (data) {
        return statusData(data.dataValues);
      }
      return statusMessage('Data tidak ditemukan', 404);
    } catch (error) {
      return statusMessage(error.message, 500);
    }
  }

  checkToken(token) {
    return new Promise((resolve, reject) => {
      const check = async (token) => {
        if (!token) {
          return reject(statusMessage('Anda harus login terlebih dahulu', 401));
        }
        const decode = jwt.decode(token, secret);
        if (decode) {
          const user = await this.getByid(decode._id);
          if (user) {
            return resolve(user);
          }
        }
        return reject(statusMessage('Anda tidak memiliki akses', 401));
      }
      check(token);
    });
  }
}

module.exports = new UserRepository;