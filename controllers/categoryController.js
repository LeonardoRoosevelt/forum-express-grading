const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({ raw: true }).then(categories => res.render('admin/categories', { categories }))
  },
  postCategory: (req, res) => {
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
  }
}

module.exports = categoryController
