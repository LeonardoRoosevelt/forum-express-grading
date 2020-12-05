const helpers = require('../_helpers')

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      // clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: helpers
          .getUser(req)
          .FavoritedRestaurants.map(d => d.id)
          .includes(r.id),
        isLiked: helpers
          .getUser(req)
          .LikedRestaurants.map(l => l.id)
          .includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      restaurant.viewCounts += 1
      restaurant.save().then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(helpers.getUser(req).id)
        const isLiked = restaurant.LikedUsers.map(l => l.id).includes(helpers.getUser(req).id)
        return res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited: isFavorited,
          isLiked: isLiked
        })
      })
    })
  },
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: [User] }]
    }).then(restaurant => {
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    })
  },
  getTopRestaurants: (req, res) => {
    // 顯示種類
    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }
    return Restaurant.findAll({
      limit: 10,
      where: whereQuery,
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        FavoriteCount: restaurant.FavoritedUsers.length,
        LikeCount: restaurant.LikedUsers.length,
        isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(helpers.getUser(req).id),
        isLiked: restaurant.LikedUsers.map(l => l.id).includes(helpers.getUser(req).id)
      }))
      // 依追蹤者人數排序如追蹤人數相同再照喜愛人數排序
      restaurants = restaurants.sort((a, b) => {
        let favoriteCount1 = a.FavoriteCount
        let favoriteCount2 = b.FavoriteCount
        if (favoriteCount1 === favoriteCount2) {
          return b.LikeCount - a.LikeCount
        }
        return b.FavoriteCount - a.FavoriteCount
      })
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('topRestaurants', {
          restaurants: restaurants,
          categories: categories,
          categoryId: categoryId
        })
      })
    })
  }
}

module.exports = restController
