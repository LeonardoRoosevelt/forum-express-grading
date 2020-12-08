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
  }
}

module.exports = adminService
