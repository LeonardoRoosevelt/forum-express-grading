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
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        })
          .then(restaurant => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
          .catch(err => next(err))
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      })
        .then(restaurant => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
        .catch(err => next(err))
    }
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
  putRestaurant: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant
              .update({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: file ? img.data.link : restaurant.image,
                CategoryId: req.body.categoryId
              })
              .then(restaurant => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
          .catch(err => next(err))
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant
            .update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: restaurant.image,
              CategoryId: req.body.categoryId
            })
            .then(restaurant => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
        .catch(err => next(err))
    }
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy().then(restaurant => {
          res.redirect('/admin/restaurants')
        })
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
