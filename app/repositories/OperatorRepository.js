const { existsSync, mkdirSync, writeFileSync, rmSync } = require("fs");
const md5 = require("md5");
const { Op } = require("sequelize");
const { assetsPath } = require("../../configs/AssetsPath");
const { base64Extension, getBuffer } = require("../../helpers/ImageHelper");
const { getPage, paginate } = require("../../helpers/Pagination");
const { statusData, statusMessage } = require("../../helpers/Status");
const OperatorModel = require("../models/OperatorModel");
const PulsaModel = require("../models/PulsaModel");

class OperatorRepository {
  async all(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await OperatorModel.findAndCountAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: search
              }
            }
          ]
        },
        include: [
          {
            model: PulsaModel,
            as: 'pulsa',
            through: {
              attributes: []
            }
          }
        ],
        order: [
          ['name', 'asc']
        ],
        group: ['id'],
        limit: limit,
        offset: offset,
        distinct: true
      });
      return statusData(paginate(data, page, size));
    } catch (error) {
      return statusMessage(error.message, 500);
    }
  }

  saveLogo(logo) {
    return new Promise(resolve => {
      if (logo) {
        if (!existsSync(`${assetsPath}/logo`)) {
          mkdirSync(`${assetsPath}/logo`);
        }

        const buffer = getBuffer(logo);
        const ext = base64Extension(logo);

        const fileName = `${md5(Date.now())}.${ext}`;
        writeFileSync(`${assetsPath}/logo/${fileName}`, buffer, 'base64')
        return resolve(`/logo/${fileName}`);
      } else {
        return resolve(null);
      }
    });
  }

  store(data) {
    return new Promise((resolve, reject) => {
      const store = async (data) => {
        const { name, logo } = data;
        if (!name) {
          return reject(statusMessage('Nama operator tidak boleh kosong', 406));
        }

        try {
          const logoPath = await this.saveLogo(logo);
          const insert = await OperatorModel.create({ name, logo: logoPath });
          return resolve(statusData(insert.dataValues, 201));
        } catch (error) {
          return reject(statusMessage(error.message, 500));
        }
      }
      store(data);
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject(statusMessage('ID tidak boleh kosong', 406));
      }
      const store = async (data) => {
        const { name, logo } = data;
        if (!name) {
          return reject(statusMessage('Nama operator tidak boleh kosong', 406));
        }

        try {
          const insert = await OperatorModel.findByPk(id);
          if (!insert) {
            return reject(statusMessage('Data tidak ditemukan', 404));
          }
          const logoPath = await this.saveLogo(logo);
          if (logoPath) {
            rmSync(`${assetsPath}/${insert.logo}`);
          }
          await insert.update({ name, logo: logoPath ?? insert.logo });
          return resolve(statusData(insert.dataValues));
        } catch (error) {
          return reject(statusMessage(error.message, 500));
        }
      }
      store(data);
    });
  }

  destroy(id) {
    return new Promise(async (resolve, reject) => {
      if (!id) {
        return reject(statusMessage('ID tidak boleh kosong', 406));
      }

      try {
        const data = await OperatorModel.findByPk(id);
        if (!data) {
          return reject(statusMessage('Data tidak ditemukan', 404));
        }
        if (data.logo) {
          rmSync(`${assetsPath}/${data.logo}`);
        }
        await data.destroy();
        return resolve(statusMessage('Data berhasil dihapus'));
      } catch (error) {
        return reject(statusMessage(error.message, 500));
      }
    });
  }
}

module.exports = new OperatorRepository;