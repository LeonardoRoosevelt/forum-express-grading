const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const adminService = require('../services/adminService.js')

const adminController = {
  getRestaurants: (req, res) => {
    adminService
      .getRestaurants(req, res, data => {
        return res.render('admin/restaurants', data)
      })

      .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render('admin/create', {
          categories: categories
        })
      })
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    adminService
      .postRestaurant(req, res, data => {
        if (data['status'] === 'error') {
          req.flash('error_messages', data['message'])
          return res.redirect('back')
        }
        req.flash('success_messages', data['message'])
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    adminService
      .getRestaurant(req, res, data => {
        return res.render('admin/restaurant', data)
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          return res.render('admin/create', {
            categories: categories,
            restaurant: restaurant.toJSON()
          })
        })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, callback, next) => {
    adminService
      .editRestaurant(req, res, data => {
        return res.render('admin/create', data)
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    adminService
      .putRestaurant(req, res, data => {
        if (data['status'] === 'error') {
          req.flash('error_messages', data['message'])
          return res.redirect('back')
        }
        req.flash('success_messages', data['message'])
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    adminService
      .deleteRestaurant(req, res, data => {
        if (data['status'] === 'success') {
          return res.redirect('/admin/restaurants')
        }
      })
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    let userId = helpers.getUser(req).id //前端控制
    return User.findAll({ raw: true })
      .then(users => {
        users.map(user => {
          if (user.id === userId) {
            user.self = true
          } else {
            user.self = false
          }
        })
        return res.render('admin/users', { users: users })
      })
      .catch(err => next(err))
  },
  putUsers: (req, res, next) => {
    const id = req.params.id
    // const userId = helpers.getUser(req).id 後端控制
    // if (id !== userId) {
    return User.findByPk(id).then(user => {
      user
        .update({ isAdmin: !user.isAdmin })
        .then(user => {
          if (user.isAdmin === true) {
            req.flash('success_messages', `${user.name} was successfully to update to Admin`)
          } else {
            req.flash('success_messages', `${user.name} was successfully to update to User`)
          }
          return res.redirect('/admin/users')
        })
        .catch(err => next(err))
    })
    // } else {
    //   req.flash('error_messages', `Do not change youself`)
    //   return res.redirect('/admin/users')
    // }
  }
}

module.exports = adminController
