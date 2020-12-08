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
  }
}

module.exports = categoryService
