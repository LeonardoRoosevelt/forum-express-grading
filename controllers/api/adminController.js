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
  }
}
module.exports = adminController
