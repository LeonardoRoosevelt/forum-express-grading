const fs = require('fs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant

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
  getUser: (req, res) => {
    const userId = req.params.id
    User.findByPk(userId).then(user => {
      Comment.findAndCountAll({ include: Restaurant, where: { userId } }).then(result => {
        const totalComment = Math.ceil(result.count) || 0
        const arr = result.rows.map(r => ({
          ...r.dataValues,
          restaurantImg: r.dataValues.Restaurant.image
        }))
        const set = new Set()
        const data = arr.filter(item => (!set.has(item.RestaurantId) ? set.add(item.RestaurantId) : false))
        const differentRest = data.length

        return res.render('profile', {
          user: helpers.getUser(req),
          profile: user.toJSON(),
          totalComment: totalComment,
          differentRest: differentRest,
          comments: data
        })
      })
    })
  },
  editUser: (req, res) => {
    User.findByPk(req.params.id).then(user => {
      return res.render('editProfile', { user: helpers.getUser(req), profile: user.toJSON() })
    })
  },
  putUser: (req, res) => {
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
  }
}

module.exports = userController
