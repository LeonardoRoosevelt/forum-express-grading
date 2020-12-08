const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback, next) => {
    return Category.findAll({ raw: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              callback({
                categories: categories,
                category: category.toJSON()
              })
            })
            .catch(err => next(err))
        } else {
          callback({ categories })
        }
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      Category.create({ name: req.body.name }).then(category => {
        return callback({ status: 'success', message: 'category was successfully created' })
      })
    }
  },
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      Category.findByPk(req.params.id)
        .then(category => {
          category.update({ name: req.body.name })
        })
        .then(category => {
          callback({ status: 'success', message: 'category was successfully created' })
        })
    }
  },
  deleteCategory: (req, res, callback, next) => {
    return Category.findByPk(req.params.id)
      .then(category => category.destroy())
      .then(category => {
        callback({ status: 'success', message: '' })
      })
      .catch(err => next(err))
  }
}

module.exports = categoryService
