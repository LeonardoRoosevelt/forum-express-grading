const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService.js')

const categoryController = {
  getCategories: (req, res) => {
    categoryService
      .getCategories(req, res, data => {
        return res.render('admin/categories', data)
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else {
      Category.create({ name: req.body.name })
        .then(category => {
          req.flash('success_messages', 'category was successfully created')
          return res.redirect('/admin/categories')
        })
        .catch(err => {
          next(err)
        })
    }
  },
  putCategory: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else {
      Category.findByPk(req.params.id)
        .then(category => {
          return category.update({ name: req.body.name })
        })
        .then(category => {
          req.flash('success_messages', 'category was successfully update')
          return res.redirect('/admin/categories')
        })
        .catch(err => {
          next(err)
        })
    }
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => category.destroy())
      .then(category => res.redirect('/admin/categories'))
      .catch(err => next(err))
  }
}

module.exports = categoryController
