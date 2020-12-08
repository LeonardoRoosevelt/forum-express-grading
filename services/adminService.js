const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = {
  getRestaurants: (req, res, callback, next) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        callback({ restaurants: restaurants })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, callback, next) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, callback, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy().then(restaurant => {
          callback({ status: 'success', message: '' })
        })
      })
      .catch(err => next(err))
  }
}

module.exports = adminService
