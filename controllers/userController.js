const fs = require('fs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
            image: null
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: Restaurant, as: 'LikedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Comment, include: [Restaurant] }
      ]
    })
      .then(user => {
        const arr = user.Comments.map(comment => ({
          ...comment.dataValues,
          restaurantImg: comment.dataValues.Restaurant.image
        }))
        let set = new Set()
        const data = arr.filter(item => (!set.has(item.RestaurantId) ? set.add(item.RestaurantId) : false))
        const differentRest = data.length
        const totalComment = user.Comments.length || 0
        const FavoriteCount = user.FavoritedRestaurants.length || 0
        const LikeCount = user.LikedRestaurants.length || 0
        const FollowerCount = user.Followers.length || 0
        const FollowingCount = user.Followings.length || 0
        const favoriteRest = user.FavoritedRestaurants
        const followerUser = user.Followers
        const followingsUser = user.Followings

        return res.render('profile', {
          user: helpers.getUser(req),
          profile: user.toJSON(),
          totalComment: totalComment,
          differentRest: differentRest,
          comments: data,
          favoriteRest,
          followerUser,
          followingsUser,
          FavoriteCount,
          LikeCount,
          FollowerCount,
          FollowingCount
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    User.findByPk(req.params.id)
      .then(user => {
        return res.render('editProfile', { user: helpers.getUser(req), profile: user.toJSON() })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user
              .update({
                name: req.body.name,
                image: file ? img.data.link : user.image
              })
              .then(user => {
                req.flash('success_messages', 'user was successfully to update')
                res.redirect(`/users/${user.id}`)
              })
          })
          .catch(err => next(err))
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user
            .update({
              name: req.body.name,
              image: user.image
            })
            .then(user => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
        })
        .catch(err => next(err))
    }
  },
  addFavorite: (req, res, next) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy().then(restaurant => {
          return res.redirect('back')
        })
      })
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy().then(restaurant => {
          return res.redirect('back')
        })
      })
      .catch(err => next(err))
  },
  getTopUser: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        // 整理 users 資料
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: helpers
            .getUser(req)
            .Followings.map(d => d.id)
            .includes(user.id)
        }))
        // 依追蹤者人數排序清單
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users: users })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    return Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.params.userId
    })
      .then(followship => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },

  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        followship.destroy().then(followship => {
          return res.redirect('back')
        })
      })
      .catch(err => next(err))
  }
}

module.exports = userController
