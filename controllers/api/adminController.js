const db = require('../../models')
const Category = db.Category
const Restaurant = db.Restaurant
const adminService = require('../../services/adminService.js')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.json(data)
    })
  },
  getRestaurant: (req, res, next) => {
    adminService
      .getRestaurant(req, res, data => {
        return res.json(data)
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy().then(restaurant => {
          res.json({ status: 'success', message: '' })
        })
      })
      .catch(err => next(err))
  }
}
module.exports = adminController
