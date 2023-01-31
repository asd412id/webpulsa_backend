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
const slugger = require('slug');
const randomstring = require('randomstring');

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
          ['createdAt', 'desc']
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

  async getPosts(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await PostModel.findAndCountAll({
        where: {
          [Op.and]: {
            publish: true,
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
          ['date_publish', 'desc']
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

  async getBySlug(slug) {
    try {
      const post = await PostModel.findOne({
        where: {
          [Op.and]: {
            publish: true,
            slug: {
              [Op.eq]: slug
            }
          }
        },
        include: [
          {
            model: PostCategoryModel,
            as: 'categories',
            through: {
              attributes: []
            }
          }
        ]
      });
      return statusData(post);
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

  checkSlug(slug, id = null) {
    return new Promise((resolve, reject) => {
      const generator = (slug, generated = false) => {
        let _slug = slug;
        PostModel.findOne({
          where: {
            slug: {
              [Op.eq]: _slug
            },
            id: {
              [Op.ne]: id
            }
          }
        })
          .then(found => {
            if (found) {
              const srandom = randomstring.generate({
                charset: 'alphanumeric',
                length: 5,
                capitalization: 'lowercase'
              });
              if (generated) {
                const explode = _slug.split('-');
                explode.pop();
                _slug = explode.join('-');
              }
              _slug = `${_slug}-${srandom}`;
              return generator(_slug, true);
            } else {
              resolve(slug);
            }
          })
          .catch(error => {
            reject(error.message);
          })
      }
      generator(slug);
    });
  }

  store(data) {
    return new Promise((resolve, reject) => {
      const store = async (data) => {
        const { title, content, picture, slug, categories, publish, date_publish } = data;
        if (!title || !content) {
          return reject(statusMessage('Judul dan konten postingan tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const _slug = await this.checkSlug(slug ?? slugger(title));
          const picturePath = await this.savePicture(picture);
          const insert = await PostModel.create({ title, content, slug: _slug, picture: picturePath, publish, date_publish });
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
        const { title, content, picture, slug, categories, publish, date_publish } = data;
        if (!title || !content) {
          return reject(statusMessage('Judul dan konten postingan tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const insert = await PostModel.findByPk(id);
          if (!insert) {
            return reject(statusMessage('Data tidak ditemukan', 404));
          }
          const _slug = await this.checkSlug(slug ?? insert.slug, id);
          const picturePath = await this.savePicture(picture);
          if (picturePath) {
            if (existsSync(`${assetsPath}/${insert.picture}`)) {
              rmSync(`${assetsPath}/${insert.picture}`);
            }
          }
          await insert.update({ title, content, slug: _slug, picture: picturePath ?? insert.picture, publish, date_publish });
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
          if (existsSync(`${assetsPath}/${data.picture}`)) {
            rmSync(`${assetsPath}/${data.picture}`);
          }
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