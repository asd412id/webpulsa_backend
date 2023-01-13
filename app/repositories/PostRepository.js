const { Op } = require("sequelize");
const { getPage, paginate } = require("../../helpers/Pagination");
const { statusData, statusMessage } = require("../../helpers/Status");
const PostModel = require("../models/PostModel");
const PostCategoryModel = require("../models/PostCategoryModel");
const db = require("../../configs/Database");
const { existsSync, mkdirSync, writeFileSync, rmSync } = require("fs");
const { getBuffer, base64Extension } = require("../../helpers/ImageHelper");
const { assetsPath } = require("../../configs/AssetsPath");
const md5 = require("md5");

class PostRepository {
  async all(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await PostModel.findAndCountAll({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.substring]: search
              }
            },
            {
              content: {
                [Op.substring]: search
              }
            },
            {
              slug: {
                [Op.substring]: search
              }
            }
          ]
        },
        include: [
          {
            model: PostCategoryModel,
            as: 'categories',
            through: {
              attributes: []
            }
          }
        ],
        order: [
          ['title', 'asc']
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

  savePicture(picture) {
    return new Promise(resolve => {
      if (picture) {
        if (!existsSync(`${assetsPath}/picture`)) {
          mkdirSync(`${assetsPath}/picture`);
        }

        const buffer = getBuffer(picture);
        const ext = base64Extension(picture);

        const fileName = `${md5(Date.now())}.${ext}`;
        writeFileSync(`${assetsPath}/picture/${fileName}`, buffer, 'base64')
        return resolve(`/picture/${fileName}`);
      } else {
        return resolve(null);
      }
    });
  }

  store(data) {
    return new Promise((resolve, reject) => {
      const store = async (data) => {
        const { title, content, picture, slug, categories } = data;
        if (!title || !content) {
          return reject(statusMessage('Judul dan konten postingan tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const picturePath = await this.savePicture(picture);
          const insert = await PostModel.create({ title, content, slug: slug ?? title, picture: picturePath });
          const cats = [...(await PostCategoryModel.findAll({
            where: {
              id: {
                [Op.in]: categories ?? []
              }
            },
            group: ['id'],
            distinct: true,
            raw: true
          })).map(e => e.id)];
          insert.addCategories(cats);
          tr.commit();
          return resolve(statusData(insert.dataValues, 201));
        } catch (error) {
          tr.rollback();
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
        const { title, content, picture, slug, categories } = data;
        if (!title || !content) {
          return reject(statusMessage('Judul dan konten postingan tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const insert = await PostModel.findByPk(id);
          if (!insert) {
            return reject(statusMessage('Data tidak ditemukan', 404));
          }
          const picturePath = await this.savePicture(picture);
          if (picturePath) {
            rmSync(`${assetsPath}/${insert.picture}`);
          }
          await insert.update({ title, content, slug: slug ?? insert.slug, picture: picturePath ?? insert.picture });
          const cats = [...(await PostCategoryModel.findAll({
            where: {
              id: {
                [Op.in]: categories ?? []
              }
            },
            group: ['id'],
            distinct: true,
            raw: true
          })).map(e => e.id)];
          insert.setCategories(cats);
          tr.commit();
          return resolve(statusData(insert.dataValues));
        } catch (error) {
          tr.rollback()
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
        const data = await PostModel.findByPk(id);
        if (!data) {
          return reject(statusMessage('Data tidak ditemukan', 404));
        }
        if (data.picture) {
          rmSync(`${assetsPath}/${data.picture}`);
        }
        await data.destroy();
        return resolve(statusMessage('Data berhasil dihapus'));
      } catch (error) {
        return reject(statusMessage(error.message, 500));
      }
    });
  }
}

module.exports = new PostRepository;