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
    categoryService
      .postCategory(req, res, data => {
        if (data['status'] === 'error') {
          req.flash('error_messages', data['message'])
          return res.redirect('back')
        }
        req.flash('success_messages', data['message'])
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    categoryService
      .putCategory(req, res, data => {
        if (data['status'] === 'error') {
          req.flash('error_messages', data['message'])
          return res.redirect('back')
        }
        req.flash('success_messages', data['message'])
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    categoryService
      .deleteCategory(req, res, data => {
        if (data['status'] === 'success') {
          return res.redirect('/admin/categories')
        }
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
