const categoryService = require('../../services/categoryService.js')

const categoryController = {
  getCategories: (req, res) => {
    categoryService
      .getCategories(req, res, data => {
        return res.json(data)
      })
      .catch(err => next(err))
  },
  postCategory: (req, res) => {
    categoryService
      .postCategory(req, res, data => {
        return res.json(data)
      })
      .catch(err => next(err))
  },
  putCategory: (req, res) => {
    categoryService
      .putCategory(req, res, data => {
        return res.json(data)
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res) => {
    categoryService
      .deleteCategory(req, res, data => {
        return res.json(data)
      })
      .catch(err => next(err))
  }
}
module.exports = categoryController
